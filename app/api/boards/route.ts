import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Board from '@/lib/db/models/Board';

export async function GET() {
  await dbConnect();
  try {
    const boards = await Board.find({}).sort({ createdAt: -1 });
    return NextResponse.json(boards);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const board = await Board.create(body);
    return NextResponse.json(board, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
