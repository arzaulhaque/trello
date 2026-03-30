const pool = require('../config/db');

async function getAllBoards() {
  try {
    const result = await pool.query(
      'SELECT * FROM boards ORDER BY created_at DESC'
    );
    return result.rows;
  } catch (err) {
    throw new Error(`getAllBoards: ${err.message}`, { cause: err });
  }
}

async function getBoardById(id) {
  try {
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
  } catch (err) {
    throw new Error(`getBoardById: ${err.message}`, { cause: err });
  }
}

async function createBoard(title, background_color, owner_id) {
  try {
    const result = await pool.query(
      'INSERT INTO boards (title, background_color, owner_id) VALUES ($1, $2, $3) RETURNING *',
      [title, background_color || '#0052cc', owner_id]
    );
    return result.rows[0];
  } catch (err) {
    throw new Error(`createBoard: ${err.message}`, { cause: err });
  }
}

async function updateBoard(id, fields) {
  try {
    const { title, background_color } = fields;
    const result = await pool.query(
      'UPDATE boards SET title = COALESCE($1, title), background_color = COALESCE($2, background_color), updated_at = NOW() WHERE id = $3 RETURNING *',
      [title, background_color, id]
    );
    return result.rows[0];
  } catch (err) {
    throw new Error(`updateBoard: ${err.message}`, { cause: err });
  }
}

async function deleteBoard(id) {
  try {
    const result = await pool.query('DELETE FROM boards WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`deleteBoard: ${err.message}`, { cause: err });
  }
}

async function getBoardLabels(board_id) {
  try {
    const result = await pool.query(
      'SELECT * FROM labels WHERE board_id = $1 ORDER BY name ASC',
      [board_id]
    );
    return result.rows;
  } catch (err) {
    throw new Error(`getBoardLabels: ${err.message}`, { cause: err });
  }
}

async function createBoardLabel(board_id, name, color) {
  try {
    const result = await pool.query(
      'INSERT INTO labels (board_id, name, color) VALUES ($1, $2, $3) RETURNING *',
      [board_id, name, color || '#61bd4f']
    );
    return result.rows[0];
  } catch (err) {
    throw new Error(`createBoardLabel: ${err.message}`, { cause: err });
  }
}

module.exports = { getAllBoards, getBoardById, createBoard, updateBoard, deleteBoard, getBoardLabels, createBoardLabel };
