import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import type pg from 'pg';

export async function aplicarMigracoes(pool: pg.Pool): Promise<string[]> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const pasta = path.resolve('server/migrations');
  const arquivos = (await readdir(pasta)).filter((nome) => nome.endsWith('.sql')).sort();
  const { rows } = await pool.query<{ version: string }>('SELECT version FROM schema_migrations');
  const registradas = new Set(rows.map((row) => row.version));
  const aplicadas: string[] = [];

  for (const arquivo of arquivos) {
    if (registradas.has(arquivo)) {
      continue;
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      await client.query(await readFile(path.join(pasta, arquivo), 'utf8'));
      await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [arquivo]);
      await client.query('COMMIT');
      aplicadas.push(arquivo);
    } catch (erro) {
      await client.query('ROLLBACK');
      throw erro;
    } finally {
      client.release();
    }
  }

  return aplicadas;
}
