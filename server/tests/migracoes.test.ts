import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import type pg from 'pg';
import { prepararBanco } from './ajuda.js';
import { aplicarMigracoes } from '../db/migracoes.js';

let pool: pg.Pool;

before(async () => {
  pool = await prepararBanco();
});

after(async () => {
  await pool?.end();
});

test('migrações já aplicadas não são executadas novamente', async () => {
  assert.deepEqual(await aplicarMigracoes(pool), []);
});

test('tabelas users, lesson_completions e session existem', async () => {
  const { rows } = await pool.query<{ table_name: string }>(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = current_schema()
      AND table_name = ANY($1::text[])
    ORDER BY table_name
  `, [['users', 'lesson_completions', 'session']]);

  assert.deepEqual(rows.map((row) => row.table_name), ['lesson_completions', 'session', 'users']);
});
