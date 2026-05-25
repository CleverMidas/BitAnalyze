import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import postgres from 'postgres';

async function main() {
  const connectionString =
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/bitanalyze';
  const sql = postgres(connectionString);

  try {
    const bootstrapPath = join(import.meta.dirname, 'bootstrap.sql');
    const bootstrapSql = await readFile(bootstrapPath, 'utf8');
    await sql.unsafe(bootstrapSql);
    console.log('Database bootstrap completed.');
  } finally {
    await sql.end();
  }
}

void main();
