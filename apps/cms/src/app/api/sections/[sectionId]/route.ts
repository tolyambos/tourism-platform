import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@tourism/database';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { sectionId } = await params;
  
  try {
    // Delete all content first
    await prisma.sectionContent.deleteMany({
      where: { sectionId }
    });

    // Delete the section
    await prisma.section.delete({
      where: { id: sectionId }
    });

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error deleting section:', error);
    return NextResponse.json(
      { error: 'Failed to delete section' },
      { status: 500 }
    );
  }
}