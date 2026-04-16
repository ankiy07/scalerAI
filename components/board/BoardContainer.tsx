'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import BoardList from './BoardList';
import CardDetailModal from '../modals/CardDetailModal';
import ContextualHUD from './ContextualHUD';
import { Archive, ChevronLeft, RotateCcw, Search, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

interface BoardContainerProps {
  board: any;
  initialLists: any[];
  initialCards: any[];
}

const BoardContainer: React.FC<BoardContainerProps> = ({ board, initialLists, initialCards }) => {
  const [lists, setLists] = useState(initialLists);
  const [cards, setCards] = useState(initialCards);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeCard, setActiveCard] = useState<any>(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [isArchivePanelOpen, setIsArchivePanelOpen] = useState(false);
  const [archivedCards, setArchivedCards] = useState<any[]>([]);
  const [isLoadingArchivedCards, setIsLoadingArchivedCards] = useState(false);
  const [archivedSearchQuery, setArchivedSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === 'column') {
      const newListOrder = Array.from(lists);
      const [removed] = newListOrder.splice(source.index, 1);
      newListOrder.splice(destination.index, 0, removed);

      const updatedLists = newListOrder.map((list, index) => ({
        ...list,
        order: index,
      }));

      setLists(updatedLists);

      await fetch(`/api/boards/${board._id}/lists`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLists.map(l => ({ id: l._id, order: l.order }))),
      });
      return;
    }

    const sourceListId = source.droppableId;
    const destListId = destination.droppableId;

    if (sourceListId === destListId) {
      const listCards = cards.filter(c => c.listId === sourceListId).sort((a, b) => a.order - b.order);
      const [removed] = listCards.splice(source.index, 1);
      listCards.splice(destination.index, 0, removed);

      const updatedCards = cards.map(card => {
        if (card.listId === sourceListId) {
          const index = listCards.findIndex(c => c._id === card._id);
          if (index !== -1) return { ...card, order: index };
        }
        return card;
      });

      setCards(updatedCards);

      await fetch(`/api/lists/${sourceListId}/cards`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listCards.map((c, i) => ({ id: c._id, order: i, listId: sourceListId }))),
      });
    } else {
      const sourceListCards = cards.filter(c => c.listId === sourceListId).sort((a, b) => a.order - b.order);
      const destListCards = cards.filter(c => c.listId === destListId).sort((a, b) => a.order - b.order);

      const [removed] = sourceListCards.splice(source.index, 1);
      removed.listId = destListId;
      destListCards.splice(destination.index, 0, removed);

      const updatedCards = cards.map(card => {
        if (card._id === removed._id) return removed;
        if (card.listId === sourceListId) {
          const index = sourceListCards.findIndex(c => c._id === card._id);
          if (index !== -1) return { ...card, order: index };
        }
        if (card.listId === destListId) {
          const index = destListCards.findIndex(c => c._id === card._id);
          if (index !== -1) return { ...card, order: index };
        }
        return card;
      });

      setCards(updatedCards);

      await Promise.all([
        fetch(`/api/lists/${sourceListId}/cards`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sourceListCards.map((c, i) => ({ id: c._id, order: i, listId: sourceListId }))),
        }),
        fetch(`/api/lists/${destListId}/cards`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(destListCards.map((c, i) => ({ id: c._id, order: i, listId: destListId }))),
        })
      ]);
    }
  };

  const handleAddList = async () => {
    if (!newListTitle.trim()) {
      setIsAddingList(false);
      return;
    }

    const res = await fetch(`/api/boards/${board._id}/lists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newListTitle }),
    });

    if (res.ok) {
      const newList = await res.json();
      setLists([...lists, newList]);
      setNewListTitle('');
      setIsAddingList(false);
    }
  };

  const handleUpdateList = async (listId: string, newTitle: string) => {
    const res = await fetch(`/api/lists/${listId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    });

    if (res.ok) {
      setLists(lists.map(list => list._id === listId ? { ...list, title: newTitle } : list));
    }
  };

  const handleDeleteList = async (listId: string) => {
    const res = await fetch(`/api/lists/${listId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setLists(lists.filter(list => list._id !== listId));
      // Optionally also filter out cards that belong to this list
      setCards(cards.filter(card => card.listId !== listId));
    }
  };

  const handleAddCard = async (listId: string, title: string) => {
    const res = await fetch(`/api/lists/${listId}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, boardId: board._id }),
    });

    if (res.ok) {
      const newCard = await res.json();
      setCards([...cards, newCard]);
      return newCard;
    }
  };

  const focusSearch = () => {
    searchInputRef.current?.focus();
  };

  const loadArchivedCards = async () => {
    setIsLoadingArchivedCards(true);
    try {
      const res = await fetch(`/api/boards/${board._id}/archived-cards`);
      if (!res.ok) return;
      const data = await res.json();
      setArchivedCards(data);
    } finally {
      setIsLoadingArchivedCards(false);
    }
  };

  useEffect(() => {
    if (!isArchivePanelOpen) return;
    loadArchivedCards();
  }, [isArchivePanelOpen]);

  const handleUpdateCard = (updatedCard: any) => {
    setCards(cards.map(c => c._id === updatedCard._id ? updatedCard : c));
    if (activeCard?._id === updatedCard._id) {
      setActiveCard(updatedCard);
    }
  };

  const handleRemoveCard = (cardId: string, action: 'archived' | 'deleted') => {
    const removedCard = cards.find(c => c._id === cardId);
    setCards(prevCards => prevCards.filter(c => c._id !== cardId));
    if (activeCard?._id === cardId) {
      setActiveCard(null);
    }

    if (action === 'archived' && removedCard) {
      setArchivedCards(prev => [{ ...removedCard, isArchived: true }, ...prev]);
    }
  };

  const handleRestoreCard = async (cardId: string) => {
    const res = await fetch(`/api/cards/${cardId}/archive`, {
      method: 'DELETE',
    });

    if (!res.ok) return;
    const restoredCard = await res.json();

    setArchivedCards(prev => prev.filter(c => c._id !== cardId));
    setCards(prev => [...prev, restoredCard]);
  };

  const handleDeleteArchivedCard = async (cardId: string) => {
    const res = await fetch(`/api/cards/${cardId}`, {
      method: 'DELETE',
    });

    if (!res.ok) return;
    setArchivedCards(prev => prev.filter(c => c._id !== cardId));
  };

  const archivedCardsWithListName = useMemo(() => {
    const listById = new Map(lists.map((list) => [list._id, list.title]));
    return archivedCards
      .filter((card) => card.title.toLowerCase().includes(archivedSearchQuery.toLowerCase()))
      .map((card) => ({
        ...card,
        listTitle: listById.get(card.listId) || 'Unknown list',
      }));
  }, [archivedCards, archivedSearchQuery, lists]);

  const filteredCards = cards.filter(card =>
    card.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="flex flex-col h-screen overflow-hidden bg-background"
    >
      {/* Search Header (Hidden but focusable via HUD) */}
      <div className={`fixed top-0 left-0 right-0 h-14 sm:h-16 lg:h-20 bg-white/70 backdrop-blur-2xl border-b border-outline-variant/10 z-[60] flex items-center px-4 sm:px-6 lg:px-10 transition-all duration-500 shadow-xl ${searchQuery || isSearchFocused ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <Search className="w-5 h-5 sm:w-6 sm:h-6 text-on-surface-variant mr-2 sm:mr-4" strokeWidth={3} />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search for cards, tasks, or members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="flex-1 bg-transparent border-none outline-none text-base sm:text-lg lg:text-xl font-bold text-on-surface placeholder-on-surface-variant/30 tracking-tight"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="p-2 hover:bg-black/5 rounded-full">
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        )}
      </div>

      {/* Board Nav (Minimal) */}
      <nav className="h-[56px] sm:h-[64px] lg:h-[72px] flex items-center px-3 sm:px-5 lg:px-8 justify-between z-10">
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest">Workspace</span>
          </Link>
          
          <div className="h-4 w-px bg-outline-variant/30 hidden sm:block" />

          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest font-black text-outline">Project</span>
            <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-on-surface truncate">
              {board.title}
            </h1>
          </div>
        </div>
        <button
          onClick={() => setIsArchivePanelOpen(true)}
          className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-outline-variant/20 bg-white/70 px-2.5 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-[12px] font-black uppercase tracking-widest text-on-surface-variant transition-all hover:-translate-y-0.5 hover:bg-white hover:text-on-surface hover:shadow-md flex-shrink-0"
        >
          <Archive className="h-4 w-4" />
          <span className="hidden sm:inline">Archived</span>
        </button>
      </nav>

      {/* Lists Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden sm:overflow-x-auto sm:overflow-y-hidden p-2 sm:p-3 lg:p-4 board-scroll">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" type="column" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex flex-col sm:flex-row gap-3 sm:gap-3 sm:h-full items-stretch sm:items-start pb-24 sm:pb-0"
              >
                {lists.map((list, index) => (
                  <BoardList
                    key={list._id}
                    list={list}
                    index={index}
                    cards={filteredCards.filter(c => c.listId === list._id).sort((a, b) => a.order - b.order)}
                    onAddCard={handleAddCard}
                    onCardClick={setActiveCard}
                    onUpdateList={handleUpdateList}
                    onDeleteList={handleDeleteList}
                  />
                ))}
                {provided.placeholder}

                {/* Add List Modal/Overlay */}
                {isAddingList && (
                  <div className="fixed inset-0 bg-white/40 backdrop-blur-md z-[100] flex items-center justify-center animate-fade-in p-4">
                    <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-[24px] sm:rounded-[32px] shadow-2xl border border-outline-variant/10 w-full max-w-sm sm:max-w-md animate-scale-in">
                      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 tracking-tight text-on-surface">New List</h2>
                      <input
                        autoFocus
                        type="text"
                        placeholder="Name your list..."
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddList()}
                        className="w-full p-3 sm:p-4 mb-4 sm:mb-6 rounded-xl sm:rounded-2xl border border-outline-variant focus:border-tertiary outline-none text-base sm:text-lg font-medium bg-surface-container-low transition-all"
                      />
                      <div className="flex items-center gap-3 justify-end">
                        <button
                          onClick={() => setIsAddingList(false)}
                          className="px-6 py-3 rounded-2xl font-bold text-on-surface-variant hover:bg-black/5 transition-all text-sm uppercase tracking-widest"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddList}
                          className="btn-primary-gradient px-8 py-3 shadow-lg shadow-tertiary/20 text-sm uppercase tracking-widest"
                        >
                          Create List
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Contextual HUD */}
      <ContextualHUD 
        onAddList={() => setIsAddingList(true)}
        onSearchFocus={focusSearch}
        onOpenFilters={() => {}}
        boardTitle={board.title}
      />

      {isArchivePanelOpen && (
        <div className="fixed inset-0 z-[90]">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsArchivePanelOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-full sm:max-w-md lg:max-w-xl border-l border-outline-variant/20 bg-white shadow-2xl">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-outline-variant/15 px-6 py-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-outline">Board Menu</p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight text-on-surface">Archived Items</h2>
                </div>
                <button
                  onClick={() => setIsArchivePanelOpen(false)}
                  className="rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-black/5 hover:text-on-surface"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="border-b border-outline-variant/10 px-6 py-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/50" />
                  <input
                    type="text"
                    value={archivedSearchQuery}
                    onChange={(e) => setArchivedSearchQuery(e.target.value)}
                    placeholder="Search archived cards..."
                    className="w-full rounded-2xl border border-outline-variant/15 bg-surface-container-low py-3 pl-10 pr-4 text-sm font-medium text-on-surface outline-none transition-all focus:border-tertiary"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
                {isLoadingArchivedCards ? (
                  <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low px-4 py-6 text-center text-sm font-medium text-on-surface-variant">
                    Loading archived cards...
                  </div>
                ) : archivedCardsWithListName.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-low px-6 py-10 text-center">
                    <Archive className="mx-auto h-7 w-7 text-on-surface-variant/50" />
                    <p className="mt-3 text-sm font-bold text-on-surface">No archived cards</p>
                    <p className="mt-1 text-xs text-on-surface-variant">Cards you archive will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {archivedCardsWithListName.map((card) => (
                      <div
                        key={card._id}
                        className="rounded-2xl border border-outline-variant/10 bg-white p-4 shadow-sm"
                      >
                        <p className="text-sm font-bold text-on-surface">{card.title}</p>
                        <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                          In list: {card.listTitle}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => handleRestoreCard(card._id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-surface-container-high px-3 py-2 text-[11px] font-black uppercase tracking-widest text-on-surface transition-colors hover:bg-surface-container-highest"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Send to board
                          </button>
                          <button
                            onClick={() => handleDeleteArchivedCard(card._id)}
                            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-widest text-error transition-colors hover:bg-error/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Card Detail Modal */}
      {activeCard && (
        <CardDetailModal
          card={activeCard}
          onClose={() => setActiveCard(null)}
          onUpdate={handleUpdateCard}
          onRemove={handleRemoveCard}
        />
      )}
    </div>
  );
};

export default BoardContainer;
