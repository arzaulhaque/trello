const pool = require('../config/db');

async function createCard(list_id, title, description, due_date) {
  const posResult = await pool.query(
    'SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM cards WHERE list_id = $1',
    [list_id]
  );
  const position = posResult.rows[0].next_pos;

  const result = await pool.query(
    'INSERT INTO cards (list_id, title, description, due_date, position) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [list_id, title, description || null, due_date || null, position]
  );
  return result.rows[0];
}

async function getCardById(id) {
  const result = await pool.query(
    `SELECT c.*,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', l.id, 'name', l.name, 'color', l.color)) FILTER (WHERE l.id IS NOT NULL), '[]') AS labels,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', u.id, 'username', u.username, 'email', u.email)) FILTER (WHERE u.id IS NOT NULL), '[]') AS members,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object(
          'id', ch.id, 'title', ch.title,
          'items', (
            SELECT COALESCE(json_agg(jsonb_build_object('id', ci.id, 'content', ci.content, 'is_completed', ci.is_completed) ORDER BY ci.position), '[]')
            FROM checklist_items ci WHERE ci.checklist_id = ch.id
          )
        )) FILTER (WHERE ch.id IS NOT NULL), '[]'
      ) AS checklists
     FROM cards c
     LEFT JOIN card_labels cl ON c.id = cl.card_id
     LEFT JOIN labels l ON cl.label_id = l.id
     LEFT JOIN card_members cm ON c.id = cm.card_id
     LEFT JOIN users u ON cm.user_id = u.id
     LEFT JOIN checklists ch ON c.id = ch.card_id
     WHERE c.id = $1
     GROUP BY c.id`,
    [id]
  );
  return result.rows[0] || null;
}

async function updateCard(id, fields) {
  const { title, description, due_date } = fields;
  const result = await pool.query(
    `UPDATE cards 
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         due_date = COALESCE($3, due_date),
         updated_at = NOW()
     WHERE id = $4 RETURNING *`,
    [title, description, due_date, id]
  );
  return result.rows[0];
}

async function deleteCard(id) {
  const result = await pool.query('DELETE FROM cards WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
}

async function moveCard(card_id, target_list_id, position) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'UPDATE cards SET position = position - 1, updated_at = NOW() WHERE list_id = (SELECT list_id FROM cards WHERE id = $1) AND position > (SELECT position FROM cards WHERE id = $1)',
      [card_id]
    );
    await client.query(
      'UPDATE cards SET position = position + 1, updated_at = NOW() WHERE list_id = $1 AND position >= $2',
      [target_list_id, position]
    );
    const result = await client.query(
      'UPDATE cards SET list_id = $1, position = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [target_list_id, position, card_id]
    );
    await client.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function reorderCards(list_id, orderedIds) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < orderedIds.length; i++) {
      await client.query(
        'UPDATE cards SET position = $1, updated_at = NOW() WHERE id = $2 AND list_id = $3',
        [i, orderedIds[i], list_id]
      );
    }
    await client.query('COMMIT');
    const result = await pool.query(
      'SELECT * FROM cards WHERE list_id = $1 ORDER BY position ASC',
      [list_id]
    );
    return result.rows;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function addLabel(card_id, label_id) {
  await pool.query(
    'INSERT INTO card_labels (card_id, label_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [card_id, label_id]
  );
}

async function removeLabel(card_id, label_id) {
  await pool.query(
    'DELETE FROM card_labels WHERE card_id = $1 AND label_id = $2',
    [card_id, label_id]
  );
}

async function addMember(card_id, user_id) {
  await pool.query(
    'INSERT INTO card_members (card_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [card_id, user_id]
  );
}

async function removeMember(card_id, user_id) {
  await pool.query(
    'DELETE FROM card_members WHERE card_id = $1 AND user_id = $2',
    [card_id, user_id]
  );
}

async function addChecklist(card_id, title) {
  const result = await pool.query(
    'INSERT INTO checklists (card_id, title) VALUES ($1, $2) RETURNING *',
    [card_id, title]
  );
  return result.rows[0];
}

async function addChecklistItem(checklist_id, content) {
  const posResult = await pool.query(
    'SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM checklist_items WHERE checklist_id = $1',
    [checklist_id]
  );
  const position = posResult.rows[0].next_pos;
  const result = await pool.query(
    'INSERT INTO checklist_items (checklist_id, content, position) VALUES ($1, $2, $3) RETURNING *',
    [checklist_id, content, position]
  );
  return result.rows[0];
}

async function updateChecklistItem(item_id, fields) {
  const { content, is_completed } = fields;
  const result = await pool.query(
    'UPDATE checklist_items SET content = COALESCE($1, content), is_completed = COALESCE($2, is_completed) WHERE id = $3 RETURNING *',
    [content, is_completed, item_id]
  );
  return result.rows[0];
}

async function searchCards(query) {
  const result = await pool.query(
    `SELECT c.*, b.title AS board_title, l.title AS list_title
     FROM cards c
     JOIN lists l ON c.list_id = l.id
     JOIN boards b ON l.board_id = b.id
     WHERE c.title ILIKE $1 OR c.description ILIKE $1
     ORDER BY c.created_at DESC
     LIMIT 50`,
    [`%${query}%`]
  );
  return result.rows;
}

module.exports = {
  createCard, getCardById, updateCard, deleteCard,
  moveCard, reorderCards,
  addLabel, removeLabel,
  addMember, removeMember,
  addChecklist, addChecklistItem, updateChecklistItem,
  searchCards,
};
