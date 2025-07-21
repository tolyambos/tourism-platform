import IORedis from 'ioredis';

// Redis connection - only create if Redis is configured
let redisInstance: IORedis | null = null;

export function createRedisConnection() {
  if (!redisInstance) {
    if (process.env.REDIS_URL) {
      // Use REDIS_URL if available (Railway standard)
      redisInstance = new IORedis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        lazyConnect: true,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        }
      });
    } else if (process.env.REDIS_HOST) {
      // Fallback to individual connection params
      redisInstance = new IORedis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        lazyConnect: true,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        }
      });
    }
  }
  return redisInstance;
}

export const redis = new Proxy({} as IORedis, {
  get(target, prop) {
    const instance = createRedisConnection();
    if (!instance) {
      throw new Error('Redis is not configured. Please set REDIS_HOST or REDIS_URL environment variable.');
    }
    return (instance as IORedis)[prop as keyof IORedis];
  }
});

// Queue configuration
export const defaultQueueOptions = {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: {
      age: 24 * 3600, // 24 hours
      count: 100
    },
    removeOnFail: {
      age: 24 * 3600 * 7, // 7 days
    },
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
};

// Job types
export enum JobType {
  GENERATE_CONTENT = 'generate-content',
  GENERATE_IMAGE = 'generate-image',
  DEPLOY_SITE = 'deploy-site',
  REVALIDATE_CACHE = 'revalidate-cache',
  SEND_EMAIL = 'send-email'
}