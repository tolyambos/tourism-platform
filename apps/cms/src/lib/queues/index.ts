import { contentGenerationQueue, contentGenerationWorker } from './content-generation.queue';
import { deploymentQueue, deploymentWorker } from './deployment.queue';
import { redis } from './config';

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
      await redis.ping();
      
      // Workers are already created in their respective files
      // This function just ensures they're imported and running
      
      contentGenerationWorker.on('ready', () => {
        console.log('Content generation worker ready');
      });
      
      deploymentWorker.on('ready', () => {
        console.log('Deployment worker ready');
      });
      
      contentGenerationWorker.on('error', (err) => {
        console.error('Content generation worker error:', err);
      });
      
      deploymentWorker.on('error', (err) => {
        console.error('Deployment worker error:', err);
      });
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
      await contentGenerationWorker.close();
      await deploymentWorker.close();
      await contentGenerationQueue.close();
      await deploymentQueue.close();
      await redis.quit();
    }
    
    console.log('Queues shut down successfully');
  } catch (error) {
    console.error('Error during queue shutdown:', error);
  }
}

// Handle process termination
process.on('SIGTERM', shutdownQueues);
process.on('SIGINT', shutdownQueues);