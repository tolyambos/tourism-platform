import { 
  contentGenerationQueue, 
  getContentGenerationWorker 
} from './content-generation.queue';
import { 
  deploymentQueue, 
  getDeploymentWorker 
} from './deployment.queue';
import { createRedisConnection } from './config';

// Export queues
export { contentGenerationQueue, deploymentQueue };

// Initialize workers (only in production or when explicitly enabled)
export async function initializeWorkers() {
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_WORKERS === 'true') {
    // Check if Redis is available before initializing workers
    if (!process.env.REDIS_HOST && !process.env.REDIS_URL) {
      console.log('Redis not configured, skipping worker initialization');
      return;
    }
    
    try {
      console.log('Initializing background workers...');
      
      // Test Redis connection first
      const redis = createRedisConnection();
      if (!redis) {
        console.log('Redis connection not available');
        return;
      }
      
      await redis.ping();
      console.log('Redis connection successful');
      
      // Initialize workers
      const contentWorker = getContentGenerationWorker();
      const deployWorker = getDeploymentWorker();
      
      if (contentWorker) {
        console.log('Content generation worker initialized');
      }
      
      if (deployWorker) {
        console.log('Deployment worker initialized');
      }
    } catch (error) {
      console.error('Failed to initialize workers:', error);
      console.log('Application will continue without background workers');
    }
  }
}

// Graceful shutdown
export async function shutdownQueues() {
  try {
    console.log('Shutting down queues...');
    
    if (process.env.REDIS_HOST || process.env.REDIS_URL) {
      const contentWorker = getContentGenerationWorker();
      const deployWorker = getDeploymentWorker();
      const redis = createRedisConnection();
      
      if (contentWorker) {
        await contentWorker.close();
      }
      if (deployWorker) {
        await deployWorker.close();
      }
      if (redis) {
        await redis.quit();
      }
    }
    
    console.log('Queues shut down successfully');
  } catch (error) {
    console.error('Error during queue shutdown:', error);
  }
}

// Handle process termination
process.on('SIGTERM', shutdownQueues);
process.on('SIGINT', shutdownQueues);