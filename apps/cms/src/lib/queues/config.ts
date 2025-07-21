import IORedis from 'ioredis';

// Redis connection - lazy initialization to avoid connection errors at startup
let redisInstance: IORedis | null = null;

export const redis = new Proxy({} as IORedis, {
  get(target, prop) {
    if (!redisInstance) {
      redisInstance = new IORedis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        lazyConnect: true
      });
    }
    return (redisInstance as any)[prop];
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