'use client';

import React, { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
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
      <div className="h-[100px] rounded-xl bg-[#1c1c1e] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.4)] border border-white/[0.08] animate-scale-in flex flex-col justify-between">
        <input
          autoFocus
          type="text"
          placeholder="Board title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleCreate()}
          className="w-full bg-transparent text-[14px] font-semibold text-[#f5f5f7] placeholder-[#636366] focus:outline-none"
          disabled={isLoading}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {BOARD_COLORS.slice(0, 6).map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-5 h-5 rounded-full apple-transition ${
                  selectedColor === color ? 'ring-2 ring-offset-1 ring-offset-[#1c1c1e] ring-[#0a84ff] scale-110' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setIsCreating(false); setTitle(''); }}
              className="p-1 rounded-md hover:bg-white/[0.06] apple-transition"
            >
              <X className="w-4 h-4 text-[#636366]" />
            </button>
            <button
              onClick={handleCreate}
              disabled={isLoading || !title.trim()}
              className="bg-[#0a84ff] hover:bg-[#409cff] disabled:opacity-40 text-white px-3 py-1 rounded-lg font-medium text-[12px] apple-transition active:scale-95 flex items-center gap-1.5"
            >
              {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
              {isLoading ? 'Creating' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsCreating(true)}
      className="h-[100px] rounded-xl bg-[#1c1c1e]/60 hover:bg-[#1c1c1e] apple-transition p-4 flex items-center justify-center gap-2 text-[#636366] hover:text-[#a1a1a6] font-medium text-[13px] border border-dashed border-white/[0.1] hover:border-[#0a84ff]/50 hover:text-[#0a84ff] active:scale-[0.98]"
    >
      <Plus className="w-4 h-4" strokeWidth={2} />
      <span>Create new board</span>
    </button>
  );
};

export default CreateBoardButton;
