import Link from 'next/link';
import dbConnect from '@/lib/db/mongoose';
import Board from '@/lib/db/models/Board';
import { LayoutGrid, Clock } from 'lucide-react';
import CreateBoardButton from '@/components/board/CreateBoardButton';

export const dynamic = 'force-dynamic';

export default async function Home() {
  await dbConnect();
  const boards = await Board.find({}).sort({ createdAt: -1 });

  return (
    <main className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="h-[52px] bg-[#1c1c1e] border-b border-white/[0.06] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0a84ff] to-[#5e5ce6] flex items-center justify-center">
              <LayoutGrid className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-[15px] text-[#f5f5f7] tracking-[-0.02em]">
              Boards
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#5e5ce6] to-[#bf5af2] flex items-center justify-center text-white text-[11px] font-semibold">
              A
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="w-4 h-4 text-[#636366]" strokeWidth={2} />
          <h2 className="text-[12px] font-semibold text-[#636366] uppercase tracking-[0.06em]">
            Recently viewed
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {boards.map((board) => (
            <Link
              key={board._id.toString()}
              href={`/board/${board._id}`}
              className="group relative h-[100px] rounded-xl p-4 apple-transition flex flex-col justify-between overflow-hidden hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: board.background || '#0a84ff' }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 rounded-xl" />
              <h3 className="relative text-white font-semibold text-[14px] leading-snug tracking-[-0.01em] drop-shadow-sm">
                {board.title}
              </h3>
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.08] apple-transition rounded-xl" />
            </Link>
          ))}

          <CreateBoardButton />
        </div>
      </div>
    </main>
  );
}
