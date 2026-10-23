import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type pg from 'pg';
import { createApp } from '../app.js';
import { hashSenha } from '../auth/senha.js';
import { prepararBanco } from './ajuda.js';
import { catalogoDeTeste, gabaritoDeTeste, matricular } from './catalogo-de-teste.js';
import { entrar, novoCliente } from './http.js';

const SENHA = 'senha-correta-123';
// 4 de 5 acertos em 'mod-b' e erro na pergunta de 'mod-c'.
const QUATRO_EM_MOD_B = [0, 0, 0, 0, 1, 1];
const TRES_EM_MOD_B = [0, 0, 0, 1, 1, 1];
const DISPENSA_INDISPONIVEL = {
  error: { code: 'dispensa_indisponivel', message: 'Este módulo não pode ser dispensado.' },
};
const MODULO_BLOQUEADO = {
  error: { code: 'modulo_bloqueado', message: 'Conclua o módulo anterior para liberar este.' },
};
const MATRICULA_NECESSARIA = {
  error: { code: 'matricula_necessaria', message: 'Faça a matrícula no curso para continuar.' },
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

async function dispensasNoBanco(userId: string): Promise<string[]> {
  const { rows } = await pool.query<{ module_id: string }>(
    'SELECT module_id FROM module_skips WHERE user_id = $1 ORDER BY module_id',
    [userId],
  );
  return rows.map((linha) => linha.module_id);
}

async function responderNivelamento(cookie: string, respostas: number[]): Promise<void> {
  const resposta = await novoCliente(baseUrl).enviar('POST', '/api/me/nivelamento', { cookie, corpo: { respostas } });
  assert.equal(resposta.status, 201);
}

function dispensar(cookie: string, moduleId: string) {
  return novoCliente(baseUrl).enviar('POST', `/api/me/dispensas/${moduleId}`, { cookie });
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
    gabaritos: gabaritoDeTeste,
  }).listen(0);
  await once(servidor, 'listening');
  baseUrl = `http://localhost:${(servidor.address() as AddressInfo).port}`;

  cookieDeA = await entrar(baseUrl, 'a@exemplo.com', SENHA);
  cookieDeB = await entrar(baseUrl, 'b@exemplo.com', SENHA);
});

beforeEach(async () => {
  await pool.query('DELETE FROM module_skips');
  await pool.query('DELETE FROM placement_answers');
  await pool.query('DELETE FROM lesson_completions');
  await pool.query('DELETE FROM exercise_results');
  await pool.query('DELETE FROM enrollments');
  await matricular(pool, idDeA);
});

after(async () => {
  servidor?.closeAllConnections();
  servidor?.close();
  await pool?.end();
});

test('antes de responder ao nivelamento, nada é dispensável nem dispensado', async () => {
  const get = await novoCliente(baseUrl).enviar('GET', '/api/me/nivelamento', { cookie: cookieDeA });

  assert.equal(get.status, 200);
  assert.deepEqual(get.corpo, { disponivel: true, respondido: false, dispensaveis: [], dispensados: [] });
});

test("com 4 acertos em 'mod-b' e erro em 'mod-c', só 'mod-b' é dispensável, sem devolver os acertos", async () => {
  const cliente = novoCliente(baseUrl);

  const post = await cliente.enviar('POST', '/api/me/nivelamento', {
    cookie: cookieDeA,
    corpo: { respostas: QUATRO_EM_MOD_B },
  });
  const get = await cliente.enviar('GET', '/api/me/nivelamento', { cookie: cookieDeA });

  assert.equal(post.status, 201);
  for (const resposta of [post, get]) {
    assert.deepEqual(resposta.corpo, { disponivel: true, respondido: true, dispensaveis: ['mod-b'], dispensados: [] });
    assert.doesNotMatch(JSON.stringify(resposta.corpo), /acertos|nota/i);
  }
});

test("'mod-b' só é dispensado depois de liberado; repetir devolve o mesmo resultado", async () => {
  await responderNivelamento(cookieDeA, QUATRO_EM_MOD_B);

  const bloqueado = await dispensar(cookieDeA, 'mod-b');
  assert.equal(bloqueado.status, 403);
  assert.deepEqual(bloqueado.corpo, MODULO_BLOQUEADO);
  assert.deepEqual(await dispensasNoBanco(idDeA), []);

  await concluirNoBanco(idDeA, 'aula-teste-1', 'aula-teste-2');
  const esperado = { disponivel: true, respondido: true, dispensaveis: ['mod-b'], dispensados: ['mod-b'] };

  const primeira = await dispensar(cookieDeA, 'mod-b');
  assert.equal(primeira.status, 200);
  assert.deepEqual(primeira.corpo, esperado);
  assert.doesNotMatch(JSON.stringify(primeira.corpo), /acertos|nota/i);

  const repetida = await dispensar(cookieDeA, 'mod-b');
  assert.equal(repetida.status, 200);
  assert.deepEqual(repetida.corpo, esperado);

  const get = await novoCliente(baseUrl).enviar('GET', '/api/me/nivelamento', { cookie: cookieDeA });
  assert.deepEqual(get.corpo, esperado);
  assert.deepEqual(await dispensasNoBanco(idDeA), ['mod-b']);
});

