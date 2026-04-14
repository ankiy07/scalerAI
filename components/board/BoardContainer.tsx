'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import BoardList from './BoardList';
import CardDetailModal from '../modals/CardDetailModal';
import { LayoutGrid, Plus, Search, SlidersHorizontal, ChevronLeft, X } from 'lucide-react';
import Link from 'next/link';

interface BoardContainerProps {
  board: any;
  initialLists: any[];
  initialCards: any[];
}

const BoardContainer: React.FC<BoardContainerProps> = ({ board, initialLists, initialCards }) => {
  const [lists, setLists] = useState(initialLists);
  const [cards, setCards] = useState(initialCards);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCard, setActiveCard] = useState<any>(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

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

  const handleUpdateCard = (updatedCard: any) => {
    setCards(cards.map(c => c._id === updatedCard._id ? updatedCard : c));
    if (activeCard?._id === updatedCard._id) {
      setActiveCard(updatedCard);
    }
  };

  const filteredCards = cards.filter(card =>
    card.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ backgroundColor: board.background || '#0a84ff' }}
    >
      {/* Board Nav */}
      <nav className="h-[52px] flex items-center px-5 justify-between bg-black/80 backdrop-blur-xl text-white border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 hover:bg-white/10 px-2 py-1.5 rounded-lg apple-transition text-white/70 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
            <LayoutGrid className="w-3.5 h-3.5" strokeWidth={2} />
          </Link>

          <div className="w-px h-4 bg-white/12" />

          <h1 className="font-semibold text-[15px] tracking-[-0.02em] px-2 py-1 rounded-lg hover:bg-white/10 apple-transition cursor-pointer">
            {board.title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search cards…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/8 hover:bg-white/12 focus:bg-[#1c1c1e] focus:text-[#f5f5f7] outline-none border border-white/8 focus:border-[#0a84ff] py-1.5 pl-9 pr-3 rounded-lg text-[13px] font-medium placeholder-white/40 focus:placeholder-[#636366] apple-transition w-44 focus:w-60"
            />
          </div>

          <button className="flex items-center gap-1.5 bg-white/8 hover:bg-white/12 px-3 py-1.5 rounded-lg text-[13px] font-medium apple-transition border border-white/8">
            <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Filters</span>
          </button>
        </div>
      </nav>

      {/* Lists Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 board-scroll">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" type="column" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex gap-3 h-full items-start"
              >
                {lists.map((list, index) => (
                  <BoardList
                    key={list._id}
                    list={list}
                    index={index}
                    cards={filteredCards.filter(c => c.listId === list._id).sort((a, b) => a.order - b.order)}
                    onAddCard={handleAddCard}
                    onCardClick={setActiveCard}
                  />
                ))}
                {provided.placeholder}

                {/* Add List */}
                {isAddingList ? (
                  <div className="kanban-list p-3 animate-scale-in !w-[292px]">
                    <input
                      autoFocus
                      type="text"
                      placeholder="List title…"
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddList()}
                      className="w-full p-2 mb-2 rounded-lg border border-white/[0.1] focus:border-[#0a84ff] focus:ring-2 focus:ring-[#0a84ff]/20 outline-none text-[13px] text-[#f5f5f7] font-medium bg-[#2c2c2e]"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleAddList}
                        className="bg-[#0a84ff] hover:bg-[#409cff] text-white px-3 py-1.5 rounded-lg font-medium text-[13px] apple-transition active:scale-95"
                      >
                        Add list
                      </button>
                      <button
                        onClick={() => setIsAddingList(false)}
                        className="p-1.5 rounded-lg hover:bg-white/[0.06] apple-transition"
                      >
                        <X className="w-4 h-4 text-[#636366]" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingList(true)}
                    className="min-w-[292px] bg-white/10 hover:bg-white/15 backdrop-blur-md text-white/90 hover:text-white p-3.5 rounded-2xl flex items-center gap-2 apple-transition h-fit font-medium text-[13px] text-left border border-white/[0.06] hover:border-white/12"
                  >
                    <Plus className="w-4.5 h-4.5" strokeWidth={2} />
                    <span>Add another list</span>
                  </button>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Card Detail Modal */}
      {activeCard && (
        <CardDetailModal
          card={activeCard}
          onClose={() => setActiveCard(null)}
          onUpdate={handleUpdateCard}
        />
      )}
    </div>
  );
};

export default BoardContainer;
