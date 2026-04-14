import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import List from '@/lib/db/models/List';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  await dbConnect();
  try {
    const { boardId } = await params;
    const lists = await List.find({ boardId }).sort({ order: 1 });
    return NextResponse.json(lists);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  await dbConnect();
  try {
    const { boardId } = await params;
    const body = await req.json();
    
    // Auto-calculate order if not provided
    if (body.order === undefined) {
      const count = await List.countDocuments({ boardId });
      body.order = count;
    }
    
    const list = await List.create({ ...body, boardId });
    return NextResponse.json(list, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  await dbConnect();
  try {
    const body = await req.json(); // Array of { id, order }
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Body must be an array' }, { status: 400 });
    }

    const bulkOps = body.map((item: any) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));

    await List.bulkWrite(bulkOps);
    return NextResponse.json({ message: 'Lists reordered successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
