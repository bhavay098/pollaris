// Serializes poll mutations within this server process so a response cannot
// be inserted while an owner is changing the poll definition. Deployments
// with multiple server instances should use a distributed lock or transaction.
const locks = new Map();

const withPollLock = async (key, task) => {
  const previous = locks.get(key) || Promise.resolve();
  let release;
  const current = new Promise((resolve) => {
    release = resolve;
  });

  locks.set(key, current);
  await previous;

  try {
    return await task();
  } finally {
    release();
    if (locks.get(key) === current) {
      locks.delete(key);
    }
  }
};

export { withPollLock };
