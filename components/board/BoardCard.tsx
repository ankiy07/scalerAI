'use client';

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { AlignLeft, Calendar, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';

interface BoardCardProps {
  card: any;
  index: number;
  onClick: () => void;
}

const BoardCard: React.FC<BoardCardProps> = ({ card, index, onClick }) => {
  const completedChecklistItems = card.checklists?.filter((i: any) => i.isCompleted).length || 0;
  const totalChecklistItems = card.checklists?.length || 0;
  const isChecklistComplete = totalChecklistItems > 0 && completedChecklistItems === totalChecklistItems;

  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided, snapshot) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          onClick={onClick}
          className={`kanban-card group border-white/60 ${
            snapshot.isDragging ? 'rotate-[2deg] shadow-elevation scale-[1.02] border-white' : ''
          }`}
        >
          {/* Bezel Glint (Top Edge) */}
          <div className="absolute top-0 left-0 right-0 h-px bg-white/40 rounded-t-lg" />
          {/* Labels */}
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {card.labels.map((label: any, idx: number) => (
                <div
                  key={idx}
                  className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white"
                  style={{ backgroundColor: getLabelColor(label.color) }}
                  title={label.text}
                >
                  {label.text}
                </div>
              ))}
            </div>
          )}

          <h3 className="text-[14px] text-on-surface font-bold leading-tight tracking-tight mb-3">
            {card.title}
          </h3>

          {/* Badges */}
          {(card.description || totalChecklistItems > 0 || card.dueDate) && (
            <div className="flex flex-wrap items-center gap-3 pt-3 mt-1 border-t border-outline-variant/10">
              <div className="flex bg-background/50 px-2 py-1 rounded-lg border border-outline-variant/5 shadow-inner-soft gap-2.5">
                {card.description && (
                  <div title="Has description" className="text-on-surface-variant/60">
                    <AlignLeft className="w-3.5 h-3.5" strokeWidth={3} />
                  </div>
                )}
  
                {totalChecklistItems > 0 && (
                  <div
                    className={`flex items-center gap-1 text-[11px] font-bold ${
                      isChecklistComplete
                        ? 'text-tertiary'
                        : 'text-on-surface-variant/60'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" strokeWidth={3} />
                    <span className="tabular-nums">{completedChecklistItems}/{totalChecklistItems}</span>
                  </div>
                )}
  
                {card.dueDate && (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-on-surface-variant/60">
                    <Calendar className="w-3.5 h-3.5" strokeWidth={3} />
                    <span>{format(new Date(card.dueDate), 'MMM d')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Members */}
          {card.members && card.members.length > 0 && (
            <div className="flex justify-end mt-4">
              <div className="flex -space-x-2">
                {card.members.map((member: any, idx: number) => (
                  <div
                    key={idx}
                    className="w-7 h-7 rounded-full border-2 border-surface-container-lowest bg-surface-container-high flex items-center justify-center text-[10px] text-on-surface font-black"
                    title={member.name || 'Member'}
                  >
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      member.name?.charAt(0)?.toUpperCase() || 'M'
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

function getLabelColor(color: string) {
  const colors: Record<string, string> = {
    green: '#30d158',
    yellow: '#ffd60a',
    orange: '#ff9f0a',
    red: '#ff375f',
    purple: '#bf5af2',
    blue: '#0a84ff',
    sky: '#64d2ff',
    lime: '#30d158',
    pink: '#ff2d55',
    black: '#8e8e93',
  };
  return colors[color] || color;
}

export default BoardCard;
