import { randomBytes } from 'node:crypto';
import type pg from 'pg';
import { hashSenha } from './auth/senha.js';

export function gerarSenha(): string {
  return randomBytes(9).toString('base64url');
}

export async function criarUsuario(pool: pg.Pool, email: string, senha?: string): Promise<{ email: string; senha: string }> {
  if (senha !== undefined && (senha.length < 8 || senha.length > 200)) {
    throw new Error('A senha precisa ter de 8 a 200 caracteres.');
  }
  const normalizado = email.trim().toLowerCase();
  senha ??= gerarSenha();
  const hash = await hashSenha(senha);

  try {
    await pool.query('INSERT INTO users (email, password_hash) VALUES ($1, $2)', [normalizado, hash]);
  } catch (erro) {
    if ((erro as pg.DatabaseError).code === '23505') {
      throw new Error('Já existe uma conta com esse e-mail.');
    }

    throw erro;
  }

  return { email: normalizado, senha };
}

export async function resetarSenha(pool: pg.Pool, email: string, senha?: string): Promise<{ email: string; senha: string }> {
  if (senha !== undefined && (senha.length < 8 || senha.length > 200)) {
    throw new Error('A senha precisa ter de 8 a 200 caracteres.');
  }
  const normalizado = email.trim().toLowerCase();
  senha ??= gerarSenha();
  const hash = await hashSenha(senha);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const { rows } = await client.query<{ id: string }>(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id',
      [hash, normalizado],
    );

    if (rows.length === 0) {
      throw new Error('Conta não encontrada.');
    }

    await client.query("DELETE FROM session WHERE sess->>'userId' = $1", [rows[0].id]);
    await client.query('COMMIT');
    return { email: normalizado, senha };
  } catch (erro) {
    await client.query('ROLLBACK');
    throw erro;
  } finally {
    client.release();
  }
}

export async function listarUsuarios(pool: pg.Pool): Promise<{ email: string; created_at: Date }[]> {
  const { rows } = await pool.query<{ email: string; created_at: Date }>(
    'SELECT email, created_at FROM users ORDER BY email',
  );
  return rows;
}
