import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Card from '@/lib/db/models/Card';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  await dbConnect();
  try {
    const { boardId } = await params;
    const archivedCards = await Card.find({ boardId, isArchived: true })
      .sort({ updatedAt: -1 })
      .populate('members');

    return NextResponse.json(archivedCards);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
