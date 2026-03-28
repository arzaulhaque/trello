import React, { useState } from 'react'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import Card from './Card'
import * as api from '../services/api'
import './List.css'

export default function List({ list, index, onCardClick, onCardAdded, onListDeleted, onListUpdated, onCardDeleted }) {
  const [addingCard, setAddingCard] = useState(false)
  const [cardTitle, setCardTitle] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [listTitle, setListTitle] = useState(list.title)
  const [submitting, setSubmitting] = useState(false)

  const handleAddCard = async (e) => {
    e.preventDefault()
    if (!cardTitle.trim() || submitting) return
    setSubmitting(true)
    try {
      const card = await api.createCard({ list_id: list.id, title: cardTitle.trim() })
      onCardAdded(list.id, card)
      setCardTitle('')
      setAddingCard(false)
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleTitleSave = async () => {
    if (!listTitle.trim() || listTitle === list.title) {
      setListTitle(list.title)
      setEditingTitle(false)
      return
    }
    try {
      await api.updateList(list.id, { title: listTitle.trim() })
      onListUpdated(list.id, listTitle.trim())
    } catch {
      setListTitle(list.title)
    }
    setEditingTitle(false)
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete list "${list.title}" and all its cards?`)) return
    try {
      await api.deleteList(list.id)
      onListDeleted(list.id)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <Draggable draggableId={String(list.id)} index={index}>
      {(provided, snapshot) => (
        <div
          className={`list ${snapshot.isDragging ? 'list--dragging' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <div className="list-header" {...provided.dragHandleProps}>
            {editingTitle ? (
              <input
                autoFocus
                className="list-title-input"
                value={listTitle}
                onChange={(e) => setListTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
              />
            ) : (
              <h2 className="list-title" onClick={() => setEditingTitle(true)}>
                {list.title}
              </h2>
            )}
            <button className="list-delete-btn" onClick={handleDelete} title="Delete list">✕</button>
          </div>

          <Droppable droppableId={String(list.id)} type="CARD">
            {(provided, snapshot) => (
              <div
                className={`list-cards ${snapshot.isDraggingOver ? 'list-cards--over' : ''}`}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {(list.cards || []).map((card, idx) => (
                  <Card
                    key={card.id}
                    card={card}
                    index={idx}
                    onClick={() => onCardClick(card)}
                    onDeleted={() => onCardDeleted(list.id, card.id)}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div className="list-footer">
            {addingCard ? (
              <form className="add-card-form" onSubmit={handleAddCard}>
                <textarea
                  autoFocus
                  className="add-card-textarea"
                  placeholder="Enter a title for this card…"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddCard(e)}
                />
                <div className="add-card-actions">
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    Add Card
                  </button>
                  <button type="button" className="btn-icon" onClick={() => { setAddingCard(false); setCardTitle('') }}>✕</button>
                </div>
              </form>
            ) : (
              <button className="add-card-btn" onClick={() => setAddingCard(true)}>
                + Add a card
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}
