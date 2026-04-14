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
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isAddingChecklistItem, setIsAddingChecklistItem] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          setAllUsers(data);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };
    fetchUsers();
  }, []);

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

  const addChecklistItem = async () => {
    if (!newChecklistItem.trim()) {
      setIsAddingChecklistItem(false);
      return;
    }
    const newItem = { text: newChecklistItem, isCompleted: false };
    const newChecklists = [...(card.checklists || []), newItem];

    const updated = { ...card, checklists: newChecklists };
    onUpdate(updated);
    setNewChecklistItem('');
    setIsAddingChecklistItem(false);

    await fetch(`/api/cards/${card._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checklists: newChecklists }),
    });
  };

  const deleteChecklistItem = async (index: number) => {
    const newChecklists = card.checklists.filter((_: any, i: number) => i !== index);
    const updated = { ...card, checklists: newChecklists };
    onUpdate(updated);

    await fetch(`/api/cards/${card._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checklists: newChecklists }),
    });
  };

  const updateCardField = async (field: string, value: any) => {
    const updated = { ...card, [field]: value };
    onUpdate(updated);

    await fetch(`/api/cards/${card._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl bg-[#1c1c1e] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden animate-scale-in border border-white/[0.08]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] flex items-center justify-center apple-transition z-10"
        >
          <X className="w-4 h-4 text-[#a1a1a6]" strokeWidth={2.5} />
        </button>

        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex gap-3 pr-10">
            <div className="w-8 h-8 rounded-lg bg-[#2c2c2e] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Layout className="w-4 h-4 text-[#a1a1a6]" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[17px] font-semibold text-[#f5f5f7] tracking-[-0.02em] leading-snug">
                {card.title}
              </h2>
              <p className="text-[13px] text-[#636366] mt-1">
                in list <span className="text-[#a1a1a6] font-medium">{card.listTitle || 'this list'}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row p-6 gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-6 min-w-0">
            {/* Metadata */}
            <div className="flex flex-wrap gap-5">
              {card.members?.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-semibold text-[#636366] uppercase tracking-[0.04em] mb-2">Members</h3>
                  <div className="flex -space-x-1">
                    {card.members.map((member: any, idx: number) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full border-2 border-[#1c1c1e] bg-gradient-to-br from-[#5e5ce6] to-[#bf5af2] flex items-center justify-center text-[11px] text-white font-semibold hover:scale-110 apple-transition cursor-pointer"
                        title={member.name}
                      >
                        {member.name?.charAt(0)?.toUpperCase()}
                      </div>
                    ))}
                    <button className="w-8 h-8 rounded-full bg-[#2c2c2e] border-2 border-[#1c1c1e] flex items-center justify-center text-[#636366] hover:text-[#a1a1a6] hover:bg-[#3a3a3c] apple-transition">
                      <PlusIcon />
                    </button>
                  </div>
                </div>
              )}

              {card.labels?.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-semibold text-[#636366] uppercase tracking-[0.04em] mb-2">Labels</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {card.labels.map((label: any, idx: number) => (
                      <div
                        key={idx}
                        className="h-7 px-3 rounded-lg flex items-center text-white text-[11px] font-semibold"
                        style={{ backgroundColor: getLabelColor(label.color) }}
                      >
                        {label.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {card.dueDate && (
                <div>
                  <h3 className="text-[11px] font-semibold text-[#636366] uppercase tracking-[0.04em] mb-2">Due Date</h3>
                  <div className="flex items-center gap-2 bg-[#2c2c2e] px-3 py-1.5 rounded-lg text-[13px] text-[#f5f5f7] font-medium cursor-pointer hover:bg-[#3a3a3c] apple-transition">
                    <Calendar className="w-3.5 h-3.5 text-[#a1a1a6]" strokeWidth={2} />
                    <span>{format(new Date(card.dueDate), 'MMM d, h:mm a')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#2c2c2e] flex items-center justify-center flex-shrink-0">
                  <AlignLeft className="w-4 h-4 text-[#a1a1a6]" strokeWidth={2} />
                </div>
                <h3 className="font-semibold text-[14px] text-[#f5f5f7]">Description</h3>
                {description && !isEditingDesc && (
                  <button
                    onClick={() => setIsEditingDesc(true)}
                    className="ml-auto text-[12px] font-medium px-3 py-1 rounded-lg bg-[#2c2c2e] hover:bg-[#3a3a3c] text-[#a1a1a6] apple-transition"
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
                      className="w-full min-h-[96px] p-3 rounded-xl border border-white/[0.1] focus:border-[#0a84ff] focus:ring-2 focus:ring-[#0a84ff]/20 outline-none bg-[#2c2c2e] text-[13px] text-[#f5f5f7] resize-none apple-transition placeholder-[#636366]"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveDescription}
                        className="bg-[#0a84ff] hover:bg-[#409cff] text-white px-4 py-1.5 rounded-lg font-medium text-[13px] apple-transition active:scale-95"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setIsEditingDesc(false); setDescription(card.description || ''); }}
                        className="hover:bg-[#2c2c2e] px-4 py-1.5 rounded-lg font-medium text-[13px] text-[#a1a1a6] apple-transition"
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
                        ? 'cursor-text whitespace-pre-wrap text-[13px] text-[#f5f5f7] leading-relaxed'
                        : 'bg-[#2c2c2e] hover:bg-[#3a3a3c] min-h-[40px] flex items-center cursor-pointer'
                    }`}
                  >
                    {description || (
                      <span className="text-[13px] font-medium text-[#636366]">
                        Add a more detailed description…
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Checklists */}
            {((card.checklists && card.checklists.length > 0) || isAddingChecklistItem) && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#2c2c2e] flex items-center justify-center flex-shrink-0">
                    <CheckSquare className="w-4 h-4 text-[#a1a1a6]" strokeWidth={2} />
                  </div>
                  <h3 className="font-semibold text-[14px] text-[#f5f5f7] flex-1">Checklist</h3>
                  <button className="text-[12px] font-medium px-3 py-1 rounded-lg bg-[#2c2c2e] hover:bg-[#3a3a3c] text-[#a1a1a6] apple-transition">
                    Delete
                  </button>
                </div>

                <div className="ml-11 space-y-3">
                  {/* Progress */}
                  <div className="flex items-center gap-3">
                    <span className={`text-[12px] tabular-nums w-8 font-semibold ${
                      progressPercent === 100 ? 'text-[#30d158]' : 'text-[#636366]'
                    }`}>
                      {progressPercent}%
                    </span>
                    <div className="flex-1 h-1.5 bg-[#2c2c2e] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${progressPercent === 100 ? 'bg-[#30d158]' : 'bg-[#0a84ff]'}`}
                        style={{ width: `${progressPercent}%`, transition: 'width 0.4s ease' }}
                      />
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-0.5">
                    {card.checklists.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="group flex items-start gap-3 px-2.5 py-2 rounded-lg hover:bg-white/[0.04] apple-transition cursor-pointer relative"
                      >
                        <div
                          className="flex items-start gap-3 flex-1"
                          onClick={() => toggleChecklistItem(idx)}
                        >
                          <div className={`mt-0.5 w-[18px] h-[18px] rounded-md border-[1.5px] flex items-center justify-center apple-transition flex-shrink-0 ${
                            item.isCompleted
                              ? 'bg-[#0a84ff] border-[#0a84ff]'
                              : 'bg-transparent border-[#636366] group-hover:border-[#a1a1a6]'
                          }`}>
                            {item.isCompleted && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                          </div>
                          <span className={`text-[13px] leading-snug apple-transition ${
                            item.isCompleted ? 'text-[#636366] line-through' : 'text-[#f5f5f7]'
                          }`}>
                            {item.text}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteChecklistItem(idx)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-white/10 text-[#636366] hover:text-[#ff375f] apple-transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {isAddingChecklistItem ? (
                    <div className="space-y-2 animate-slide-up">
                      <input
                        autoFocus
                        value={newChecklistItem}
                        onChange={(e) => setNewChecklistItem(e.target.value)}
                        placeholder="Add an item…"
                        className="w-full p-2 rounded-lg border border-white/[0.1] focus:border-[#0a84ff] focus:ring-2 focus:ring-[#0a84ff]/20 outline-none bg-[#2c2c2e] text-[13px] text-[#f5f5f7] apple-transition placeholder-[#636366]"
                        onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={addChecklistItem}
                          className="bg-[#0a84ff] hover:bg-[#409cff] text-white px-3 py-1 rounded-lg font-medium text-[12px] apple-transition active:scale-95"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setIsAddingChecklistItem(false)}
                          className="hover:bg-[#2c2c2e] px-3 py-1 rounded-lg font-medium text-[12px] text-[#a1a1a6] apple-transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingChecklistItem(true)}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-[#2c2c2e] hover:bg-[#3a3a3c] text-[#a1a1a6] text-[13px] font-medium apple-transition"
                    >
                      <PlusIcon />
                      Add an item
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-44 space-y-5 flex-shrink-0">
            <div>
              <h3 className="text-[11px] font-semibold text-[#636366] uppercase tracking-[0.04em] mb-2">Add to card</h3>
              <div className="flex flex-col gap-1">
                <div className="relative">
                  <SidebarButton
                    icon={<UserIcon className="w-4 h-4" strokeWidth={2} />}
                    label="Members"
                    onClick={() => setActivePopover(activePopover === 'members' ? null : 'members')}
                  />
                  {activePopover === 'members' && (
                    <Popover title="Members" onClose={() => setActivePopover(null)}>
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Search members…"
                          className="w-full bg-[#1c1c1e] border border-white/10 rounded-lg p-2 text-[13px] outline-none focus:border-[#0a84ff]"
                        />
                        <div className="space-y-1">
                          <h4 className="text-[11px] font-semibold text-[#636366] uppercase">Board members</h4>
                          {allUsers.map((user: any) => {
                            const isMember = card.members?.some((m: any) => (typeof m === 'string' ? m === user._id : m._id === user._id));
                            return (
                              <button
                                key={user._id}
                                onClick={() => {
                                  const newMembers = isMember
                                    ? card.members.filter((m: any) => (typeof m === 'string' ? m !== user._id : m._id !== user._id))
                                    : [...(card.members || []), user._id];
                                  updateCardField('members', newMembers);
                                }}
                                className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 apple-transition"
                              >
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#5e5ce6] to-[#bf5af2] flex items-center justify-center text-[11px] text-white font-semibold">
                                  {user.name.charAt(0)}
                                </div>
                                <span className="flex-1 text-left text-[13px]">{user.name}</span>
                                {isMember && <Check className="w-4 h-4 text-[#0a84ff]" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </Popover>
                  )}
                </div>

                <div className="relative">
                  <SidebarButton
                    icon={<Tag className="w-4 h-4" strokeWidth={2} />}
                    label="Labels"
                    onClick={() => setActivePopover(activePopover === 'labels' ? null : 'labels')}
                  />
                  {activePopover === 'labels' && (
                    <Popover title="Labels" onClose={() => setActivePopover(null)}>
                      <div className="space-y-4">
                        <div className="grid grid-cols-5 gap-2">
                          {['green', 'yellow', 'orange', 'red', 'purple', 'blue', 'sky', 'lime', 'pink', 'black'].map(color => (
                            <button
                              key={color}
                              className="h-8 rounded-lg apple-transition hover:scale-110 active:scale-95"
                              style={{ backgroundColor: getLabelColor(color) }}
                              onClick={() => {
                                const newLabel = { text: '', color };
                                updateCardField('labels', [...(card.labels || []), newLabel]);
                              }}
                            />
                          ))}
                        </div>
                        <div className="space-y-1.5">
                          {card.labels?.map((label: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 group">
                              <input
                                value={label.text}
                                onChange={(e) => {
                                  const newLabels = [...card.labels];
                                  newLabels[idx].text = e.target.value;
                                  updateCardField('labels', newLabels);
                                }}
                                className="flex-1 bg-[#1c1c1e] border border-white/10 rounded-lg px-2 py-1.5 text-[13px] outline-none"
                                placeholder="Label text…"
                              />
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getLabelColor(label.color) }} />
                              <button
                                onClick={() => {
                                  updateCardField('labels', card.labels.filter((_: any, i: number) => i !== idx));
                                }}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-[#636366] hover:text-[#ff375f] apple-transition"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Popover>
                  )}
                </div>

                <SidebarButton
                  icon={<CheckSquare className="w-4 h-4" strokeWidth={2} />}
                  label="Checklist"
                  onClick={() => {
                    if (!card.checklists || card.checklists.length === 0) {
                      updateCardField('checklists', []);
                      setIsAddingChecklistItem(true);
                    }
                  }}
                />

                <div className="relative">
                  <SidebarButton
                    icon={<Calendar className="w-4 h-4" strokeWidth={2} />}
                    label="Dates"
                    onClick={() => setActivePopover(activePopover === 'dates' ? null : 'dates')}
                  />
                  {activePopover === 'dates' && (
                    <Popover title="Dates" onClose={() => setActivePopover(null)}>
                      <div className="space-y-4">
                        <input
                          type="datetime-local"
                          value={card.dueDate ? new Date(card.dueDate).toISOString().slice(0, 16) : ''}
                          onChange={(e) => updateCardField('dueDate', e.target.value)}
                          className="w-full bg-[#1c1c1e] border border-white/10 rounded-lg p-2 text-[13px] outline-none focus:border-[#0a84ff] [color-scheme:dark]"
                        />
                        <button
                          onClick={() => updateCardField('dueDate', null)}
                          className="w-full bg-[#ff375f]/20 hover:bg-[#ff375f]/30 text-[#ff375f] px-3 py-2 rounded-lg font-medium text-[13px] apple-transition"
                        >
                          Remove
                        </button>
                      </div>
                    </Popover>
                  )}
                </div>
                <SidebarButton icon={<Paperclip className="w-4 h-4" strokeWidth={2} />} label="Attachment" />
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold text-[#636366] uppercase tracking-[0.04em] mb-2">Actions</h3>
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

const Popover = ({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) => (
  <div className="absolute top-0 right-full mr-2 w-64 bg-[#2c2c2e] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10 p-3 z-50 animate-scale-in origin-right">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-[12px] font-semibold text-[#636366] uppercase tracking-[0.04em]">{title}</h3>
      <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10 text-[#636366] hover:text-[#a1a1a6] apple-transition">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
    {children}
  </div>
);

const SidebarButton = ({ icon, label, variant, onClick }: { icon: any; label: string; variant?: string; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-[13px] apple-transition ${
      variant === 'danger'
        ? 'text-[#ff375f] hover:bg-[#ff375f]/10'
        : 'bg-[#2c2c2e] hover:bg-[#3a3a3c] text-[#f5f5f7]'
    }`}
  >
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
    pink: '#ff2d55',
    black: '#8e8e93',
  };
  return colors[color] || color;
}

const PlusIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

export default CardDetailModal;
