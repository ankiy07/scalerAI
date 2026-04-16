'use client';

import React, { useState, useEffect } from 'react';
import {
  X, AlignLeft, CheckSquare, Calendar, User as UserIcon,
  Tag, Paperclip, Layout, Check, Archive, Trash2, Plus as PlusIcon, Search
} from 'lucide-react';
import { format } from 'date-fns';

interface CardDetailModalProps {
  card: any;
  onClose: () => void;
  onUpdate: (updatedCard: any) => void;
  onRemove: (cardId: string, action: 'archived' | 'deleted') => void;
}

const CardDetailModal: React.FC<CardDetailModalProps> = ({ card, onClose, onUpdate, onRemove }) => {
  const [description, setDescription] = useState(card.description || '');
  const [title, setTitle] = useState(card.title || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
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

  const handleSaveTitle = async () => {
    if (!title.trim() || title === card.title) {
      setTitle(card.title);
      setIsEditingTitle(false);
      return;
    }
    const updated = { ...card, title };
    onUpdate(updated);
    setIsEditingTitle(false);

    await fetch(`/api/cards/${card._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
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

  const handleArchive = async () => {
    const res = await fetch(`/api/cards/${card._id}/archive`, {
      method: 'POST',
    });

    if (!res.ok) return;

    onRemove(card._id, 'archived');
    onClose();
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/cards/${card._id}`, {
      method: 'DELETE',
    });

    if (!res.ok) return;

    onRemove(card._id, 'deleted');
    onClose();
  };

  const completedCount = card.checklists?.filter((i: any) => i.isCompleted).length || 0;
  const totalCount = card.checklists?.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-start justify-center overflow-y-auto sm:pt-10 lg:pt-16 pb-0 sm:pb-16 px-0 sm:px-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/10 backdrop-blur-xl" />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl bg-white rounded-t-[28px] sm:rounded-[32px] lg:rounded-[40px] shadow-elevation overflow-hidden animate-scale-in border border-white/60 ring-1 ring-black/[0.03] max-h-[92vh] sm:max-h-none overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bezel Glint (Top Highlight) */}
        <div className="absolute top-0 left-0 right-0 h-px bg-white/40 z-10" />
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3 sm:right-6 top-3 sm:top-6 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center transition-colors z-10"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-on-surface-variant" strokeWidth={2.5} />
        </button>

        {/* Header */}
        <div className="p-4 sm:p-6 lg:p-8 pb-0">
          <div className="flex gap-3 sm:gap-4 pr-8 sm:pr-12">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-surface-container-low flex items-center justify-center flex-shrink-0">
              <Layout className="w-4 h-4 sm:w-5 sm:h-5 text-on-surface-variant" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col group/title">
                <span className="text-[10px] uppercase tracking-widest font-black text-outline">Task Details</span>
                {isEditingTitle ? (
                  <input
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleSaveTitle}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                    className="text-lg sm:text-xl lg:text-2xl font-bold text-on-surface tracking-tight leading-tight bg-surface-container-low px-2 py-1 -ml-2 rounded-lg border-2 border-tertiary focus:outline-none w-full"
                  />
                ) : (
                  <h2 
                    onClick={() => setIsEditingTitle(true)}
                    className="text-lg sm:text-xl lg:text-2xl font-bold text-on-surface tracking-tight leading-tight cursor-text hover:bg-black/5 px-2 py-1 -ml-2 rounded-lg transition-all"
                  >
                    {card.title}
                  </h2>
                )}
              </div>
              <p className="text-[13px] text-on-surface-variant mt-1.5 font-medium">
                In column <span className="text-on-surface font-bold underline decoration-tertiary/20 underline-offset-4">{card.listTitle || 'this list'}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row p-4 sm:p-6 lg:p-8 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6 min-w-0">
            {/* Metadata */}
            <div className="flex flex-wrap gap-6">
              {card.members?.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black text-outline uppercase tracking-widest mb-3">Members</h3>
                  <div className="flex -space-x-2">
                    {card.members.map((member: any, idx: number) => (
                      <div
                        key={idx}
                        className="w-9 h-9 rounded-full border-2 border-white bg-surface-container-high flex items-center justify-center text-[12px] text-on-surface font-black hover:scale-110 transition-transform cursor-pointer"
                        title={member.name}
                      >
                        {member.name?.charAt(0)?.toUpperCase()}
                      </div>
                    ))}
                    <button className="w-9 h-9 rounded-full bg-white border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all shadow-sm">
                      <PlusIcon />
                    </button>
                  </div>
                </div>
              )}

              {card.labels?.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black text-outline uppercase tracking-widest mb-3">Labels</h3>
                  <div className="flex flex-wrap gap-2">
                    {card.labels.map((label: any, idx: number) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest"
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
                  <h3 className="text-[10px] font-black text-outline uppercase tracking-widest mb-3">Timeline</h3>
                  <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl text-[13px] text-on-surface font-bold cursor-pointer hover:bg-surface-container-high transition-colors">
                    <Calendar className="w-4 h-4 text-on-surface-variant" strokeWidth={2.5} />
                    <span>{format(new Date(card.dueDate), 'MMM d, h:mm a')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center flex-shrink-0">
                  <AlignLeft className="w-5 h-5 text-on-surface-variant" strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-[16px] text-on-surface tracking-tight">Description</h3>
                {description && !isEditingDesc && (
                  <button
                    onClick={() => setIsEditingDesc(true)}
                    className="ml-auto text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>

              <div className="ml-0 sm:ml-14">
                {isEditingDesc ? (
                  <div className="space-y-4 animate-slide-up">
                    <textarea
                      autoFocus
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add more details about this task..."
                      className="w-full min-h-[120px] p-4 rounded-2xl border border-outline-variant focus:border-tertiary outline-none bg-surface-container-low text-[14px] text-on-surface resize-none transition-all placeholder-on-surface-variant/40 font-medium"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveDescription}
                        className="btn-primary-gradient px-6 py-2 shadow-lg shadow-tertiary/20 text-[12px] uppercase tracking-widest"
                      >
                        Save Details
                      </button>
                      <button
                        onClick={() => { setIsEditingDesc(false); setDescription(card.description || ''); }}
                        className="hover:bg-black/5 px-6 py-2 rounded-xl font-bold text-[12px] text-on-surface-variant uppercase tracking-widest"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => !description && setIsEditingDesc(true)}
                    className={`p-5 rounded-[24px] transition-all border shadow-inner-soft ${description
                        ? 'cursor-text whitespace-pre-wrap text-[14px] text-on-surface leading-loose font-medium border-transparent bg-background/30 hover:bg-background/50'
                        : 'bg-background hover:bg-surface-container-low min-h-[80px] flex items-center cursor-pointer border-dashed border-outline-variant'
                      }`}
                  >
                    {description || (
                      <span className="text-[14px] font-medium text-on-surface-variant/40">
                        Add a more detailed description…
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Checklists */}
            {((card.checklists && card.checklists.length > 0) || isAddingChecklistItem) && (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center flex-shrink-0">
                    <CheckSquare className="w-5 h-5 text-on-surface-variant" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-bold text-[16px] text-on-surface tracking-tight flex-1">Checklist</h3>
                  <button className="text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-surface-container-low hover:bg-error/10 hover:text-error text-on-surface-variant transition-colors">
                    Remove
                  </button>
                </div>

                <div className="ml-0 sm:ml-14 space-y-5">
                  {/* Progress */}
                  <div className="flex items-center gap-4">
                    <span className={`text-[12px] tabular-nums w-10 font-black ${progressPercent === 100 ? 'text-tertiary' : 'text-on-surface-variant'
                      }`}>
                      {progressPercent}%
                    </span>
                    <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${progressPercent === 100 ? 'bg-tertiary' : 'bg-on-surface'}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    {card.checklists.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="group flex items-start gap-4 px-4 py-3 rounded-2xl hover:bg-surface-container-low transition-all cursor-pointer relative"
                      >
                        <div
                          className="flex items-start gap-4 flex-1"
                          onClick={() => toggleChecklistItem(idx)}
                        >
                          <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${item.isCompleted
                              ? 'bg-tertiary border-tertiary'
                              : 'bg-transparent border-outline-variant group-hover:border-on-surface-variant'
                            }`}>
                            {item.isCompleted && <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />}
                          </div>
                          <span className={`text-[14px] leading-snug font-medium transition-all ${item.isCompleted ? 'text-on-surface-variant/40 line-through' : 'text-on-surface'
                            }`}>
                            {item.text}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteChecklistItem(idx)}
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-error/10 text-on-surface-variant hover:text-error transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {isAddingChecklistItem ? (
                    <div className="space-y-4 animate-slide-up bg-white p-5 rounded-[24px] shadow-xl border border-outline-variant/10">
                      <input
                        autoFocus
                        value={newChecklistItem}
                        onChange={(e) => setNewChecklistItem(e.target.value)}
                        placeholder="Add a sub-task..."
                        className="w-full p-2 border-none outline-none text-[14px] text-on-surface bg-transparent font-medium placeholder-on-surface-variant/40"
                        onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()}
                      />
                      <div className="flex gap-2 justify-end pt-3 border-t border-outline-variant/5">
                        <button
                          onClick={() => setIsAddingChecklistItem(false)}
                          className="p-2 mr-1 rounded-xl hover:bg-black/5 text-on-surface-variant"
                        >
                          <X className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={addChecklistItem}
                          className="btn-primary-gradient px-4 py-2 text-[12px] uppercase tracking-widest"
                        >
                          Create Item
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingChecklistItem(true)}
                      className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-surface-container-low hover:bg-surface-container-high text-on-surface font-bold text-[13px] uppercase tracking-widest transition-all"
                    >
                      <PlusIcon className="w-4.5 h-4.5" strokeWidth={3} />
                      Add sub-task
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-52 space-y-6 sm:space-y-8 flex-shrink-0 order-first md:order-last">
            <div>
              <h3 className="text-[10px] font-black text-outline uppercase tracking-widest mb-4">Toolbar</h3>
              <div className="grid grid-cols-2 sm:flex sm:flex-col gap-2">
                <div className="relative">
                  <SidebarButton
                    icon={<UserIcon className="w-4.5 h-4.5" strokeWidth={2.5} />}
                    label="Members"
                    onClick={() => setActivePopover(activePopover === 'members' ? null : 'members')}
                  />
                  {activePopover === 'members' && (
                    <Popover title="Members" onClose={() => setActivePopover(null)}>
                      <div className="space-y-5">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
                          <input
                            type="text"
                            placeholder="Find people..."
                            className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl py-3 pl-10 pr-4 text-[13px] outline-none focus:border-tertiary transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold text-outline uppercase tracking-widest">Workspace Members</h4>
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
                                className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-black/5 transition-all group"
                              >
                                <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-[12px] text-on-surface font-black group-hover:scale-110 transition-transform">
                                  {user.name.charAt(0)}
                                </div>
                                <span className="flex-1 text-left text-[14px] font-bold text-on-surface-variant group-hover:text-on-surface">{user.name}</span>
                                {isMember && <div className="p-1.5 bg-tertiary rounded-full"><Check className="w-3 h-3 text-white" strokeWidth={4} /></div>}
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
                    icon={<Tag className="w-4.5 h-4.5" strokeWidth={2.5} />}
                    label="Labels"
                    onClick={() => setActivePopover(activePopover === 'labels' ? null : 'labels')}
                  />
                  {activePopover === 'labels' && (
                    <Popover title="Labels" onClose={() => setActivePopover(null)}>
                      <div className="space-y-5">
                        <div className="grid grid-cols-5 gap-3">
                          {['green', 'yellow', 'orange', 'red', 'purple', 'blue', 'sky', 'lime', 'pink', 'black'].map(color => (
                            <button
                              key={color}
                              className="h-9 rounded-xl transition-all hover:scale-110 active:scale-90 shadow-sm"
                              style={{ backgroundColor: getLabelColor(color) }}
                              onClick={() => {
                                const newLabel = { text: '', color };
                                updateCardField('labels', [...(card.labels || []), newLabel]);
                              }}
                            />
                          ))}
                        </div>
                        <div className="space-y-2">
                          {card.labels?.map((label: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-1 pl-3 bg-surface-container-low rounded-2xl">
                              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: getLabelColor(label.color) }} />
                              <input
                                value={label.text}
                                onChange={(e) => {
                                  const newLabels = [...card.labels];
                                  newLabels[idx].text = e.target.value;
                                  updateCardField('labels', newLabels);
                                }}
                                className="flex-1 bg-transparent py-2 text-[13px] outline-none font-bold text-on-surface-variant placeholder-on-surface-variant/30"
                                placeholder="Edit title..."
                              />
                              <button
                                onClick={() => {
                                  updateCardField('labels', card.labels.filter((_: any, i: number) => i !== idx));
                                }}
                                className="p-2 rounded-xl hover:bg-error/10 text-on-surface-variant hover:text-error transition-all"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Popover>
                  )}
                </div>

                <SidebarButton
                  icon={<CheckSquare className="w-4.5 h-4.5" strokeWidth={2.5} />}
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
                    icon={<Calendar className="w-4.5 h-4.5" strokeWidth={2.5} />}
                    label="Dates"
                    onClick={() => setActivePopover(activePopover === 'dates' ? null : 'dates')}
                  />
                  {activePopover === 'dates' && (
                    <Popover title="Timeline" onClose={() => setActivePopover(null)}>
                      <div className="space-y-5">
                        <input
                          type="datetime-local"
                          value={card.dueDate ? new Date(card.dueDate).toISOString().slice(0, 16) : ''}
                          onChange={(e) => updateCardField('dueDate', e.target.value)}
                          className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl p-4 text-[14px] outline-none focus:border-tertiary transition-all font-bold"
                        />
                        <button
                          onClick={() => updateCardField('dueDate', null)}
                          className="w-full bg-error/10 hover:bg-error/20 text-error px-4 py-3 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all"
                        >
                          Clear Date
                        </button>
                      </div>
                    </Popover>
                  )}
                </div>
                <SidebarButton icon={<Paperclip className="w-4.5 h-4.5" strokeWidth={2.5} />} label="Attachment" />
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black text-outline uppercase tracking-widest mb-4">Lifecycle</h3>
              <div className="flex flex-col gap-2">
                <SidebarButton
                  icon={<Archive className="w-4.5 h-4.5" strokeWidth={2.5} />}
                  label="Archive"
                  onClick={handleArchive}
                />
                <SidebarButton
                  icon={<Trash2 className="w-4.5 h-4.5" strokeWidth={2.5} />}
                  label="Delete"
                  variant="danger"
                  onClick={handleDelete}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Popover = ({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) => (
  <div className="absolute top-full mt-2 right-0 md:top-0 md:right-full md:mr-4 w-[calc(100vw-2rem)] sm:w-80 max-w-80 bg-white rounded-[24px] sm:rounded-[32px] shadow-[0_24px_64px_rgba(0,0,0,0.12)] border border-outline-variant/10 p-4 sm:p-5 z-[110] animate-scale-in origin-top-right md:origin-right">
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-[10px] font-black text-outline uppercase tracking-widest">{title}</h3>
      <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5 text-on-surface-variant transition-all">
        <X className="w-4 h-4" />
      </button>
    </div>
    {children}
  </div>
);

const SidebarButton = ({ icon, label, variant, onClick }: { icon: any; label: string; variant?: string; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-[13px] uppercase tracking-widest transition-all shadow-sm border border-white/40 ${variant === 'danger'
        ? 'text-error hover:bg-error/10'
        : 'bg-white hover:bg-surface-container-highest text-on-surface hover:shadow-md hover:-translate-y-0.5'
      }`}
  >
    <div className="shrink-0">{icon}</div>
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

export default CardDetailModal;
