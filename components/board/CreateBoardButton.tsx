'use client';

import React, { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const BOARD_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
];

const BOARD_COLORS = [
  '#0071e3',
  '#5e5ce6',
  '#bf5af2',
  '#ff375f',
  '#ff9f0a',
  '#30d158',
  '#64d2ff',
  '#5856d6',
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
      <div className="h-28 rounded-xl bg-[var(--surface)] p-4 shadow-[var(--shadow-lg)] border border-[var(--border-strong)] animate-scale-in flex flex-col justify-between">
        <input
          autoFocus
          type="text"
          placeholder="Board title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleCreate()}
          className="w-full bg-transparent text-[15px] font-semibold text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none"
          disabled={isLoading}
        />
        <div className="flex items-center justify-between">
          {/* Color Picker */}
          <div className="flex items-center gap-1.5">
            {BOARD_COLORS.slice(0, 5).map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-5 h-5 rounded-full apple-transition ${
                  selectedColor === color
                    ? 'ring-2 ring-offset-1 ring-[var(--accent)] scale-110'
                    : 'hover:scale-110'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setIsCreating(false); setTitle(''); }}
              className="p-1 rounded-md hover:bg-[var(--surface-secondary)] apple-transition"
            >
              <X className="w-4 h-4 text-[var(--text-tertiary)]" />
            </button>
            <button
              onClick={handleCreate}
              disabled={isLoading || !title.trim()}
              className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-40 text-white px-3 py-1 rounded-lg font-medium text-xs apple-transition shadow-sm active:scale-95 flex items-center gap-1.5"
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
      className="h-28 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-secondary)] apple-transition p-4 flex items-center justify-center gap-2 text-[var(--text-secondary)] font-medium text-[14px] border border-dashed border-[var(--border-strong)] hover:border-[var(--accent)] hover:text-[var(--accent)] active:scale-[0.98] shadow-[var(--shadow-sm)]"
    >
      <Plus className="w-5 h-5" strokeWidth={2} />
      <span>Create new board</span>
    </button>
  );
};

export default CreateBoardButton;
