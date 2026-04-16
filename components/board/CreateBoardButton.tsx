'use client';

import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const BOARD_COLORS = [
  '#0a84ff',
  '#5e5ce6',
  '#bf5af2',
  '#ff375f',
  '#ff9f0a',
  '#30d158',
  '#64d2ff',
  '#ff2d55',
];

const CreateBoardButton = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState(BOARD_COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!title.trim()) {
      setIsCreating(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, background: selectedColor }),
      });

      if (res.ok) {
        const board = await res.json();
        router.push(`/board/${board._id}`);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to create board:', error);
    } finally {
      setIsLoading(false);
      setIsCreating(false);
      setTitle('');
    }
  };

  if (isCreating) {
    return (
      <div className="h-[150px] sm:h-[165px] lg:h-[180px] rounded-[24px] sm:rounded-[28px] lg:rounded-[32px] bg-white p-5 sm:p-6 lg:p-8 shadow-2xl border border-outline-variant/10 animate-scale-in flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest font-black text-outline">New Project</span>
            <input
              autoFocus
              type="text"
              placeholder="Enter board title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleCreate()}
              className="w-full bg-transparent text-base sm:text-lg lg:text-xl font-bold text-on-surface placeholder-on-surface-variant/40 focus:outline-none tracking-tight"
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {BOARD_COLORS.slice(0, 8).map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full transition-all ${selectedColor === color ? 'ring-2 ring-primary ring-offset-2 scale-110 shadow-md' : 'hover:scale-110 opacity-70 hover:opacity-100'
                  }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/5">
          <button
            onClick={() => { setIsCreating(false); setTitle(''); }}
            className="px-6 py-2.5 rounded-[16px] font-bold text-on-surface-variant text-[11px] uppercase tracking-widest hover:bg-black/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isLoading || !title.trim()}
            className="btn-primary-gradient px-8 py-2.5 rounded-[16px] text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-tertiary/20"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Plus className="w-4 h-4 text-white" strokeWidth={3} />}
            <span>{isLoading ? 'Creating' : 'Start Board'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsCreating(true)}
      className="h-[150px] sm:h-[165px] lg:h-[180px] rounded-[24px] sm:rounded-[28px] lg:rounded-[32px] bg-surface-container-low hover:bg-surface-container-high transition-all duration-500 p-5 sm:p-6 lg:p-8 flex flex-col items-center justify-center gap-3 sm:gap-4 text-on-surface-variant hover:text-tertiary border border-dashed border-outline-variant hover:border-tertiary/50 group"
    >
      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm group-hover:scale-110 transition-all duration-500 group-hover:rotate-90">
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </div>
      <div className="flex flex-col items-center">
        <span className="font-bold text-[14px] tracking-tight">Create Workspace</span>
        <span className="text-[11px] font-medium opacity-60">Start a new project board</span>
      </div>
    </button>
  );
};

export default CreateBoardButton;
