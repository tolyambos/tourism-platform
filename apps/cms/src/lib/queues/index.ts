import { contentGenerationQueue, contentGenerationWorker } from './content-generation.queue';
import { deploymentQueue, deploymentWorker } from './deployment.queue';
import { redis } from './config';

// Export queues
export { contentGenerationQueue, deploymentQueue };

// Initialize workers (only in production or when explicitly enabled)
export function initializeWorkers() {
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_WORKERS === 'true') {
    console.log('Initializing background workers...');
    
    // Workers are already created in their respective files
    // This function just ensures they're imported and running
    
    contentGenerationWorker.on('ready', () => {
      console.log('Content generation worker ready');
    });
    
    deploymentWorker.on('ready', () => {
      console.log('Deployment worker ready');
    });
  }
}

// Graceful shutdown
export async function shutdownQueues() {
  console.log('Shutting down queues...');
  
  await contentGenerationWorker.close();
  await deploymentWorker.close();
  await contentGenerationQueue.close();
  await deploymentQueue.close();
  await redis.quit();
  
  console.log('Queues shut down successfully');
}

// Handle process termination
process.on('SIGTERM', shutdownQueues);
process.on('SIGINT', shutdownQueues);