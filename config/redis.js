import Redis from "ioredis";

const redis = new Redis({
  host: "localhost", // Use 'redis' if running inside Docker Compose
  port: 6379,
});

export default redis;
