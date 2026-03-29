import React, { useState, useEffect, useRef } from 'react'
import * as api from '../services/api'
import { formatDate } from '../utils/helpers'
import './CardModal.css'

const LABEL_COLORS = [
  { name: 'Green',  color: '#61bd4f' },
  { name: 'Yellow', color: '#f2d600' },
  { name: 'Orange', color: '#ff9f1a' },
  { name: 'Red',    color: '#eb5a46' },
  { name: 'Purple', color: '#c377e0' },
  { name: 'Blue',   color: '#0079bf' },
]

export default function CardModal({ card: initialCard, boardId, onClose, onUpdated, onDeleted }) {
  const [card, setCard] = useState(initialCard)
  const [title, setTitle] = useState(initialCard.title)
  const [description, setDescription] = useState(initialCard.description || '')
  const [editingDesc, setEditingDesc] = useState(false)
  const [dueDate, setDueDate] = useState(
    initialCard.due_date ? initialCard.due_date.slice(0, 10) : ''
  )
  const [newChecklistTitle, setNewChecklistTitle] = useState('')
  const [addingChecklist, setAddingChecklist] = useState(false)
  const [newItemContent, setNewItemContent] = useState({})
  const [saving, setSaving] = useState(false)
  const [showLabelPicker, setShowLabelPicker] = useState(false)
  const [showMemberPicker, setShowMemberPicker] = useState(false)
  const [boardLabels, setBoardLabels] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('#61bd4f')
  const [addingLabel, setAddingLabel] = useState(false)
  const modalRef = useRef(null)

  // Load full card details
  useEffect(() => {
    api.getCard(initialCard.id).then(setCard).catch(() => {})
  }, [initialCard.id])

  // Load board labels and users
  useEffect(() => {
    if (boardId) {
      api.getBoardLabels(boardId).then(setBoardLabels).catch(() => {})
      api.getUsers().then(setAllUsers).catch(() => {})
    }
  }, [boardId])

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose()
  }

  // Escape key
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const saveTitle = async () => {
    if (!title.trim() || title === card.title) return
    try {
      const updated = await api.updateCard(card.id, { title: title.trim() })
      setCard((c) => ({ ...c, ...updated }))
    } catch {
      setTitle(card.title)
    }
  }

  const saveDescription = async () => {
    setEditingDesc(false)
    if (description === (card.description || '')) return
    try {
      const updated = await api.updateCard(card.id, { description })
      setCard((c) => ({ ...c, ...updated }))
    } catch {}
  }

  const saveDueDate = async (val) => {
    setDueDate(val)
    try {
      const updated = await api.updateDueDate(card.id, { due_date: val || null })
      setCard((c) => ({ ...c, ...updated }))
    } catch {}
  }

  const handleAddChecklist = async (e) => {
    e.preventDefault()
    if (!newChecklistTitle.trim()) return
    try {
      const checklist = await api.addChecklist(card.id, { title: newChecklistTitle.trim() })
      setCard((c) => ({ ...c, checklists: [...(c.checklists || []), { ...checklist, items: [] }] }))
      setNewChecklistTitle('')
      setAddingChecklist(false)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleAddItem = async (e, checklist) => {
    e.preventDefault()
    const content = newItemContent[checklist.id] || ''
    if (!content.trim()) return
    try {
      const item = await api.addChecklistItem(card.id, checklist.id, { content: content.trim() })
      setCard((c) => ({
        ...c,
        checklists: c.checklists.map((ch) =>
          ch.id === checklist.id ? { ...ch, items: [...(ch.items || []), item] } : ch
        ),
      }))
      setNewItemContent((prev) => ({ ...prev, [checklist.id]: '' }))
    } catch (err) {
      alert(err.message)
    }
  }

  const handleToggleItem = async (checklist, item) => {
    try {
      const updated = await api.updateChecklistItem(card.id, checklist.id, item.id, {
        is_completed: !item.is_completed,
      })
      setCard((c) => ({
        ...c,
        checklists: c.checklists.map((ch) =>
          ch.id === checklist.id
            ? { ...ch, items: ch.items.map((i) => (i.id === item.id ? updated : i)) }
            : ch
        ),
      }))
    } catch {}
  }

  const handleToggleLabel = async (label) => {
    const cardLabels = card.labels || []
    const isOn = cardLabels.some((l) => l.id === label.id)
    try {
      if (isOn) {
        await api.removeLabel(card.id, label.id)
        setCard((c) => ({ ...c, labels: c.labels.filter((l) => l.id !== label.id) }))
      } else {
        await api.addLabel(card.id, { label_id: label.id })
        setCard((c) => ({ ...c, labels: [...(c.labels || []), label] }))
      }
    } catch (err) {
      alert(err.message)
    }
  }

  const handleCreateLabel = async (e) => {
    e.preventDefault()
    if (!newLabelName.trim()) return
    try {
      const label = await api.createBoardLabel(boardId, { name: newLabelName.trim(), color: newLabelColor })
      setBoardLabels((prev) => [...prev, label])
      setNewLabelName('')
      setAddingLabel(false)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleToggleMember = async (user) => {
    const cardMembers = card.members || []
    const isOn = cardMembers.some((m) => m.id === user.id)
    try {
      if (isOn) {
        await api.removeMember(card.id, user.id)
        setCard((c) => ({ ...c, members: c.members.filter((m) => m.id !== user.id) }))
      } else {
        await api.addMember(card.id, { user_id: user.id })
        setCard((c) => ({ ...c, members: [...(c.members || []), user] }))
      }
    } catch (err) {
      alert(err.message)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await api.updateCard(card.id, {
        title: title.trim(),
        description,
        due_date: dueDate || null,
      })
      onUpdated({ ...card, ...updated })
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this card?')) return
    try {
      await api.deleteCard(card.id)
      onDeleted(card)
    } catch (err) {
      alert(err.message)
    }
  }

  const checklists = card.checklists || []
  const labels = card.labels || []
  const members = card.members || []

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal" ref={modalRef} role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Title */}
        <div className="modal-section">
          <span className="modal-section-icon">📋</span>
          <input
            className="modal-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
          />
        </div>

        <div className="modal-body">
          <div className="modal-main">
            {/* Labels */}
            {labels.length > 0 && (
              <div className="modal-section">
                <h3 className="modal-sub-title">Labels</h3>
                <div className="modal-labels">
                  {labels.map((l) => (
                    <span key={l.id} className="modal-label" style={{ background: l.color }}>
                      {l.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Members */}
            {members.length > 0 && (
              <div className="modal-section">
                <h3 className="modal-sub-title">Members</h3>
                <div className="modal-members">
                  {members.map((m) => (
                    <span key={m.id} className="modal-avatar" title={m.username}>
                      {m.username[0].toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Due date */}
            <div className="modal-section">
              <h3 className="modal-sub-title">Due Date</h3>
              <input
                type="date"
                className="modal-date-input"
                value={dueDate}
                onChange={(e) => saveDueDate(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="modal-section">
              <h3 className="modal-sub-title">📝 Description</h3>
              {editingDesc ? (
                <div className="desc-edit">
                  <textarea
                    autoFocus
                    className="modal-desc-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a more detailed description…"
                  />
                  <div className="desc-actions">
                    <button className="btn btn-primary" onClick={saveDescription}>Save</button>
                    <button className="btn-icon" onClick={() => { setEditingDesc(false); setDescription(card.description || '') }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div
                  className={`modal-desc-display ${!description ? 'modal-desc-empty' : ''}`}
                  onClick={() => setEditingDesc(true)}
                >
                  {description || 'Add a description…'}
                </div>
              )}
            </div>

            {/* Checklists */}
            {checklists.map((cl) => {
              const items = cl.items || []
              const done = items.filter((i) => i.is_completed).length
              const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0
              return (
                <div key={cl.id} className="modal-section">
                  <h3 className="modal-sub-title">☑ {cl.title}</h3>
                  <div className="checklist-progress">
                    <span className="checklist-pct">{pct}%</span>
                    <div className="checklist-bar">
                      <div className="checklist-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <ul className="checklist-items">
                    {items.map((item) => (
                      <li key={item.id} className="checklist-item">
                        <input
                          type="checkbox"
                          checked={item.is_completed}
                          onChange={() => handleToggleItem(cl, item)}
                          id={`item-${item.id}`}
                        />
                        <label
                          htmlFor={`item-${item.id}`}
                          className={item.is_completed ? 'completed' : ''}
                        >
                          {item.content}
                        </label>
                      </li>
                    ))}
                  </ul>
                  <form className="add-item-form" onSubmit={(e) => handleAddItem(e, cl)}>
                    <input
                      className="add-item-input"
                      placeholder="Add an item…"
                      value={newItemContent[cl.id] || ''}
                      onChange={(e) =>
                        setNewItemContent((prev) => ({ ...prev, [cl.id]: e.target.value }))
                      }
                    />
                    <button type="submit" className="btn btn-primary">Add</button>
                  </form>
                </div>
              )
            })}

            {/* Add checklist inline */}
            {addingChecklist && (
              <div className="modal-section">
                <form className="add-checklist-form" onSubmit={handleAddChecklist}>
                  <input
                    autoFocus
                    className="add-item-input"
                    placeholder="Checklist title…"
                    value={newChecklistTitle}
                    onChange={(e) => setNewChecklistTitle(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" className="btn btn-primary">Add Checklist</button>
                    <button type="button" className="btn-icon" onClick={() => setAddingChecklist(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Sidebar actions */}
          <div className="modal-sidebar">
            <h3 className="modal-sub-title">Add to card</h3>

            {/* Labels button + picker */}
            <div className="picker-wrap">
              <button
                className="modal-sidebar-btn"
                onClick={() => { setShowLabelPicker((v) => !v); setShowMemberPicker(false) }}
              >
                🏷 Labels
              </button>
              {showLabelPicker && (
                <div className="picker-dropdown">
                  <div className="picker-title">Labels</div>
                  {boardLabels.map((label) => {
                    const active = labels.some((l) => l.id === label.id)
                    return (
                      <div
                        key={label.id}
                        className={`picker-item ${active ? 'picker-item--active' : ''}`}
                        onClick={() => handleToggleLabel(label)}
                      >
                        <span className="picker-label-swatch" style={{ background: label.color }} />
                        <span className="picker-label-name">{label.name}</span>
                        {active && <span className="picker-check">✓</span>}
                      </div>
                    )
                  })}
                  {boardLabels.length === 0 && !addingLabel && (
                    <div className="picker-empty">No labels yet</div>
                  )}
                  <div className="picker-divider" />
                  {addingLabel ? (
                    <form className="picker-new-label" onSubmit={handleCreateLabel}>
                      <input
                        autoFocus
                        className="picker-input"
                        placeholder="Label name…"
                        value={newLabelName}
                        onChange={(e) => setNewLabelName(e.target.value)}
                      />
                      <div className="picker-colors">
                        {LABEL_COLORS.map((lc) => (
                          <button
                            key={lc.color}
                            type="button"
                            className={`picker-color-btn ${newLabelColor === lc.color ? 'picker-color-btn--active' : ''}`}
                            style={{ background: lc.color }}
                            title={lc.name}
                            onClick={() => setNewLabelColor(lc.color)}
                          />
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create</button>
                        <button type="button" className="btn-icon" onClick={() => setAddingLabel(false)}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <button className="picker-create-btn" onClick={() => setAddingLabel(true)}>
                      + Create a new label
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Members button + picker */}
            <div className="picker-wrap">
              <button
                className="modal-sidebar-btn"
                onClick={() => { setShowMemberPicker((v) => !v); setShowLabelPicker(false) }}
              >
                �� Members
              </button>
              {showMemberPicker && (
                <div className="picker-dropdown">
                  <div className="picker-title">Members</div>
                  {allUsers.map((user) => {
                    const active = members.some((m) => m.id === user.id)
                    return (
                      <div
                        key={user.id}
                        className={`picker-item ${active ? 'picker-item--active' : ''}`}
                        onClick={() => handleToggleMember(user)}
                      >
                        <span className="picker-avatar">{user.username[0].toUpperCase()}</span>
                        <span className="picker-member-name">{user.username}</span>
                        {active && <span className="picker-check">✓</span>}
                      </div>
                    )
                  })}
                  {allUsers.length === 0 && (
                    <div className="picker-empty">No users found</div>
                  )}
                </div>
              )}
            </div>

            {/* Checklist button */}
            <button
              className="modal-sidebar-btn"
              onClick={() => { setAddingChecklist(true); setShowLabelPicker(false); setShowMemberPicker(false) }}
            >
              ☑ Checklist
            </button>

            <div className="picker-divider" />
            <h3 className="modal-sub-title" style={{ marginTop: 12 }}>Actions</h3>
            <button className="btn btn-primary modal-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button className="modal-sidebar-btn modal-delete-btn" onClick={handleDelete}>
              🗑 Delete Card
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
