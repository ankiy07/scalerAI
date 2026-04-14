import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Card from '@/lib/db/models/Card';
import User from '@/lib/db/models/User';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  await dbConnect();
  try {
    const { boardId } = await params;
    const cards = await Card.find({ boardId }).sort({ order: 1 }).populate('members');
    return NextResponse.json(cards);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
