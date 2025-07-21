import { Queue, Worker, Job } from 'bullmq';
import { createRedisConnection } from './config';
import { prisma } from '@tourism/database';

interface DeploymentData {
  siteId: string;
  deploymentId: string;
  environment: 'production' | 'preview';
}

// Lazy queue initialization
let _deploymentQueue: Queue<DeploymentData> | null = null;
let _deploymentWorker: Worker<DeploymentData> | null = null;

export function getDeploymentQueue() {
  if (!_deploymentQueue) {
    const redis = createRedisConnection();
    if (redis) {
      _deploymentQueue = new Queue<DeploymentData>('deployment', {
        connection: redis
      });
    }
  }
  return _deploymentQueue;
}

export function getDeploymentWorker() {
  if (!_deploymentWorker) {
    const redis = createRedisConnection();
    if (redis) {
      _deploymentWorker = new Worker<DeploymentData>(
        'deployment',
        async (job: Job<DeploymentData>) => {
          const { siteId, deploymentId, environment } = job.data;
          
          console.log(`Processing deployment job ${job.id}`, job.data);
          
          try {
            // Update deployment status
            await prisma.deployment.update({
              where: { id: deploymentId },
              data: {
                status: 'BUILDING',
                startedAt: new Date()
              }
            });
            
            await job.updateProgress(10);
            
            // Get site details
            const site = await prisma.site.findUnique({
              where: { id: siteId },
              include: {
                pages: {
                  where: { status: 'PUBLISHED' },
                  include: {
                    sections: {
                      include: {
                        content: true,
                        template: true
                      }
                    }
                  }
                }
              }
            });
            
            if (!site) {
              throw new Error('Site not found');
            }
            
            await job.updateProgress(20);
            
            // In a real implementation, this would:
            // 1. Build the Next.js site
            // 2. Upload to Vercel/Netlify
            // 3. Configure domain settings
            // 4. Update DNS records
            
            // Simulate deployment steps
            await simulateDeploymentStep('Building site...', 2000);
            await job.updateProgress(40);
            
            await simulateDeploymentStep('Optimizing assets...', 1500);
            await job.updateProgress(60);
            
            await simulateDeploymentStep('Uploading to CDN...', 2500);
            await job.updateProgress(80);
            
            await simulateDeploymentStep('Configuring domain...', 1000);
            await job.updateProgress(90);
            
            const deploymentUrl = site.domain || `https://${site.subdomain}.tourism-platform.com`;
            
            // Update deployment as completed
            await prisma.deployment.update({
              where: { id: deploymentId },
              data: {
                status: 'SUCCESS',
                completedAt: new Date(),
                url: deploymentUrl,
                metadata: {
                  environment,
                  buildTime: 7000,
                  deploymentProvider: 'vercel',
                  siteId: site.id
                }
              }
            });
            
            await job.updateProgress(100);
            
            // Trigger cache revalidation
            if (process.env.WEBSITE_REVALIDATION_URL) {
              await fetch(process.env.WEBSITE_REVALIDATION_URL, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.REVALIDATION_TOKEN}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  type: 'all',
                  siteId: site.id
                })
              });
            }
            
            return {
              deploymentUrl,
              buildTime: 7000
            };
            
          } catch (error) {
            console.error('Deployment failed:', error);
            
            // Update deployment as failed
            await prisma.deployment.update({
              where: { id: deploymentId },
              data: {
                status: 'FAILED',
                completedAt: new Date(),
                error: error instanceof Error ? error.message : 'Unknown error'
              }
            });
            
            throw error;
          }
        },
        {
          connection: redis
        }
      );

      // Queue event listeners
      _deploymentWorker.on('completed', (job) => {
        console.log(`Deployment job ${job.id} completed`);
      });

      _deploymentWorker.on('failed', (job, err) => {
        console.error(`Deployment job ${job?.id} failed:`, err);
      });
    }
  }
  return _deploymentWorker;
}

// Helper function to simulate deployment steps
async function simulateDeploymentStep(step: string, duration: number) {
  console.log(`Deployment step: ${step}`);
  await new Promise(resolve => setTimeout(resolve, duration));
}

// Export proxy objects for backward compatibility
export const deploymentQueue = new Proxy({} as Queue<DeploymentData>, {
  get(target, prop) {
    const queue = getDeploymentQueue();
    if (!queue) {
      throw new Error('Deployment queue not available - Redis not configured');
    }
    return (queue as any)[prop];
  }
});

export const deploymentWorker = new Proxy({} as Worker<DeploymentData>, {
  get(target, prop) {
    const worker = getDeploymentWorker();
    if (!worker) {
      throw new Error('Deployment worker not available - Redis not configured');
    }
    return (worker as any)[prop];
  }
});