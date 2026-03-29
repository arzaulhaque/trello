import React from 'react'
import { Draggable } from '@hello-pangea/dnd'
import { formatDate, isOverdue } from '../utils/helpers'
import './Card.css'

export default function Card({ card, index, onClick, onDeleted }) {
  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this card?')) return
    try {
      const { deleteCard } = await import('../services/api')
      await deleteCard(card.id)
      onDeleted()
    } catch (err) {
      alert(err.message)
    }
  }

  const overdue = isOverdue(card.due_date)

  return (
    <Draggable draggableId={String(card.id)} index={index}>
      {(provided, snapshot) => (
        <div
          className={`card ${snapshot.isDragging ? 'card--dragging' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onClick()}
        >
          {/* Labels row */}
          {card.labels && card.labels.length > 0 && (
            <div className="card-labels">
              {card.labels.map((label) => (
                <span
                  key={label.id}
                  className="card-label"
                  style={{ background: label.color }}
                  title={label.name}
                />
              ))}
            </div>
          )}

          <div className="card-title">{card.title}</div>

          <div className="card-meta">
            {card.due_date && (
              <span className={`card-due ${overdue ? 'card-due--overdue' : ''}`}>
                📅 {formatDate(card.due_date)}
              </span>
            )}
            {card.description && <span className="card-icon" title="Has description">📝</span>}
            {card.members && card.members.length > 0 && (
              <div className="card-members">
                {card.members.map((m) => (
                  <span key={m.id} className="card-avatar" title={m.username}>
                    {m.username[0].toUpperCase()}
                  </span>
                ))}
              </div>
            )}
            <button className="card-delete-btn" onClick={handleDelete} title="Delete card">✕</button>
          </div>
        </div>
      )}
    </Draggable>
  )
}
