'use client';

import React from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import BoardCard from './BoardCard';
import { MoreHorizontal, Plus, X } from 'lucide-react';

interface BoardListProps {
  list: any;
  index: number;
  cards: any[];
  onAddCard: (listId: string, title: string) => Promise<any>;
  onCardClick: (card: any) => void;
}

const BoardList: React.FC<BoardListProps> = ({ list, index, cards, onAddCard, onCardClick }) => {
  const [isAddingCard, setIsAddingCard] = React.useState(false);
  const [newCardTitle, setNewCardTitle] = React.useState('');

  const handleAddCard = async () => {
    if (!newCardTitle.trim()) {
      setIsAddingCard(false);
      return;
    }
    await onAddCard(list._id, newCardTitle);
    setNewCardTitle('');
    setIsAddingCard(false);
  };

  return (
    <Draggable draggableId={list._id} index={index}>
      {(provided, snapshot) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className={`kanban-list ${
            snapshot.isDragging ? 'shadow-xl rotate-[2deg] scale-[1.02]' : ''
          }`}
        >
          {/* List Header */}
          <div
            {...provided.dragHandleProps}
            className="px-4 pt-3.5 pb-2 flex items-center justify-between cursor-grab active:cursor-grabbing"
          >
            <h2 className="font-semibold text-[var(--text-primary)] text-[14px] tracking-tight truncate flex-1">
              {list.title}
            </h2>
            <div className="flex items-center gap-0.5">
              <span className="text-[12px] font-medium text-[var(--text-tertiary)] tabular-nums mr-1">
                {cards.length}
              </span>
              <button className="p-1 rounded-md hover:bg-black/[0.04] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] apple-transition">
                <MoreHorizontal className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Cards Area */}
          <Droppable droppableId={list._id} type="card">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`flex-1 overflow-y-auto px-2.5 py-1 min-h-[8px] apple-transition ${
                  snapshot.isDraggingOver ? 'bg-[var(--accent)]/[0.03]' : ''
                }`}
              >
                {cards.map((card, idx) => (
                  <BoardCard
                    key={card._id}
                    card={card}
                    index={idx}
                    onClick={() => onCardClick({ ...card, listTitle: list.title })}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* List Footer */}
          <div className="px-2.5 pb-2.5 pt-1">
            {isAddingCard ? (
              <div className="space-y-2 animate-slide-up">
                <textarea
                  autoFocus
                  placeholder="Enter a title for this card…"
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCard();
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-strong)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none text-[13px] text-[var(--text-primary)] bg-[var(--surface)] min-h-[68px] resize-none shadow-[var(--shadow-sm)] apple-transition"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddCard}
                    className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-3 py-1.5 rounded-lg font-medium text-[13px] apple-transition shadow-sm active:scale-95"
                  >
                    Add card
                  </button>
                  <button
                    onClick={() => setIsAddingCard(false)}
                    className="p-1.5 rounded-lg hover:bg-black/[0.04] apple-transition"
                  >
                    <X className="w-4 h-4 text-[var(--text-tertiary)]" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingCard(true)}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-black/[0.03] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[13px] font-medium apple-transition"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                <span>Add a card</span>
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default BoardList;
