import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Board from '@/lib/db/models/Board';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  await dbConnect();
  try {
    const { boardId } = await params;
    const board = await Board.findById(boardId);
    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }
    return NextResponse.json(board);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  await dbConnect();
  try {
    const { boardId } = await params;
    const body = await req.json();
    const board = await Board.findByIdAndUpdate(boardId, body, { new: true });
    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }
    return NextResponse.json(board);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  await dbConnect();
  try {
    const { boardId } = await params;
    const board = await Board.findByIdAndDelete(boardId);
    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }
    // Note: In a real app, you'd also delete associated lists and cards here
    return NextResponse.json({ message: 'Board deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
