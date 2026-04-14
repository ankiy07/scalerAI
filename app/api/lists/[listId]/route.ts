import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import List from '@/lib/db/models/List';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  await dbConnect();
  try {
    const { listId } = await params;
    const body = await req.json();
    const list = await List.findByIdAndUpdate(listId, body, { new: true });
    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  await dbConnect();
  try {
    const { listId } = await params;
    const list = await List.findByIdAndDelete(listId);
    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }
    // Note: In a real app, you'd also delete associated cards here
    return NextResponse.json({ message: 'List deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
