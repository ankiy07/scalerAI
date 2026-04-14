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
          className={`kanban-card group ${
            snapshot.isDragging ? 'rotate-[2deg] shadow-2xl scale-[1.02]' : ''
          }`}
        >
          {/* Labels */}
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {card.labels.map((label: any, idx: number) => (
                <div
                  key={idx}
                  className="h-[6px] w-10 rounded-full apple-transition group-hover:h-5 group-hover:w-auto group-hover:px-2 group-hover:flex group-hover:items-center"
                  style={{ backgroundColor: getLabelColor(label.color) }}
                  title={label.text}
                >
                  <span className="hidden group-hover:inline text-[10px] font-semibold text-white leading-none whitespace-nowrap">
                    {label.text}
                  </span>
                </div>
              ))}
            </div>
          )}

          <h3 className="text-[13px] text-[#f5f5f7] font-medium leading-snug tracking-[-0.01em]">
            {card.title}
          </h3>

          {/* Badges */}
          {(card.description || totalChecklistItems > 0 || card.dueDate) && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {card.description && (
                <div title="Has description" className="text-[#636366]">
                  <AlignLeft className="w-3.5 h-3.5" strokeWidth={2} />
                </div>
              )}

              {totalChecklistItems > 0 && (
                <div
                  className={`flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
                    isChecklistComplete
                      ? 'bg-[#30d158]/20 text-[#30d158]'
                      : completedChecklistItems > 0
                        ? 'bg-[#0a84ff]/15 text-[#0a84ff]'
                        : 'text-[#636366]'
                  }`}
                >
                  <CheckSquare className="w-3 h-3" strokeWidth={2.5} />
                  <span className="tabular-nums">{completedChecklistItems}/{totalChecklistItems}</span>
                </div>
              )}

              {card.dueDate && (
                <div className="flex items-center gap-1 text-[11px] font-medium text-[#a1a1a6] px-1.5 py-0.5 rounded-md bg-white/[0.06]">
                  <Calendar className="w-3 h-3" strokeWidth={2} />
                  <span>{format(new Date(card.dueDate), 'MMM d')}</span>
                </div>
              )}
            </div>
          )}

          {/* Members */}
          {card.members && card.members.length > 0 && (
            <div className="flex justify-end mt-2">
              <div className="flex -space-x-1.5">
                {card.members.map((member: any, idx: number) => (
                  <div
                    key={idx}
                    className="w-6 h-6 rounded-full border-[1.5px] border-[#2c2c2e] bg-gradient-to-br from-[#5e5ce6] to-[#bf5af2] flex items-center justify-center text-[10px] text-white font-semibold"
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
