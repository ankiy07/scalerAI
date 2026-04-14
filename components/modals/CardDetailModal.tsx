'use client';

import React, { useState, useEffect } from 'react';
import {
  X, AlignLeft, CheckSquare, Calendar, User as UserIcon,
  Tag, Paperclip, Layout, Check, Archive, Trash2
} from 'lucide-react';
import { format } from 'date-fns';

interface CardDetailModalProps {
  card: any;
  onClose: () => void;
  onUpdate: (updatedCard: any) => void;
}

const CardDetailModal: React.FC<CardDetailModalProps> = ({ card, onClose, onUpdate }) => {
  const [description, setDescription] = useState(card.description || '');
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSaveDescription = async () => {
    const updated = { ...card, description };
    onUpdate(updated);
    setIsEditingDesc(false);

    await fetch(`/api/cards/${card._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    });
  };

  const toggleChecklistItem = async (index: number) => {
    const newChecklists = [...card.checklists];
    newChecklists[index].isCompleted = !newChecklists[index].isCompleted;

    const updated = { ...card, checklists: newChecklists };
    onUpdate(updated);

    await fetch(`/api/cards/${card._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checklists: newChecklists }),
    });
  };

  const completedCount = card.checklists?.filter((i: any) => i.isCompleted).length || 0;
  const totalCount = card.checklists?.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto pt-16 pb-16 px-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl bg-[var(--surface)] rounded-2xl shadow-[var(--shadow-xl)] overflow-hidden animate-scale-in border border-[var(--border)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-[var(--surface-secondary)] hover:bg-[var(--border-strong)] flex items-center justify-center apple-transition z-10"
        >
          <X className="w-4 h-4 text-[var(--text-secondary)]" strokeWidth={2.5} />
        </button>

        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex gap-3 pr-10">
            <div className="w-8 h-8 rounded-lg bg-[var(--surface-secondary)] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Layout className="w-4 h-4 text-[var(--text-secondary)]" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[18px] font-semibold text-[var(--text-primary)] tracking-tight leading-snug">
                {card.title}
              </h2>
              <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
                in list <span className="text-[var(--text-secondary)] font-medium">{card.listTitle || 'this list'}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row p-6 gap-6">
          {/* Main */}
          <div className="flex-1 space-y-6 min-w-0">
            {/* Metadata row */}
            <div className="flex flex-wrap gap-5">
              {card.members?.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Members</h3>
                  <div className="flex -space-x-1">
                    {card.members.map((member: any, idx: number) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full border-2 border-[var(--surface)] bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-[11px] text-white font-semibold shadow-sm hover:scale-110 apple-transition cursor-pointer"
                        title={member.name}
                      >
                        {member.name?.charAt(0)?.toUpperCase()}
                      </div>
                    ))}
                    <button className="w-8 h-8 rounded-full bg-[var(--surface-secondary)] border-2 border-[var(--surface)] flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--border)] apple-transition">
                      <PlusIcon />
                    </button>
                  </div>
                </div>
              )}

              {card.labels?.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Labels</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {card.labels.map((label: any, idx: number) => (
                      <div
                        key={idx}
                        className="h-7 px-3 rounded-lg flex items-center text-white text-[11px] font-semibold shadow-sm"
                        style={{ backgroundColor: getLabelColor(label.color) }}
                      >
                        {label.text}
                      </div>
                    ))}
                    <button className="h-7 px-2 rounded-lg bg-[var(--surface-secondary)] flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--border)] apple-transition">
                      <PlusIcon />
                    </button>
                  </div>
                </div>
              )}

              {card.dueDate && (
                <div>
                  <h3 className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Due Date</h3>
                  <div className="flex items-center gap-2 bg-[var(--surface-secondary)] px-3 py-1.5 rounded-lg text-[13px] text-[var(--text-primary)] font-medium cursor-pointer hover:bg-[var(--border)] apple-transition">
                    <Calendar className="w-3.5 h-3.5 text-[var(--text-secondary)]" strokeWidth={2} />
                    <span>{format(new Date(card.dueDate), 'MMM d, h:mm a')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--surface-secondary)] flex items-center justify-center flex-shrink-0">
                  <AlignLeft className="w-4 h-4 text-[var(--text-secondary)]" strokeWidth={2} />
                </div>
                <h3 className="font-semibold text-[14px] text-[var(--text-primary)]">Description</h3>
                {description && !isEditingDesc && (
                  <button
                    onClick={() => setIsEditingDesc(true)}
                    className="ml-auto text-[12px] font-medium px-3 py-1 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--border)] text-[var(--text-secondary)] apple-transition"
                  >
                    Edit
                  </button>
                )}
              </div>

              <div className="ml-11">
                {isEditingDesc ? (
                  <div className="space-y-2.5 animate-slide-up">
                    <textarea
                      autoFocus
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add a more detailed description…"
                      className="w-full min-h-[96px] p-3 rounded-xl border border-[var(--border-strong)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none bg-[var(--surface)] text-[13px] text-[var(--text-primary)] resize-none apple-transition"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveDescription}
                        className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-4 py-1.5 rounded-lg font-medium text-[13px] apple-transition shadow-sm active:scale-95"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setIsEditingDesc(false); setDescription(card.description || ''); }}
                        className="hover:bg-[var(--surface-secondary)] px-4 py-1.5 rounded-lg font-medium text-[13px] text-[var(--text-secondary)] apple-transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => !description && setIsEditingDesc(true)}
                    className={`p-3 rounded-xl apple-transition ${
                      description
                        ? 'cursor-text whitespace-pre-wrap text-[13px] text-[var(--text-primary)] leading-relaxed'
                        : 'bg-[var(--surface-secondary)] hover:bg-[var(--border)] min-h-[40px] flex items-center cursor-pointer'
                    }`}
                  >
                    {description || (
                      <span className="text-[13px] font-medium text-[var(--text-tertiary)]">
                        Add a more detailed description…
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Checklists */}
            {card.checklists?.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--surface-secondary)] flex items-center justify-center flex-shrink-0">
                    <CheckSquare className="w-4 h-4 text-[var(--text-secondary)]" strokeWidth={2} />
                  </div>
                  <h3 className="font-semibold text-[14px] text-[var(--text-primary)] flex-1">Checklist</h3>
                  <button className="text-[12px] font-medium px-3 py-1 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--border)] text-[var(--text-secondary)] apple-transition">
                    Delete
                  </button>
                </div>

                <div className="ml-11 space-y-3">
                  {/* Progress */}
                  <div className="flex items-center gap-3">
                    <span className={`text-[12px] tabular-nums w-8 font-semibold ${
                      progressPercent === 100 ? 'text-[#30d158]' : 'text-[var(--text-tertiary)]'
                    }`}>
                      {progressPercent}%
                    </span>
                    <div className="flex-1 h-1.5 bg-[var(--surface-secondary)] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full apple-transition ${
                          progressPercent === 100 ? 'bg-[#30d158]' : 'bg-[var(--accent)]'
                        }`}
                        style={{ width: `${progressPercent}%`, transition: 'width 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)' }}
                      />
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-0.5">
                    {card.checklists.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="group flex items-start gap-3 px-2.5 py-2 rounded-lg hover:bg-[var(--surface-secondary)] apple-transition cursor-pointer"
                        onClick={() => toggleChecklistItem(idx)}
                      >
                        <div className={`mt-0.5 w-[18px] h-[18px] rounded-md border-[1.5px] flex items-center justify-center apple-transition flex-shrink-0 ${
                          item.isCompleted
                            ? 'bg-[var(--accent)] border-[var(--accent)] shadow-sm'
                            : 'bg-[var(--surface)] border-[var(--text-tertiary)] group-hover:border-[var(--text-secondary)]'
                        }`}>
                          {item.isCompleted && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                        <span className={`text-[13px] leading-snug apple-transition ${
                          item.isCompleted
                            ? 'text-[var(--text-tertiary)] line-through'
                            : 'text-[var(--text-primary)]'
                        }`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--border)] text-[var(--text-secondary)] text-[13px] font-medium apple-transition ml-0.5">
                    <PlusIcon />
                    Add an item
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-44 space-y-5 flex-shrink-0">
            <div>
              <h3 className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Add to card</h3>
              <div className="flex flex-col gap-1">
                <SidebarButton icon={<UserIcon className="w-4 h-4" strokeWidth={2} />} label="Members" />
                <SidebarButton icon={<Tag className="w-4 h-4" strokeWidth={2} />} label="Labels" />
                <SidebarButton icon={<CheckSquare className="w-4 h-4" strokeWidth={2} />} label="Checklist" />
                <SidebarButton icon={<Calendar className="w-4 h-4" strokeWidth={2} />} label="Dates" />
                <SidebarButton icon={<Paperclip className="w-4 h-4" strokeWidth={2} />} label="Attachment" />
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Actions</h3>
              <div className="flex flex-col gap-1">
                <SidebarButton icon={<Archive className="w-4 h-4" strokeWidth={2} />} label="Archive" />
                <SidebarButton icon={<Trash2 className="w-4 h-4" strokeWidth={2} />} label="Delete" variant="danger" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SidebarButton = ({ icon, label, variant }: { icon: any; label: string; variant?: string }) => (
  <button className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-[13px] apple-transition ${
    variant === 'danger'
      ? 'text-[#ff375f] hover:bg-[#ff375f]/8'
      : 'bg-[var(--surface-secondary)] hover:bg-[var(--border)] text-[var(--text-primary)]'
  }`}>
    {icon}
    <span>{label}</span>
  </button>
);

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
    pink: '#ff375f',
    black: '#636366',
  };
  return colors[color] || color;
}

const PlusIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

export default CardDetailModal;
