import Link from 'next/link';
import dbConnect from '@/lib/db/mongoose';
import Board from '@/lib/db/models/Board';
import { LayoutGrid, Clock, Star } from 'lucide-react';
import CreateBoardButton from '@/components/board/CreateBoardButton';

export const dynamic = 'force-dynamic';

export default async function Home() {
  await dbConnect();
  const boards = await Board.find({}).sort({ createdAt: -1 });

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Top Navigation — Apple-style frosted glass */}
      <nav className="h-14 border-b border-[var(--border)] glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0071e3] to-[#40a9ff] flex items-center justify-center shadow-sm">
              <LayoutGrid className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-[15px] text-[var(--text-primary)] tracking-tight">
              Boards
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white text-xs font-semibold shadow-sm ring-2 ring-white/80">
              A
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Section Header */}
        <div className="flex items-center gap-2.5 mb-6">
          <Clock className="w-5 h-5 text-[var(--text-secondary)]" strokeWidth={2} />
          <h2 className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Recently viewed
          </h2>
        </div>

        {/* Board Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {boards.map((board) => (
            <Link
              key={board._id.toString()}
              href={`/board/${board._id}`}
              className="group relative h-28 rounded-xl p-4 apple-transition flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: board.background || '#0071e3' }}
            >
              {/* Gradient overlay for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-xl" />
              
              <div className="relative z-10 flex items-start justify-between">
                <h3 className="text-white font-semibold text-[15px] leading-snug tracking-tight drop-shadow-sm">
                  {board.title}
                </h3>
                <Star className="w-4 h-4 text-white/60 opacity-0 group-hover:opacity-100 apple-transition" />
              </div>

              {/* Subtle hover overlay */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-[0.06] apple-transition rounded-xl" />
            </Link>
          ))}

          <CreateBoardButton />
        </div>
      </div>
    </main>
  );
}
