import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

async function runMigration() {
  const connectionString = `postgres://postgres:TKBtdoHBtvxVsk2d@db.wkhsvwkzgioaduunnbyj.supabase.co:5432/postgres`;
  
  console.log("Connecting to Supabase PostgreSQL...");
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected successfully to Supabase DB!");

    const sqlPath = path.join(__dirname, '..', 'supabase_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Executing supabase_schema.sql...");
    await client.query(sql);
    console.log("Schema migration applied successfully!");

    // Check tables created
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log("Public tables in database:", res.rows.map(r => r.table_name));

  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await client.end();
  }
}

runMigration();

