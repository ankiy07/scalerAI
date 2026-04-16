'use client';

import React from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import BoardCard from './BoardCard';
import { MoreHorizontal, Plus, X, Edit2, Trash2 } from 'lucide-react';

interface BoardListProps {
  list: any;
  index: number;
  cards: any[];
  onAddCard: (listId: string, title: string) => Promise<any>;
  onCardClick: (card: any) => void;
  onUpdateList: (listId: string, newTitle: string) => Promise<void>;
  onDeleteList: (listId: string) => Promise<void>;
}

const BoardList: React.FC<BoardListProps> = ({ list, index, cards, onAddCard, onCardClick, onUpdateList, onDeleteList }) => {
  const [isAddingCard, setIsAddingCard] = React.useState(false);
  const [newCardTitle, setNewCardTitle] = React.useState('');
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(list.title);

  const handleUpdateTitle = async () => {
    if (!editTitle.trim() || editTitle === list.title) {
      setEditTitle(list.title);
      setIsEditingTitle(false);
      return;
    }
    await onUpdateList(list._id, editTitle);
    setIsEditingTitle(false);
  };

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
            className="px-3 sm:px-5 pt-4 sm:pt-5 pb-2 sm:pb-3 flex items-center justify-between cursor-grab active:cursor-grabbing"
          >
            <div className="flex flex-col flex-1 min-w-0 mr-2">
              <span className="text-[10px] uppercase tracking-widest font-black text-outline">Column</span>
              {isEditingTitle ? (
                <input
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleUpdateTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateTitle();
                    if (e.key === 'Escape') {
                      setEditTitle(list.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  className="font-bold text-on-surface text-[15px] tracking-tight truncate border-b-2 border-tertiary outline-none bg-transparent py-0 px-0"
                />
              ) : (
                <h2
                  onDoubleClick={() => setIsEditingTitle(true)}
                  className="font-bold text-on-surface text-[15px] tracking-tight truncate leading-tight cursor-text"
                >
                  {list.title}
                </h2>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <div className="bg-white/50 px-2.5 py-1 rounded-full border border-outline-variant/10">
                <span className="text-[11px] font-bold text-on-surface-variant tabular-nums">
                  {cards.length}
                </span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`p-2 rounded-full hover:bg-black/5 text-on-surface-variant transition-colors ${isMenuOpen ? 'bg-black/5 text-on-surface' : ''}`}
                >
                  <MoreHorizontal className="w-4 h-4" strokeWidth={2.5} />
                </button>

                {isMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[60]"
                      onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }}
                    />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border border-outline-variant/10 p-2 z-[70] animate-scale-in origin-top-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMenuOpen(false);
                          setIsEditingTitle(true);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-[13px] font-bold text-on-surface-variant hover:text-on-surface transition-colors"
                      >
                        <Edit2 className="w-4 h-4" strokeWidth={2.5} />
                        Rename Column
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMenuOpen(false);
                          if (window.confirm('Are you sure you want to delete this specific column? All tasks inside will be deleted as well.')) {
                            onDeleteList(list._id);
                          }
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-error/10 text-[13px] font-bold text-error transition-colors mt-1"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                        Delete Column
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <Droppable droppableId={list._id} type="card">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`flex-1 overflow-y-auto px-3 py-1 min-h-[4px] transition-colors ${snapshot.isDraggingOver ? 'bg-tertiary/[0.03]' : ''
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
          <div className="px-2 sm:px-3 pb-3 sm:pb-4 pt-1 sm:pt-2">
            {isAddingCard ? (
              <div className="space-y-3 animate-slide-up bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl border border-outline-variant/10">
                <textarea
                  autoFocus
                  placeholder="Task description..."
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCard();
                    }
                  }}
                  className="w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border border-outline-variant/30 focus:border-tertiary focus:ring-1 focus:ring-tertiary/20 outline-none text-[13px] sm:text-[14px] text-on-surface bg-background min-h-[70px] sm:min-h-[80px] resize-none placeholder-on-surface-variant/40 font-medium transition-all shadow-inner"
                />
                <div className="flex items-center gap-2 justify-end pt-2 border-t border-outline-variant/5">
                  <button
                    onClick={() => setIsAddingCard(false)}
                    className="p-2 rounded-xl hover:bg-black/5 text-on-surface-variant"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={handleAddCard}
                    className="btn-primary-gradient px-4 py-2 rounded-xl text-[12px] uppercase tracking-widest font-black"
                  >
                    Create Card
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingCard(true)}
                className="w-full flex items-center gap-2 p-3 rounded-xl hover:bg-black/5 text-on-surface-variant hover:text-on-surface text-[13px] font-bold uppercase tracking-widest transition-all group"
              >
                <Plus className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" strokeWidth={3} />
                <span>Add Task</span>
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default BoardList;
