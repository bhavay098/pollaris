// Redis Pub/Sub clients used by the Socket.IO adapter. Separate publisher and
// subscriber connections are required because Redis subscriptions dedicate a
// connection to receiving messages.
import Redis from "ioredis";
import { createAdapter } from "@socket.io/redis-adapter";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is required for Socket.IO synchronization");
}

const pubClient = new Redis(redisUrl, { lazyConnect: true });
const subClient = pubClient.duplicate();

pubClient.on("error", (error) => {
  console.error("Redis publisher error:", error.message);
});

subClient.on("error", (error) => {
  console.error("Redis subscriber error:", error.message);
});

const connectRedis = async () => {
  try {
    await Promise.all([pubClient.connect(), subClient.connect()]);
    console.log("Redis Pub/Sub connected");
  } catch (error) {
    pubClient.disconnect();
    subClient.disconnect();
    throw new Error(`Redis connection failed: ${error.message}`, {
      cause: error,
    });
  }
};

const createRedisAdapter = () => createAdapter(pubClient, subClient);

const closeRedis = async () => {
  await Promise.all(
    [pubClient, subClient].map(async (client) => {
      if (client.status === "ready") {
        await client.quit();
      } else if (client.status !== "end") {
        client.disconnect();
      }
    }),
  );
};

export { closeRedis, connectRedis, createRedisAdapter };
