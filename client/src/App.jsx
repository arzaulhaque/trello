import React, { useState, useEffect } from 'react'
import BoardPage from './pages/BoardPage'
import './App.css'

function App() {
  const [boardId, setBoardId] = useState(null)
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/boards`)
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

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p>Loading boards…</p>
      </div>
    )
  }

  if (!boardId) {
    return (
      <div className="app-empty">
        <h1>Trello Clone</h1>
        <p>No boards found. Start by adding one via the API.</p>
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
      </header>
      <main className="app-main">
        <BoardPage boardId={boardId} />
      </main>
    </div>
  )
}

export default App
