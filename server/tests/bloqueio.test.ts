import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type pg from 'pg';
import { createApp } from '../app.js';
import { hashSenha } from '../auth/senha.js';
import { prepararBanco } from './ajuda.js';
import { catalogoDeTeste, matricular } from './catalogo-de-teste.js';
import { entrar, novoCliente } from './http.js';

const SENHA = 'senha-correta-123';
const MATRICULA_NECESSARIA = {
  error: { code: 'matricula_necessaria', message: 'Faça a matrícula no curso para continuar.' },
};
const MODULO_BLOQUEADO = {
  error: { code: 'modulo_bloqueado', message: 'Conclua o módulo anterior para liberar este.' },
};

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

async function concluirNoBanco(userId: string, ...lessonIds: string[]): Promise<void> {
  for (const lessonId of lessonIds) {
    await pool.query('INSERT INTO lesson_completions (user_id, lesson_id) VALUES ($1, $2)', [userId, lessonId]);
  }
}

async function aprovarNoBanco(userId: string, moduleId: string): Promise<void> {
  await pool.query(
    'INSERT INTO exercise_results (user_id, module_id, melhor_acertos, total, aprovado_em) VALUES ($1, $2, 10, 10, now())',
    [userId, moduleId],
  );
}

async function aulasDe(userId: string): Promise<string[]> {
  const { rows } = await pool.query<{ lesson_id: string }>(
    'SELECT lesson_id FROM lesson_completions WHERE user_id = $1 ORDER BY lesson_id',
    [userId],
  );
  return rows.map((linha) => linha.lesson_id);
}

async function anotacoesDe(userId: string): Promise<string[]> {
  const { rows } = await pool.query<{ lesson_id: string }>(
    'SELECT lesson_id FROM lesson_notes WHERE user_id = $1 ORDER BY lesson_id',
    [userId],
  );
  return rows.map((linha) => linha.lesson_id);
}

before(async () => {
  pool = await prepararBanco();
  idDeA = await criarUsuario('a@exemplo.com');
  idDeB = await criarUsuario('b@exemplo.com');

  servidor = createApp({
    production: false,
    pool,
    sessionSecret: 'x'.repeat(40),
    catalogo: catalogoDeTeste,
  }).listen(0);
  await once(servidor, 'listening');
  baseUrl = `http://localhost:${(servidor.address() as AddressInfo).port}`;

  cookieDeA = await entrar(baseUrl, 'a@exemplo.com', SENHA);
  cookieDeB = await entrar(baseUrl, 'b@exemplo.com', SENHA);
});

beforeEach(async () => {
  await pool.query('DELETE FROM lesson_completions');
  await pool.query('DELETE FROM lesson_notes');
  await pool.query('DELETE FROM enrollments');
  await pool.query('DELETE FROM exercise_results');
});

after(async () => {
  servidor?.closeAllConnections();
  servidor?.close();
  await pool?.end();
});

test('sem matrícula, concluir aula e ler ou gravar anotação devolvem 403 matricula_necessaria', async () => {
  const cliente = novoCliente(baseUrl);
  const progresso = await cliente.enviar('PUT', '/api/me/progress/aula-teste-1', { cookie: cookieDeA });
  const getNota = await cliente.enviar('GET', '/api/me/notes/aula-teste-1', { cookie: cookieDeA });
  const putNota = await cliente.enviar('PUT', '/api/me/notes/aula-teste-1', {
    cookie: cookieDeA,
    corpo: { content: 'nota' },
  });

  for (const resposta of [progresso, getNota, putNota]) {
    assert.equal(resposta.status, 403);
    assert.deepEqual(resposta.corpo, MATRICULA_NECESSARIA);
  }

  assert.deepEqual(await aulasDe(idDeA), []);
  assert.deepEqual(await anotacoesDe(idDeA), []);
});

test('a matrícula é por curso: matriculado em curso-teste conclui aula dele, mas não a de curso-outro', async () => {
  await matricular(pool, idDeA);
  const cliente = novoCliente(baseUrl);

  const doCurso = await cliente.enviar('PUT', '/api/me/progress/aula-teste-1', { cookie: cookieDeA });
  assert.equal(doCurso.status, 200);

  const deOutroCurso = await cliente.enviar('PUT', '/api/me/progress/aula-outro-1', { cookie: cookieDeA });
  assert.equal(deOutroCurso.status, 403);
  assert.deepEqual(deOutroCurso.corpo, MATRICULA_NECESSARIA);

  assert.deepEqual(await aulasDe(idDeA), ['aula-teste-1']);
});

