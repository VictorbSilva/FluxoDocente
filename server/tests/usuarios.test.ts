import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import type pg from 'pg';
import { verificarSenha } from '../auth/senha.js';
import { criarUsuario, listarUsuarios, resetarSenha } from '../usuarios.js';
import { prepararBanco } from './ajuda.js';

let pool: pg.Pool;

before(async () => {
  pool = await prepararBanco();
});

beforeEach(async () => {
  await pool.query('TRUNCATE lesson_completions, users, session');
});

after(async () => {
  await pool?.end();
});

test('criarUsuario normaliza o e-mail e gera uma senha de 12 caracteres', async () => {
  const conta = await criarUsuario(pool, ' Ana@X.com ');
  const { rows } = await pool.query('SELECT email, password_hash FROM users');

  assert.deepEqual(Object.keys(conta).sort(), ['email', 'senha']);
  assert.equal(conta.email, 'ana@x.com');
  assert.equal(conta.senha.length, 12);
  assert.match(conta.senha, /^[A-Za-z0-9_-]{12}$/);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].email, 'ana@x.com');
  assert.notEqual(rows[0].password_hash, conta.senha);
  assert.equal(await verificarSenha(conta.senha, rows[0].password_hash), true);
});

test('criarUsuario recusa um e-mail já cadastrado após normalizar', async () => {
  await criarUsuario(pool, 'ana@x.com');

  await assert.rejects(criarUsuario(pool, ' Ana@X.com '), {
    message: 'Já existe uma conta com esse e-mail.',
  });
});

test('resetarSenha troca a senha e revoga somente as sessões da conta', async () => {
  const conta = await criarUsuario(pool, 'ana@x.com');
  await criarUsuario(pool, 'outro@x.com');
  const { rows: usuarios } = await pool.query('SELECT id, email, password_hash FROM users ORDER BY email');
  const [ana, outro] = usuarios;

  for (const usuario of usuarios) {
    await pool.query(
      "INSERT INTO session (sid, sess, expire) VALUES ($1, $2::json, now() + interval '1 day')",
      [usuario.email, JSON.stringify({ userId: usuario.id })],
    );
  }

  const resetada = await resetarSenha(pool, 'ana@x.com');
  const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [ana.id]);
  const { rows: sessoes } = await pool.query('SELECT sid, sess FROM session');

  assert.equal(resetada.email, 'ana@x.com');
  assert.equal(resetada.senha.length, 12);
  assert.notEqual(resetada.senha, conta.senha);
  assert.notEqual(rows[0].password_hash, ana.password_hash);
  assert.equal(await verificarSenha(conta.senha, rows[0].password_hash), false);
  assert.equal(await verificarSenha(resetada.senha, rows[0].password_hash), true);
  assert.deepEqual(sessoes, [{ sid: outro.email, sess: { userId: outro.id } }]);
});

test('resetarSenha recusa um e-mail inexistente', async () => {
  await assert.rejects(resetarSenha(pool, 'ninguem@x.com'), {
    message: 'Conta não encontrada.',
  });
});

test('listarUsuarios devolve somente e-mail e data de criação, por e-mail', async () => {
  await criarUsuario(pool, 'z@x.com');
  await criarUsuario(pool, 'a@x.com');
  const { rows } = await pool.query('SELECT email, created_at FROM users ORDER BY email');

  assert.deepEqual(await listarUsuarios(pool), rows);
  assert.deepEqual(rows.map((usuario) => usuario.email), ['a@x.com', 'z@x.com']);
});
