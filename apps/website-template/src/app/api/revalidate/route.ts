import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// This endpoint will be called by the CMS when content is updated
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from the CMS
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.REVALIDATION_TOKEN;
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { type, path, tag } = body;
    
    if (type === 'path' && path) {
      // Revalidate a specific path
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, path });
    }
    
    if (type === 'tag' && tag) {
      // Revalidate by tag
      revalidateTag(tag);
      return NextResponse.json({ revalidated: true, tag });
    }
    
    if (type === 'all') {
      // Revalidate all pages
      revalidatePath('/', 'layout');
      return NextResponse.json({ revalidated: true, type: 'all' });
    }
    
    return NextResponse.json(
      { error: 'Invalid revalidation type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}