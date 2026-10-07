import { lerDatabaseUrl } from '../config.js';
import { criarPool } from '../db/pool.js';
import { aplicarMigracoes } from '../db/migracoes.js';
import type pg from 'pg';

export async function prepararBanco(): Promise<pg.Pool> {
  const pool = criarPool(lerDatabaseUrl('TEST_DATABASE_URL'));

  try {
    await aplicarMigracoes(pool);
    await pool.query('TRUNCATE lesson_completions, users, session');
    return pool;
  } catch (erro) {
    await pool.end();
    throw erro;
  }
}
