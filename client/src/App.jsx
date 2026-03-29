import React, { useState, useEffect } from 'react'
import BoardPage from './pages/BoardPage'
import './App.css'

const BOARD_BG_OPTIONS = [
  '#0079bf', '#d29034', '#519839', '#b04632',
  '#89609e', '#cd5a91', '#4bbf6b', '#00aecc',
]

function App() {
  const [boardId, setBoardId] = useState(null)
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateBoard, setShowCreateBoard] = useState(false)
  const [newBoardTitle, setNewBoardTitle] = useState('')
  const [newBoardBg, setNewBoardBg] = useState(BOARD_BG_OPTIONS[0])
  const [creating, setCreating] = useState(false)

  const BASE = import.meta.env.VITE_API_BASE_URL || '/api'

  const fetchBoards = () =>
    fetch(`${BASE}/boards`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBoards(data)
      })

  useEffect(() => {
    fetch(`${BASE}/boards`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBoards(data)
          setBoardId(data[0].id)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleCreateBoard = async (e) => {
    e.preventDefault()
    if (!newBoardTitle.trim() || creating) return
    setCreating(true)
    try {
      const res = await fetch(`${BASE}/boards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newBoardTitle.trim(), background_color: newBoardBg }),
      })
      const board = await res.json()
      setBoards((prev) => [board, ...prev])
      setBoardId(board.id)
      setNewBoardTitle('')
      setNewBoardBg(BOARD_BG_OPTIONS[0])
      setShowCreateBoard(false)
    } catch (err) {
      alert('Failed to create board')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p>Loading boards…</p>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-left">
          <span className="app-logo">🗂 Trello Clone</span>
        </div>
        <nav className="app-header-nav">
          {boards.map((b) => (
            <button
              key={b.id}
              className={`board-tab ${b.id === boardId ? 'active' : ''}`}
              onClick={() => setBoardId(b.id)}
            >
              {b.title}
            </button>
          ))}
        </nav>
        <div className="app-header-right">
          <div className="create-board-wrap">
            <button
              className="create-board-btn"
              onClick={() => setShowCreateBoard((v) => !v)}
            >
              + Create
            </button>
            {showCreateBoard && (
              <form className="create-board-form" onSubmit={handleCreateBoard}>
                <div className="create-board-form-title">Create board</div>
                <input
                  autoFocus
                  className="create-board-input"
                  placeholder="Board title…"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                />
                <div className="create-board-bg-label">Background</div>
                <div className="create-board-colors">
                  {BOARD_BG_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`create-board-color ${newBoardBg === color ? 'create-board-color--active' : ''}`}
                      style={{ background: color }}
                      onClick={() => setNewBoardBg(color)}
                    />
                  ))}
                </div>
                <div className="create-board-preview" style={{ background: newBoardBg }}>
                  {newBoardTitle || 'Board title'}
                </div>
                <button
                  type="submit"
                  className="btn btn-primary create-board-submit"
                  disabled={creating || !newBoardTitle.trim()}
                >
                  {creating ? 'Creating…' : 'Create Board'}
                </button>
                <button
                  type="button"
                  className="create-board-cancel"
                  onClick={() => setShowCreateBoard(false)}
                >
                  ✕
                </button>
              </form>
            )}
          </div>
        </div>
      </header>
      {boardId ? (
        <main className="app-main">
          <BoardPage boardId={boardId} />
        </main>
      ) : (
        <div className="app-empty">
          <h2>No boards yet</h2>
          <p>Create your first board using the <strong>+ Create</strong> button above.</p>
        </div>
      )}
    </div>
  )
}

export default App
