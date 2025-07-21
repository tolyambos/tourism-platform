import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@tourism/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { templateId } = await params;
  
  try {
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: {
        _count: {
          select: { sections: true }
        }
      }
    });
    
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    
    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { templateId } = await params;
  const body = await request.json();
  
  try {
    const template = await prisma.template.update({
      where: { id: templateId },
      data: {
        name: body.name,
        componentName: body.componentName,
        schema: body.schema,
        systemPrompt: body.systemPrompt,
        userPromptTemplate: body.userPromptTemplate,
        isActive: body.isActive,
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}