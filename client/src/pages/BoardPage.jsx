import React, { useState, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import List from '../components/List'
import CardModal from '../components/CardModal'
import SearchFilter from '../components/SearchFilter'
import * as api from '../services/api'
import './BoardPage.css'

export default function BoardPage({ boardId }) {
  const [board, setBoard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)
  const [addingList, setAddingList] = useState(false)
  const [newListTitle, setNewListTitle] = useState('')
  const [filteredCards, setFilteredCards] = useState(null)

  const fetchBoard = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.getBoard(boardId)
      setBoard(data)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [boardId])

  useEffect(() => {
    fetchBoard()
  }, [fetchBoard])

  const handleDragEnd = async (result) => {
    const { source, destination, type } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    if (type === 'LIST') {
      const reordered = Array.from(board.lists)
      const [moved] = reordered.splice(source.index, 1)
      reordered.splice(destination.index, 0, moved)
      setBoard((b) => ({ ...b, lists: reordered }))
      try {
        await api.reorderLists({ board_id: boardId, ordered_ids: reordered.map((l) => l.id) })
      } catch {
        fetchBoard()
      }
      return
    }

    // Moving a card
    const srcList = board.lists.find((l) => String(l.id) === source.droppableId)
    const dstList = board.lists.find((l) => String(l.id) === destination.droppableId)
    if (!srcList || !dstList) return

    const srcCards = Array.from(srcList.cards || [])
    const dstCards = srcList.id === dstList.id ? srcCards : Array.from(dstList.cards || [])

    const [movedCard] = srcCards.splice(source.index, 1)

    if (srcList.id === dstList.id) {
      srcCards.splice(destination.index, 0, movedCard)
      const newLists = board.lists.map((l) =>
        l.id === srcList.id ? { ...l, cards: srcCards } : l
      )
      setBoard((b) => ({ ...b, lists: newLists }))
      try {
        await api.reorderCards({ list_id: srcList.id, ordered_ids: srcCards.map((c) => c.id) })
      } catch {
        fetchBoard()
      }
    } else {
      dstCards.splice(destination.index, 0, movedCard)
      const newLists = board.lists.map((l) => {
        if (l.id === srcList.id) return { ...l, cards: srcCards }
        if (l.id === dstList.id) return { ...l, cards: dstCards }
        return l
      })
      setBoard((b) => ({ ...b, lists: newLists }))
      try {
        await api.moveCard({ card_id: movedCard.id, target_list_id: dstList.id, position: destination.index })
      } catch {
        fetchBoard()
      }
    }
  }

  const handleAddList = async (e) => {
    e.preventDefault()
    if (!newListTitle.trim()) return
    try {
      const list = await api.createList({ board_id: boardId, title: newListTitle.trim() })
      setBoard((b) => ({ ...b, lists: [...(b.lists || []), { ...list, cards: [] }] }))
      setNewListTitle('')
      setAddingList(false)
    } catch (e) {
      alert(e.message)
    }
  }

  const handleCardAdded = (listId, card) => {
    setBoard((b) => ({
      ...b,
      lists: b.lists.map((l) =>
        l.id === listId ? { ...l, cards: [...(l.cards || []), { ...card, labels: [], members: [] }] } : l
      ),
    }))
  }

  const handleListDeleted = (listId) => {
    setBoard((b) => ({ ...b, lists: b.lists.filter((l) => l.id !== listId) }))
  }

  const handleListUpdated = (listId, title) => {
    setBoard((b) => ({
      ...b,
      lists: b.lists.map((l) => (l.id === listId ? { ...l, title } : l)),
    }))
  }

  const handleCardDeleted = (listId, cardId) => {
    setBoard((b) => ({
      ...b,
      lists: b.lists.map((l) =>
        l.id === listId ? { ...l, cards: l.cards.filter((c) => c.id !== cardId) } : l
      ),
    }))
  }

  const handleCardUpdated = (updatedCard) => {
    setBoard((b) => ({
      ...b,
      lists: b.lists.map((l) => ({
        ...l,
        cards: l.cards.map((c) => (c.id === updatedCard.id ? { ...c, ...updatedCard } : c)),
      })),
    }))
    setSelectedCard(null)
  }

  const getDisplayLists = () => {
    if (!filteredCards) return board.lists
    return board.lists.map((list) => ({
      ...list,
      cards: list.cards.filter((card) => filteredCards.has(card.id)),
    }))
  }

  if (loading) return <div className="board-loading">Loading board…</div>
  if (error) return <div className="board-error">Error: {error}</div>
  if (!board) return null

  return (
    <div className="board-page" style={{ '--board-bg': board.background_color }}>
      <div className="board-header">
        <h1 className="board-title">{board.title}</h1>
        <SearchFilter lists={board.lists} onFilter={setFilteredCards} />
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="all-lists" direction="horizontal" type="LIST">
          {(provided) => (
            <div className="board-lists" ref={provided.innerRef} {...provided.droppableProps}>
              {getDisplayLists().map((list, index) => (
                <List
                  key={list.id}
                  list={list}
                  index={index}
                  onCardClick={setSelectedCard}
                  onCardAdded={handleCardAdded}
                  onListDeleted={handleListDeleted}
                  onListUpdated={handleListUpdated}
                  onCardDeleted={handleCardDeleted}
                />
              ))}
              {provided.placeholder}

              <div className="add-list-wrap">
                {addingList ? (
                  <form className="add-list-form" onSubmit={handleAddList}>
                    <input
                      autoFocus
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      placeholder="Enter list title…"
                      className="add-list-input"
                    />
                    <div className="add-list-actions">
                      <button type="submit" className="btn btn-primary">Add List</button>
                      <button type="button" className="btn-icon" onClick={() => setAddingList(false)}>✕</button>
                    </div>
                  </form>
                ) : (
                  <button className="add-list-btn" onClick={() => setAddingList(true)}>
                    + Add another list
                  </button>
                )}
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          boardId={board.id}
          onClose={() => setSelectedCard(null)}
          onUpdated={handleCardUpdated}
          onDeleted={(card) => {
            const list = board.lists.find((l) => l.cards.some((c) => c.id === card.id))
            if (list) handleCardDeleted(list.id, card.id)
            setSelectedCard(null)
          }}
        />
      )}
    </div>
  )
}
