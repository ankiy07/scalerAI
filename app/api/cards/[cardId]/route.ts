import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Card from '@/lib/db/models/Card';
import User from '@/lib/db/models/User';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  await dbConnect();
  try {
    const { cardId } = await params;
    const card = await Card.findById(cardId).populate('members');
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }
    return NextResponse.json(card);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  await dbConnect();
  try {
    const { cardId } = await params;
    const body = await req.json();
    const card = await Card.findByIdAndUpdate(cardId, body, { new: true });
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }
    return NextResponse.json(card);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  await dbConnect();
  try {
    const { cardId } = await params;
    const card = await Card.findByIdAndDelete(cardId);
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Card deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
