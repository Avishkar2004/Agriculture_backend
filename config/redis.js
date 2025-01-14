import Redis from "ioredis";

export const redis = new Redis({
  host: "localhost", // Use 'redis' if running inside Docker Compose
  port: 6379,
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});
