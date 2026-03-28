const pool = require('../config/db');

async function getAllBoards() {
  const result = await pool.query(
    'SELECT * FROM boards ORDER BY created_at DESC'
  );
  return result.rows;
}

async function getBoardById(id) {
  const boardResult = await pool.query('SELECT * FROM boards WHERE id = $1', [id]);
  if (boardResult.rows.length === 0) return null;

  const board = boardResult.rows[0];

  const listsResult = await pool.query(
    'SELECT * FROM lists WHERE board_id = $1 ORDER BY position ASC',
    [id]
  );
  board.lists = listsResult.rows;

  for (const list of board.lists) {
    const cardsResult = await pool.query(
      `SELECT c.*, 
        COALESCE(json_agg(DISTINCT jsonb_build_object('id', l.id, 'name', l.name, 'color', l.color)) FILTER (WHERE l.id IS NOT NULL), '[]') AS labels,
        COALESCE(json_agg(DISTINCT jsonb_build_object('id', u.id, 'username', u.username, 'email', u.email)) FILTER (WHERE u.id IS NOT NULL), '[]') AS members
       FROM cards c
       LEFT JOIN card_labels cl ON c.id = cl.card_id
       LEFT JOIN labels l ON cl.label_id = l.id
       LEFT JOIN card_members cm ON c.id = cm.card_id
       LEFT JOIN users u ON cm.user_id = u.id
       WHERE c.list_id = $1
       GROUP BY c.id
       ORDER BY c.position ASC`,
      [list.id]
    );
    list.cards = cardsResult.rows;
  }

  return board;
}

async function createBoard(title, background_color, owner_id) {
  const result = await pool.query(
    'INSERT INTO boards (title, background_color, owner_id) VALUES ($1, $2, $3) RETURNING *',
    [title, background_color || '#0052cc', owner_id]
  );
  return result.rows[0];
}

async function updateBoard(id, fields) {
  const { title, background_color } = fields;
  const result = await pool.query(
    'UPDATE boards SET title = COALESCE($1, title), background_color = COALESCE($2, background_color), updated_at = NOW() WHERE id = $3 RETURNING *',
    [title, background_color, id]
  );
  return result.rows[0];
}

async function deleteBoard(id) {
  const result = await pool.query('DELETE FROM boards WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
}

module.exports = { getAllBoards, getBoardById, createBoard, updateBoard, deleteBoard };
