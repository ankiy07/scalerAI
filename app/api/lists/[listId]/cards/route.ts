import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Card from '@/lib/db/models/Card';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  await dbConnect();
  try {
    const { listId } = await params;
    const body = await req.json();
    
    // Auto-calculate order
    if (body.order === undefined) {
      const count = await Card.countDocuments({ listId });
      body.order = count;
    }
    
    const card = await Card.create({ ...body, listId });
    return NextResponse.json(card, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  await dbConnect();
  try {
    const body = await req.json(); // Array of { id, order, listId }
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Body must be an array' }, { status: 400 });
    }

    const bulkOps = body.map((item: any) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order, listId: item.listId } },
      },
    }));

    await Card.bulkWrite(bulkOps);
    return NextResponse.json({ message: 'Cards reordered successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
