const BASE = import.meta.env.VITE_API_BASE_URL || '/api'

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body !== undefined) opts.body = JSON.stringify(body)
  const res = await fetch(`${BASE}${path}`, opts)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }))
    throw new Error(err?.error?.message || res.statusText)
  }
  return res.json()
}

// Boards
export const getBoards = () => request('GET', '/boards')
export const getBoard = (id) => request('GET', `/boards/${id}`)
export const createBoard = (data) => request('POST', '/boards', data)
export const updateBoard = (id, data) => request('PUT', `/boards/${id}`, data)
export const deleteBoard = (id) => request('DELETE', `/boards/${id}`)
export const getBoardLabels = (boardId) => request('GET', `/boards/${boardId}/labels`)
export const createBoardLabel = (boardId, data) => request('POST', `/boards/${boardId}/labels`, data)

// Users
export const getUsers = () => request('GET', '/users')

// Lists
export const createList = (data) => request('POST', '/lists', data)
export const updateList = (id, data) => request('PUT', `/lists/${id}`, data)
export const deleteList = (id) => request('DELETE', `/lists/${id}`)
export const reorderLists = (data) => request('PATCH', '/lists/reorder', data)

// Cards
export const createCard = (data) => request('POST', '/cards', data)
export const getCard = (id) => request('GET', `/cards/${id}`)
export const updateCard = (id, data) => request('PUT', `/cards/${id}`, data)
export const deleteCard = (id) => request('DELETE', `/cards/${id}`)
export const moveCard = (data) => request('PATCH', '/cards/move', data)
export const reorderCards = (data) => request('PATCH', '/cards/reorder', data)
export const searchCards = (query) => request('GET', `/cards/search?query=${encodeURIComponent(query)}`)

// Card details
export const addLabel = (cardId, data) => request('POST', `/cards/${cardId}/labels`, data)
export const removeLabel = (cardId, labelId) => request('DELETE', `/cards/${cardId}/labels/${labelId}`)
export const addMember = (cardId, data) => request('POST', `/cards/${cardId}/members`, data)
export const removeMember = (cardId, userId) => request('DELETE', `/cards/${cardId}/members/${userId}`)
export const addChecklist = (cardId, data) => request('POST', `/cards/${cardId}/checklists`, data)
export const addChecklistItem = (cardId, checklistId, data) =>
  request('POST', `/cards/${cardId}/checklists/${checklistId}/items`, data)
export const updateChecklistItem = (cardId, checklistId, itemId, data) =>
  request('PATCH', `/cards/${cardId}/checklists/${checklistId}/items/${itemId}`, data)
export const updateDueDate = (cardId, data) => request('PATCH', `/cards/${cardId}/due-date`, data)
