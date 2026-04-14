import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db/mongoose';
import Board from '@/lib/db/models/Board';
import List from '@/lib/db/models/List';
import Card from '@/lib/db/models/Card';
import User from '@/lib/db/models/User';
import BoardContainer from '@/components/board/BoardContainer';

export const dynamic = 'force-dynamic';

export default async function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  await dbConnect();
  
  const { boardId } = await params;
  
  try {
    const board = await Board.findById(boardId);
    if (!board) return notFound();

    // Fetch lists and cards
    const [lists, cards] = await Promise.all([
      List.find({ boardId }).sort({ order: 1 }),
      Card.find({ boardId }).sort({ order: 1 }).populate('members'),
    ]);

    // Serialize MongoDB objects to plain objects for the client
    const serializedBoard = JSON.parse(JSON.stringify(board));
    const serializedLists = JSON.parse(JSON.stringify(lists));
    const serializedCards = JSON.parse(JSON.stringify(cards));

    return (
      <BoardContainer 
        board={serializedBoard} 
        initialLists={serializedLists} 
        initialCards={serializedCards} 
      />
    );
  } catch (error) {
    console.error('Error loading board:', error);
    return notFound();
  }
}