test("com 'mod-b' dispensado, a aula de 'mod-c' é concluída sem a aula 3 nem a aprovação", async () => {
  await responderNivelamento(cookieDeA, QUATRO_EM_MOD_B);
  await concluirNoBanco(idDeA, 'aula-teste-1', 'aula-teste-2');
  assert.equal((await dispensar(cookieDeA, 'mod-b')).status, 200);

  const put = await novoCliente(baseUrl).enviar('PUT', '/api/me/progress/aula-teste-4', { cookie: cookieDeA });

  assert.equal(put.status, 200);
  assert.equal(put.corpo.lessonId, 'aula-teste-4');
});

test("módulo não dispensável ('mod-c', com 0 acertos) devolve 403 dispensa_indisponivel", async () => {
  await responderNivelamento(cookieDeA, QUATRO_EM_MOD_B);
  await concluirNoBanco(idDeA, 'aula-teste-1', 'aula-teste-2');
  assert.equal((await dispensar(cookieDeA, 'mod-b')).status, 200);

  const resposta = await dispensar(cookieDeA, 'mod-c');

  assert.equal(resposta.status, 403);
  assert.deepEqual(resposta.corpo, DISPENSA_INDISPONIVEL);
  assert.deepEqual(await dispensasNoBanco(idDeA), ['mod-b']);
});

test('módulo já completo devolve 403 dispensa_indisponivel', async () => {
  await responderNivelamento(cookieDeA, QUATRO_EM_MOD_B);
  await concluirNoBanco(idDeA, 'aula-teste-1', 'aula-teste-2', 'aula-teste-3');
  await aprovarNoBanco(idDeA, 'mod-b');

  const resposta = await dispensar(cookieDeA, 'mod-b');

  assert.equal(resposta.status, 403);
  assert.deepEqual(resposta.corpo, DISPENSA_INDISPONIVEL);
  assert.deepEqual(await dispensasNoBanco(idDeA), []);
});

test('módulo inexistente devolve 404 modulo_inexistente', async () => {
  const resposta = await dispensar(cookieDeA, 'mod-inexistente');

  assert.equal(resposta.status, 404);
  assert.deepEqual(resposta.corpo, {
    error: { code: 'modulo_inexistente', message: 'Módulo não encontrado.' },
  });
});

test('sem matrícula, sem o cabeçalho X-FluxoDocente ou sem login, a dispensa é recusada', async () => {
  await responderNivelamento(cookieDeB, QUATRO_EM_MOD_B);
  await concluirNoBanco(idDeB, 'aula-teste-1', 'aula-teste-2');

  const semMatricula = await dispensar(cookieDeB, 'mod-b');
  assert.equal(semMatricula.status, 403);
  assert.deepEqual(semMatricula.corpo, MATRICULA_NECESSARIA);

  await responderNivelamento(cookieDeA, QUATRO_EM_MOD_B);
  await concluirNoBanco(idDeA, 'aula-teste-1', 'aula-teste-2');

  const semCabecalho = await novoCliente(baseUrl).enviar('POST', '/api/me/dispensas/mod-b', {
    cookie: cookieDeA,
    semCabecalho: true,
  });
  assert.equal(semCabecalho.status, 403);

  const semLogin = await novoCliente(baseUrl).enviar('POST', '/api/me/dispensas/mod-b');
  assert.equal(semLogin.status, 401);

  assert.deepEqual(await dispensasNoBanco(idDeA), []);
  assert.deepEqual(await dispensasNoBanco(idDeB), []);
});

test('B não vê nem altera as dispensas de A', async () => {
  await matricular(pool, idDeB);
  await responderNivelamento(cookieDeA, QUATRO_EM_MOD_B);
  await responderNivelamento(cookieDeB, TRES_EM_MOD_B);
  await concluirNoBanco(idDeA, 'aula-teste-1', 'aula-teste-2');
  await concluirNoBanco(idDeB, 'aula-teste-1', 'aula-teste-2');
  assert.equal((await dispensar(cookieDeA, 'mod-b')).status, 200);

  const cliente = novoCliente(baseUrl);
  const deB = await cliente.enviar('GET', '/api/me/nivelamento', { cookie: cookieDeB });
  assert.deepEqual(deB.corpo, { disponivel: true, respondido: true, dispensaveis: [], dispensados: [] });

  const dispensaDeB = await dispensar(cookieDeB, 'mod-b');
  assert.equal(dispensaDeB.status, 403);
  assert.deepEqual(dispensaDeB.corpo, DISPENSA_INDISPONIVEL);

  const aulaDeB = await cliente.enviar('PUT', '/api/me/progress/aula-teste-4', { cookie: cookieDeB });
  assert.equal(aulaDeB.status, 403);
  assert.deepEqual(aulaDeB.corpo, MODULO_BLOQUEADO);

  assert.deepEqual(await dispensasNoBanco(idDeA), ['mod-b']);
  assert.deepEqual(await dispensasNoBanco(idDeB), []);
});
