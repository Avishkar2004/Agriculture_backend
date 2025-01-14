import { redis } from "../config/redis.js";

const cacheMiddleware = async (req, res, next) => {
  const cacheKey = req.originalUrl; // Use the requeset URl as the cache key
  const cacheData = await redis.get(cacheKey);

  if (cacheData) {
    // console.log("Cache hit");
    return res.json(JSON.parse(cacheData));
  }
  res.sendResponse = res.json;
  res.json = (body) => {
    redis.setex(cacheKey, 3600, JSON.stringify(body)); // Cache data for 1 hour
    res.sendResponse(body);
  };
  next();
};

export default cacheMiddleware;
