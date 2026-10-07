import pg from 'pg';

export function criarPool(connectionString: string): pg.Pool {
  return new pg.Pool({ connectionString, max: 5 });
}
