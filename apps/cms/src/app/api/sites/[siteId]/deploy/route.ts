import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@tourism/database';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { siteId } = await params;
  
  try {
    // Get site details
    const site = await prisma.site.findUnique({
      where: { id: siteId }
    });
    
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }
    
    // In a real implementation, this would trigger a Vercel deployment
    // For now, we'll simulate it
    const deploymentUrl = site.domain || `https://${site.subdomain}.tourism-platform.com`;
    
    // Create deployment record
    const deployment = await prisma.deployment.create({
      data: {
        siteId: site.id,
        status: 'SUCCESS',
        url: deploymentUrl,
        environment: 'PRODUCTION',
        metadata: {
          deployedBy: user.id
        },
        completedAt: new Date()
      }
    });
    
    // Update site status
    await prisma.site.update({
      where: { id: siteId },
      data: { 
        status: 'PUBLISHED',
        domain: site.domain || null
      }
    });
    
    // Also publish all pages
    await prisma.page.updateMany({
      where: { siteId },
      data: { status: 'PUBLISHED' }
    });
    
    // Trigger revalidation on the website template
    if (process.env.WEBSITE_REVALIDATION_URL) {
      try {
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
      } catch (error) {
        console.error('Failed to revalidate website:', error);
      }
    }
    
    return NextResponse.json({ 
      success: true,
      url: deploymentUrl
    });
    
  } catch (error) {
    console.error('Error deploying site:', error);
    return NextResponse.json(
      { error: 'Failed to deploy site' },
      { status: 500 }
    );
  }
}