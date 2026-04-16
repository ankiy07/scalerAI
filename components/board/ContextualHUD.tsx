'use client';

import React from 'react';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';

interface ContextualHUDProps {
  onAddList: () => void;
  onSearchFocus: () => void;
  onOpenFilters: () => void;
  boardTitle: string;
}

const ContextualHUD: React.FC<ContextualHUDProps> = ({
  onAddList,
  onSearchFocus,
  onOpenFilters,
  boardTitle
}) => {
  return (
    <div className="hud-bar glass flex items-center gap-1 animate-slide-up">
      {/* Search Trigger */}
      <button
        onClick={onSearchFocus}
        className="p-2 sm:p-3 rounded-full hover:bg-black/5 text-on-surface-variant transition-colors"
        title="Search cards"
      >
        <Search className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      
      <button
        onClick={onOpenFilters}
        className="p-2 sm:p-3 rounded-full hover:bg-black/5 text-on-surface-variant transition-colors"
        title="Filter cards"
      >
        <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <div className="w-px h-5 sm:h-6 bg-outline-variant/20 mx-0.5 sm:mx-1" />

      {/* Main Action: Add List */}
      <button
        onClick={onAddList}
        className="btn-primary-gradient px-4 sm:px-6 h-9 sm:h-11 flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-tertiary/20"
      >
        <Plus className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
        <span className="text-[12px] sm:text-[14px] hidden sm:inline">New List</span>
      </button>

    </div>
  );
};

export default ContextualHUD;
