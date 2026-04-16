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
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="h-[56px] sm:h-[64px] lg:h-[72px] bg-white/60 backdrop-blur-xl border-b border-outline-variant/10 sticky top-0 z-50 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-on-surface">Workspace</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface-container-high border-2 border-white shadow-sm flex items-center justify-center text-on-surface text-[12px] sm:text-[14px] font-black uppercase tracking-tight">
            A
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="flex items-center justify-between mb-6 sm:mb-8 lg:mb-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center">
              <LayoutGrid className="w-4 h-4 text-on-surface-variant" strokeWidth={2.5} />
            </div>
            <h2 className="text-[11px] font-black text-outline uppercase tracking-widest leading-none">
              All Boards
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {boards.map((board) => (
            <Link
              key={board._id.toString()}
              href={`/board/${board._id}`}
              className="group relative h-[150px] sm:h-[165px] lg:h-[180px] bg-white rounded-[24px] sm:rounded-[28px] lg:rounded-[32px] p-5 sm:p-6 lg:p-8 transition-all duration-300 flex flex-col items-center justify-center overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_24px_50px_rgba(0,0,0,0.08)] border border-outline-variant/10"
            >
              {/* Board Accent - Kept for visual flair */}
              <div
                className="absolute top-0 right-0 w-24 h-24 blur-3xl opacity-20 -mr-8 -mt-8 rounded-full"
                style={{ backgroundColor: board.background || '#0a84ff' }}
              />

              {/* Small Dot Indicator - Absolute positioned so it doesn't mess with centering */}
              <div
                className="absolute top-6 left-6 w-3 h-3 rounded-full"
                style={{ backgroundColor: board.background || '#0a84ff' }}
              />

              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-on-surface tracking-tight leading-tight group-hover:text-tertiary transition-colors text-center">
                {board.title}
              </h3>
            </Link>
          ))}

          <CreateBoardButton />
        </div>
      </div>
    </main>
  );
}
