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
    
    // Get the actual Vercel deployment URL
    const vercelAppUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://tourism-platform-website-template.vercel.app';
    const deploymentUrl = `${vercelAppUrl}/en?subdomain=${site.subdomain}`;
    
    // Create deployment record
    await prisma.deployment.create({
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
    
    // Log deployment info
    console.log(`Site deployed: ${site.subdomain}`);
    console.log(`Accessible at: ${deploymentUrl}`);
    console.log(`Note: This updates the database only. The Vercel app reads from this database.`);
    
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