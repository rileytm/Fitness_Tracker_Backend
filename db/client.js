// build and export your unconnected client here
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'https://localhost:5432/fitness-dev-2';

const client = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

module.exports = client;
