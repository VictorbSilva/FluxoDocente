import { lerDatabaseUrl } from '../config.js';
import { criarPool } from '../db/pool.js';
import { aplicarMigracoes } from '../db/migracoes.js';
import type pg from 'pg';

export async function prepararBanco(): Promise<pg.Pool> {
  const pool = criarPool(lerDatabaseUrl('TEST_DATABASE_URL'));

  try {
    await aplicarMigracoes(pool);
    await pool.query('TRUNCATE logins, acessos_diarios, password_resets, certificates, module_skips, exercise_results, placement_refusals, placement_answers, enrollments, lesson_notes, lesson_completions, users, session');
    return pool;
  } catch (erro) {
    await pool.end();
    throw erro;
  }
}

// Dia de hoje no fuso do registro de acessos, no formato AAAA-MM-DD.
export function hojeEmFortaleza(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Fortaleza' }).format(new Date());
}

export async function registrosDeUso(pool: pg.Pool, userId: string): Promise<{ logins: string[]; dias: string[] }> {
  const { rows: logins } = await pool.query<{ origem: string }>(
    'SELECT origem FROM logins WHERE user_id = $1 ORDER BY id',
    [userId],
  );
  const { rows: dias } = await pool.query<{ dia: string }>(
    'SELECT dia::text AS dia FROM acessos_diarios WHERE user_id = $1 ORDER BY dia',
    [userId],
  );
  return { logins: logins.map((linha) => linha.origem), dias: dias.map((linha) => linha.dia) };
}
