import IORedis from 'ioredis';

// Redis connection - only create if Redis is configured
let redisInstance: IORedis | null = null;

export function createRedisConnection() {
  if (!redisInstance) {
    if (process.env.REDIS_URL) {
      try {
        // Use REDIS_URL if available (Railway standard)
        console.log('Connecting to Redis:', process.env.REDIS_URL.replace(/:[^:@]*@/, ':****@'));
        
        // For Railway, use the URL directly as ioredis handles it better
        redisInstance = new IORedis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          enableReadyCheck: false,
          lazyConnect: true,
          connectTimeout: 10000,
          retryStrategy: (times) => {
            if (times > 3) {
              console.error('Redis connection failed after 3 retries');
              return null; // Stop retrying
            }
            const delay = Math.min(times * 50, 2000);
            console.log(`Redis connection retry ${times}, waiting ${delay}ms`);
            return delay;
          },
          // Railway-specific settings
          family: 4, // Force IPv4
          enableOfflineQueue: false,
          reconnectOnError: (err) => {
            const targetError = 'READONLY';
            if (err.message.includes(targetError)) {
              // Only reconnect when the error contains "READONLY"
              return true;
            }
            return false;
          }
        });
      } catch (error) {
        console.error('Error parsing Redis URL:', error);
        // Fall back to direct URL if parsing fails
        redisInstance = new IORedis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          enableReadyCheck: false,
          lazyConnect: true,
          connectTimeout: 10000,
          retryStrategy: (times) => {
            if (times > 3) {
              console.error('Redis connection failed after 3 retries');
              return null; // Stop retrying
            }
            const delay = Math.min(times * 50, 2000);
            console.log(`Redis connection retry ${times}, waiting ${delay}ms`);
            return delay;
          }
        });
      }
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
      console.warn('Redis is not configured. Queue operations will be skipped.');
      // Return a no-op function for any method call
      if (typeof prop === 'string') {
        return () => {
          console.warn(`Redis method ${prop} called but Redis is not available`);
          return Promise.resolve(null);
        };
      }
      return null;
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