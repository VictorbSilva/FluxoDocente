import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type pg from 'pg';
import { createApp } from '../app.js';
import { hashSenha } from '../auth/senha.js';
import { prepararBanco } from './ajuda.js';
import { entrar, novoCliente } from './http.js';

const SENHA = 'senha-correta-123';
const lessonIds: ReadonlySet<string> = new Set(['aula-teste-1', 'aula-teste-2']);

let pool: pg.Pool;
let servidor: Server;
let baseUrl: string;
let idDeA: string;
let idDeB: string;
let cookieDeA: string;
let cookieDeB: string;

async function criarUsuario(email: string): Promise<string> {
  const { rows } = await pool.query<{ id: string }>(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
    [email, await hashSenha(SENHA)],
  );
  return rows[0].id;
}

async function linhasDe(userId: string): Promise<{ lesson_id: string }[]> {
  const { rows } = await pool.query<{ lesson_id: string }>(
    'SELECT lesson_id FROM lesson_completions WHERE user_id = $1 ORDER BY lesson_id',
    [userId],
  );
  return rows;
}

before(async () => {
  pool = await prepararBanco();
  idDeA = await criarUsuario('a@exemplo.com');
  idDeB = await criarUsuario('b@exemplo.com');

  servidor = createApp({ production: false, pool, sessionSecret: 'x'.repeat(40), lessonIds }).listen(0);
  await once(servidor, 'listening');
  baseUrl = `http://localhost:${(servidor.address() as AddressInfo).port}`;

  cookieDeA = await entrar(baseUrl, 'a@exemplo.com', SENHA);
  cookieDeB = await entrar(baseUrl, 'b@exemplo.com', SENHA);
});

beforeEach(async () => {
  await pool.query('DELETE FROM lesson_completions');
});

after(async () => {
  servidor?.closeAllConnections();
  servidor?.close();
  await pool?.end();
});

test('sem cookie, GET e PUT de progresso devolvem 401', async () => {
  const cliente = novoCliente(baseUrl);
  const get = await cliente.enviar('GET', '/api/me/progress');
  const put = await cliente.enviar('PUT', '/api/me/progress/aula-teste-1');

  assert.equal(get.status, 401);
  assert.equal(get.corpo.error.code, 'nao_autenticado');
  assert.equal(put.status, 401);
  assert.equal(put.corpo.error.code, 'nao_autenticado');
  assert.deepEqual(await linhasDe(idDeA), []);
  assert.deepEqual(await linhasDe(idDeB), []);
});

test('PUT conclui a aula e repetir devolve o mesmo completedAt, com uma linha só', async () => {
  const cliente = novoCliente(baseUrl);
  const primeiro = await cliente.enviar('PUT', '/api/me/progress/aula-teste-1', { cookie: cookieDeA });

  assert.equal(primeiro.status, 200);
  assert.equal(primeiro.corpo.lessonId, 'aula-teste-1');
  assert.equal(typeof primeiro.corpo.completedAt, 'string');
  assert.equal(new Date(primeiro.corpo.completedAt).toISOString(), primeiro.corpo.completedAt);
  assert.deepEqual(Object.keys(primeiro.corpo).sort(), ['completedAt', 'lessonId']);

  const repetido = await cliente.enviar('PUT', '/api/me/progress/aula-teste-1', { cookie: cookieDeA });

  assert.equal(repetido.status, 200);
  assert.deepEqual(repetido.corpo, primeiro.corpo);
  assert.deepEqual(await linhasDe(idDeA), [{ lesson_id: 'aula-teste-1' }]);
});

test('GET devolve só o progresso do dono da sessão', async () => {
  const cliente = novoCliente(baseUrl);
  const put = await cliente.enviar('PUT', '/api/me/progress/aula-teste-1', { cookie: cookieDeA });

  const deA = await cliente.enviar('GET', '/api/me/progress', { cookie: cookieDeA });
  assert.equal(deA.status, 200);
  assert.deepEqual(deA.corpo, {
    completions: [{ lessonId: 'aula-teste-1', completedAt: put.corpo.completedAt }],
  });

  const deB = await cliente.enviar('GET', '/api/me/progress', { cookie: cookieDeB });
  assert.equal(deB.status, 200);
  assert.deepEqual(deB.corpo, { completions: [] });
});

test('userId no corpo e na query é ignorado: o PUT de B grava para B', async () => {
  const cliente = novoCliente(baseUrl);
  const putDeA = await cliente.enviar('PUT', '/api/me/progress/aula-teste-1', { cookie: cookieDeA });
  const antesDeA = await cliente.enviar('GET', '/api/me/progress', { cookie: cookieDeA });

  const putDeB = await cliente.enviar('PUT', `/api/me/progress/aula-teste-2?userId=${idDeA}`, {
    cookie: cookieDeB,
    corpo: { userId: idDeA },
  });

  assert.equal(putDeB.status, 200);
  assert.equal(putDeB.corpo.lessonId, 'aula-teste-2');
  assert.deepEqual(await linhasDe(idDeB), [{ lesson_id: 'aula-teste-2' }]);
  assert.deepEqual(await linhasDe(idDeA), [{ lesson_id: 'aula-teste-1' }]);

  const depoisDeA = await cliente.enviar('GET', '/api/me/progress', { cookie: cookieDeA });
  assert.deepEqual(depoisDeA.corpo, antesDeA.corpo);
  assert.deepEqual(depoisDeA.corpo, {
    completions: [{ lessonId: 'aula-teste-1', completedAt: putDeA.corpo.completedAt }],
  });
});

test('PUT de aula fora do catálogo devolve 404 aula_inexistente', async () => {
  const cliente = novoCliente(baseUrl);
  const resposta = await cliente.enviar('PUT', '/api/me/progress/aula-que-nao-existe', { cookie: cookieDeA });

  assert.equal(resposta.status, 404);
  assert.equal(resposta.corpo.error.code, 'aula_inexistente');
  assert.deepEqual(await linhasDe(idDeA), []);
});

test('PUT sem o cabeçalho X-FluxoDocente é recusado', async () => {
  const cliente = novoCliente(baseUrl);
  const resposta = await cliente.enviar('PUT', '/api/me/progress/aula-teste-1', {
    cookie: cookieDeA,
    semCabecalho: true,
  });

  assert.equal(resposta.status, 403);
  assert.equal(resposta.corpo.error.code, 'origem_invalida');
  assert.deepEqual(await linhasDe(idDeA), []);
});

test('GET ignora linhas de aulas que não estão no catálogo', async () => {
  await pool.query(
    'INSERT INTO lesson_completions (user_id, lesson_id) VALUES ($1, $2)',
    [idDeA, 'aula-removida'],
  );
  const cliente = novoCliente(baseUrl);
  const put = await cliente.enviar('PUT', '/api/me/progress/aula-teste-1', { cookie: cookieDeA });

  const resposta = await cliente.enviar('GET', '/api/me/progress', { cookie: cookieDeA });

  assert.equal(resposta.status, 200);
  assert.deepEqual(resposta.corpo, {
    completions: [{ lessonId: 'aula-teste-1', completedAt: put.corpo.completedAt }],
  });
});