test("aula de 'mod-b' fica bloqueada até as duas aulas de 'mod-a' serem concluídas", async () => {
  await matricular(pool, idDeA);
  const cliente = novoCliente(baseUrl);
  await cliente.enviar('PUT', '/api/me/progress/aula-teste-1', { cookie: cookieDeA });

  const bloqueada = await cliente.enviar('PUT', '/api/me/progress/aula-teste-3', { cookie: cookieDeA });
  assert.equal(bloqueada.status, 403);
  assert.deepEqual(bloqueada.corpo, MODULO_BLOQUEADO);
  assert.deepEqual(await aulasDe(idDeA), ['aula-teste-1']);

  await cliente.enviar('PUT', '/api/me/progress/aula-teste-2', { cookie: cookieDeA });
  const liberada = await cliente.enviar('PUT', '/api/me/progress/aula-teste-3', { cookie: cookieDeA });
  assert.equal(liberada.status, 200);
  assert.deepEqual(await aulasDe(idDeA), ['aula-teste-1', 'aula-teste-2', 'aula-teste-3']);
});

test("aula de 'mod-c' fica bloqueada até o exercício de 'mod-b' ser aprovado", async () => {
  await matricular(pool, idDeA);
  await concluirNoBanco(idDeA, 'aula-teste-1', 'aula-teste-2', 'aula-teste-3');
  const cliente = novoCliente(baseUrl);

  const bloqueada = await cliente.enviar('PUT', '/api/me/progress/aula-teste-4', { cookie: cookieDeA });
  assert.equal(bloqueada.status, 403);
  assert.deepEqual(bloqueada.corpo, MODULO_BLOQUEADO);

  await aprovarNoBanco(idDeA, 'mod-b');
  const liberada = await cliente.enviar('PUT', '/api/me/progress/aula-teste-4', { cookie: cookieDeA });
  assert.equal(liberada.status, 200);
  assert.deepEqual(await aulasDe(idDeA), ['aula-teste-1', 'aula-teste-2', 'aula-teste-3', 'aula-teste-4']);
});

test("a aprovação de B em 'mod-b' não libera 'mod-c' para A", async () => {
  await matricular(pool, idDeA);
  await matricular(pool, idDeB);
  await concluirNoBanco(idDeA, 'aula-teste-1', 'aula-teste-2', 'aula-teste-3');
  await aprovarNoBanco(idDeB, 'mod-b');
  const cliente = novoCliente(baseUrl);

  const resposta = await cliente.enviar('PUT', '/api/me/progress/aula-teste-4', { cookie: cookieDeA });

  assert.equal(resposta.status, 403);
  assert.deepEqual(resposta.corpo, MODULO_BLOQUEADO);
  assert.deepEqual(await aulasDe(idDeA), ['aula-teste-1', 'aula-teste-2', 'aula-teste-3']);
});

test('anotar exige matrícula, mas não exige módulo liberado', async () => {
  await matricular(pool, idDeA);
  const cliente = novoCliente(baseUrl);

  const put = await cliente.enviar('PUT', '/api/me/notes/aula-teste-4', {
    cookie: cookieDeA,
    corpo: { content: 'nota em módulo bloqueado' },
  });
  assert.equal(put.status, 200);
  assert.equal(put.corpo.content, 'nota em módulo bloqueado');

  const get = await cliente.enviar('GET', '/api/me/notes/aula-teste-4', { cookie: cookieDeA });
  assert.equal(get.status, 200);
  assert.deepEqual(get.corpo, put.corpo);
  assert.deepEqual(await anotacoesDe(idDeA), ['aula-teste-4']);
});

test('GET /api/me/progress continua devolvendo tudo o que está gravado', async () => {
  await concluirNoBanco(idDeA, 'aula-teste-4', 'aula-outro-1');
  const cliente = novoCliente(baseUrl);

  const resposta = await cliente.enviar('GET', '/api/me/progress', { cookie: cookieDeA });

  assert.equal(resposta.status, 200);
  assert.deepEqual(
    resposta.corpo.completions.map((conclusao: { lessonId: string }) => conclusao.lessonId).sort(),
    ['aula-outro-1', 'aula-teste-4'],
  );
});
