import crypto from "node:crypto";
import { lockClient } from "../../common/config/redis.js";

// The local queue avoids Redis round trips between requests handled by this
// process. Redis makes the same lock work when requests are split across
// multiple server instances.
const locks = new Map();

// Redis removes the lock automatically if the owning process crashes. The
// renewal timer below extends this while a normal operation is still running.
const LOCK_TTL_MS = 30_000;
// Requests wait slightly longer than the TTL so a crashed owner has time to
// expire before another request gives up.
const LOCK_WAIT_TIMEOUT_MS = 35_000;
const LOCK_RETRY_MS = 100;

// Only the server that owns the lock may delete it. Comparing the token and
// deleting in one Redis script prevents another server from acquiring the lock
// between those two operations.
const RELEASE_LOCK_SCRIPT = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  end
  return 0
`;

// Extends the lock only when this server still owns it. A renewal from an old
// owner must never extend a lock that has already been acquired by another one.
const RENEW_LOCK_SCRIPT = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("pexpire", KEYS[1], ARGV[2])
  end
  return 0
`;

// Waiting asynchronously keeps the Node.js event loop available for other
// requests while a different server owns the poll lock.
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const acquireDistributedLock = async (key) => {
  const redisKey = `poll-lock:${key}`;
  const token = crypto.randomUUID();
  const deadline = Date.now() + LOCK_WAIT_TIMEOUT_MS;

  // SET NX makes acquisition atomic: exactly one server can win for a poll.
  while (Date.now() < deadline) {
    const acquired = await lockClient.set(redisKey, token, "PX", LOCK_TTL_MS, "NX");

    if (acquired === "OK") {
      return { redisKey, token };
    }

    await delay(LOCK_RETRY_MS);
  }

  throw new Error(`Timed out acquiring poll lock for ${key}`);
};

const releaseDistributedLock = async ({ redisKey, token }) => {
  await lockClient.eval(RELEASE_LOCK_SCRIPT, 1, redisKey, token);
};

const startLockRenewal = ({ redisKey, token }) => {
  // Renew at one-third of the TTL so temporary scheduling or network delays
  // do not normally cause a long-running operation to lose its lock.
  const renewal = setInterval(async () => {
    try {
      const renewed = await lockClient.eval(
        RENEW_LOCK_SCRIPT,
        1,
        redisKey,
        token,
        LOCK_TTL_MS,
      );

      if (renewed !== 1) {
        console.error(`Lost Redis lock ${redisKey} while renewing it`);
      }
    } catch (error) {
      console.error(`Failed to renew Redis lock ${redisKey}:`, error.message);
    }
  }, Math.floor(LOCK_TTL_MS / 3));

  renewal.unref?.();
  return renewal;
};

const withPollLock = async (key, task) => {
  // First serialize requests within this process. The Redis lock is acquired
  // after this queue so local requests do not repeatedly compete in Redis.
  const previous = locks.get(key) || Promise.resolve();
  let release;
  const current = new Promise((resolve) => {
    release = resolve;
  });

  locks.set(key, current);
  await previous;

  let distributedLock;
  let renewal;

  try {
    distributedLock = await acquireDistributedLock(key);
    renewal = startLockRenewal(distributedLock);
    // The callback contains the complete read/validate/write operation and
    // therefore observes a stable poll definition while it is running.
    return await task();
  } finally {
    if (renewal) {
      clearInterval(renewal);
    }

    if (distributedLock) {
      try {
        await releaseDistributedLock(distributedLock);
      } catch (error) {
        // The TTL is the fallback if Redis is unavailable during release.
        console.error(`Failed to release Redis lock ${distributedLock.redisKey}:`, error.message);
      }
    }

    release();
    if (locks.get(key) === current) {
      locks.delete(key);
    }
  }
};

export { withPollLock };
