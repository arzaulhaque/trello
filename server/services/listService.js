const pool = require('../config/db');

async function createList(board_id, title) {
  const posResult = await pool.query(
    'SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM lists WHERE board_id = $1',
    [board_id]
  );
  const position = posResult.rows[0].next_pos;

  const result = await pool.query(
    'INSERT INTO lists (board_id, title, position) VALUES ($1, $2, $3) RETURNING *',
    [board_id, title, position]
  );
  return result.rows[0];
}

async function updateList(id, fields) {
  const { title } = fields;
  const result = await pool.query(
    'UPDATE lists SET title = COALESCE($1, title), updated_at = NOW() WHERE id = $2 RETURNING *',
    [title, id]
  );
  return result.rows[0];
}

async function deleteList(id) {
  const result = await pool.query('DELETE FROM lists WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
}

async function reorderLists(board_id, orderedIds) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < orderedIds.length; i++) {
      await client.query(
        'UPDATE lists SET position = $1, updated_at = NOW() WHERE id = $2 AND board_id = $3',
        [i, orderedIds[i], board_id]
      );
    }
    await client.query('COMMIT');
    const result = await pool.query(
      'SELECT * FROM lists WHERE board_id = $1 ORDER BY position ASC',
      [board_id]
    );
    return result.rows;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { createList, updateList, deleteList, reorderLists };
