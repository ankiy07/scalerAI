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
          className={`kanban-list ${snapshot.isDragging ? 'shadow-2xl rotate-[2deg]' : ''}`}
        >
          {/* List Header */}
          <div
            {...provided.dragHandleProps}
            className="px-3.5 pt-3 pb-1.5 flex items-center justify-between cursor-grab active:cursor-grabbing"
          >
            <h2 className="font-semibold text-[#f5f5f7] text-[13px] tracking-[-0.01em] truncate flex-1 py-0.5">
              {list.title}
            </h2>
            <div className="flex items-center gap-0.5">
              <span className="text-[11px] font-medium text-[#636366] tabular-nums mr-1">
                {cards.length}
              </span>
              <button className="p-1 rounded-md hover:bg-white/[0.06] text-[#636366] hover:text-[#a1a1a6] apple-transition">
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
                className={`flex-1 overflow-y-auto px-2 py-0.5 min-h-[4px] apple-transition ${
                  snapshot.isDraggingOver ? 'bg-[#0a84ff]/[0.04]' : ''
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
          <div className="px-2 pb-2 pt-0.5">
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
                  className="w-full p-2.5 rounded-xl border border-white/[0.1] focus:border-[#0a84ff] focus:ring-2 focus:ring-[#0a84ff]/20 outline-none text-[13px] text-[#f5f5f7] bg-[#2c2c2e] min-h-[60px] resize-none apple-transition placeholder-[#636366]"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddCard}
                    className="bg-[#0a84ff] hover:bg-[#409cff] text-white px-3 py-1.5 rounded-lg font-medium text-[12px] apple-transition active:scale-95"
                  >
                    Add card
                  </button>
                  <button
                    onClick={() => setIsAddingCard(false)}
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] apple-transition"
                  >
                    <X className="w-4 h-4 text-[#636366]" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingCard(true)}
                className="w-full flex items-center gap-1.5 p-2 rounded-lg hover:bg-white/[0.04] text-[#636366] hover:text-[#a1a1a6] text-[13px] font-medium apple-transition"
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
