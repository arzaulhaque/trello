const pool = require('../config/db');

async function getAllUsers() {
  const result = await pool.query(
    'SELECT id, username, email, avatar FROM users ORDER BY username ASC'
  );
  return result.rows;
}

module.exports = { getAllUsers };
