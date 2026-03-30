const { Pool } = require('pg');

// Neon (and any hosted Postgres) requires SSL.  We keep rejectUnauthorized
// configurable so developers can override it for strictly local instances.
const useSSL =
  process.env.DATABASE_URL?.includes('neon.tech') ||
  process.env.NODE_ENV === 'production' ||
  process.env.DB_SSL === 'true';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
  // Pool tunables — override via environment variables
  max: parseInt(process.env.POOL_MAX, 10) || 10,
  idleTimeoutMillis: parseInt(process.env.POOL_IDLE_TIMEOUT, 10) || 30000,
  connectionTimeoutMillis: parseInt(process.env.POOL_CONNECTION_TIMEOUT, 10) || 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

/**
 * Verify that the pool can reach the database.
 * Call this once at server startup.
 */
async function testConnection() {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    console.log('Database connection established successfully');
  } finally {
    client.release();
  }
}

module.exports = pool;
module.exports.testConnection = testConnection;
