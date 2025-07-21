import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@tourism/database';
import crypto from 'crypto';

// Verify Vercel webhook signature
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;
  
  const hash = crypto
    .createHmac('sha1', secret)
    .update(payload)
    .digest('hex');
  
  return `sha1=${hash}` === signature;
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-vercel-signature');
    const rawBody = await request.text();
    
    // Verify webhook signature
    if (process.env.VERCEL_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature(
        rawBody,
        signature,
        process.env.VERCEL_WEBHOOK_SECRET
      );
      
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }
    
    const event = JSON.parse(rawBody);
    
    console.log('Received Vercel webhook:', event.type);
    
    switch (event.type) {
      case 'deployment.created':
        await handleDeploymentCreated(event);
        break;
        
      case 'deployment.succeeded':
        await handleDeploymentSucceeded(event);
        break;
        
      case 'deployment.error':
      case 'deployment.failed':
        await handleDeploymentFailed(event);
        break;
        
      case 'deployment.canceled':
        await handleDeploymentCanceled(event);
        break;
        
      default:
        console.log(`Unhandled webhook event: ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleDeploymentCreated(event: { payload: { deployment: Record<string, unknown>; project: Record<string, unknown> } }) {
  const { deployment, project } = event.payload;
  
  // Find site by project name or metadata
  const site = await prisma.site.findFirst({
    where: {
      OR: [
        { subdomain: project.name as string },
        { metadata: { path: ['vercelProjectId'], equals: project.id as string } }
      ]
    }
  });
  
  if (site) {
    await prisma.deployment.create({
      data: {
        siteId: site.id,
        status: 'BUILDING',
        environment: ((deployment.target as string || 'production').toUpperCase() === 'PREVIEW' ? 'STAGING' : 'PRODUCTION') as 'STAGING' | 'PRODUCTION',
        url: deployment.url as string,
        metadata: {
          vercelDeploymentId: deployment.id as string,
          vercelProjectId: project.id as string,
          creator: (deployment.creator as Record<string, unknown>)?.email as string
        }
      }
    });
  }
}

async function handleDeploymentSucceeded(event: { payload: { deployment: Record<string, unknown> } }) {
  const { deployment } = event.payload;
  
  const deploymentRecord = await prisma.deployment.findFirst({
    where: {
      metadata: {
        path: ['vercelDeploymentId'],
        equals: deployment.id as string
      }
    }
  });
  
  if (deploymentRecord) {
    await prisma.deployment.update({
      where: { id: deploymentRecord.id },
      data: {
        status: 'SUCCESS',
        completedAt: new Date(),
        url: deployment.url as string,
        metadata: {
          ...deploymentRecord.metadata as Record<string, unknown>,
          buildTime: deployment.buildingAt 
            ? new Date().getTime() - new Date(deployment.buildingAt as string).getTime()
            : null
        }
      }
    });
  }
}

async function handleDeploymentFailed(event: { payload: { deployment: Record<string, unknown> } }) {
  const { deployment } = event.payload;
  
  const deploymentRecord = await prisma.deployment.findFirst({
    where: {
      metadata: {
        path: ['vercelDeploymentId'],
        equals: deployment.id as string
      }
    }
  });
  
  if (deploymentRecord) {
    await prisma.deployment.update({
      where: { id: deploymentRecord.id },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        error: (deployment.errorMessage as string) || 'Deployment failed'
      }
    });
  }
}

async function handleDeploymentCanceled(event: { payload: { deployment: Record<string, unknown> } }) {
  const { deployment } = event.payload;
  
  const deploymentRecord = await prisma.deployment.findFirst({
    where: {
      metadata: {
        path: ['vercelDeploymentId'],
        equals: deployment.id as string
      }
    }
  });
  
  if (deploymentRecord) {
    await prisma.deployment.update({
      where: { id: deploymentRecord.id },
      data: {
        status: 'CANCELLED',
        completedAt: new Date()
      }
    });
  }
}