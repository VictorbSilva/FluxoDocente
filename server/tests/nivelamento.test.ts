import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type pg from 'pg';
import type { Catalogo } from '../../shared/contracts.js';
import { createApp } from '../app.js';
import { hashSenha } from '../auth/senha.js';
import type { Gabaritos } from '../exercicios/gabarito.js';
import { prepararBanco } from './ajuda.js';
import { catalogoDeTeste, gabaritoDeTeste } from './catalogo-de-teste.js';
import { entrar, novoCliente } from './http.js';

const SENHA = 'senha-correta-123';
const SESSION_SECRET = 'x'.repeat(40);
const RESPOSTAS_INVALIDAS = {
  error: { code: 'respostas_invalidas', message: 'Responda todas as perguntas.' },
};

let pool: pg.Pool;
const servidores: Server[] = [];
let baseUrl: string;
let idDeA: string;
let cookieDeA: string;
let cookieDeB: string;

async function criarUsuario(email: string): Promise<string> {
  const { rows } = await pool.query<{ id: string }>(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
    [email, await hashSenha(SENHA)],
  );
  return rows[0].id;
}

// As sessões ficam no banco: o cookie de um app vale nos outros com o mesmo segredo.
async function iniciarApp(catalogo: Catalogo, gabaritos: Gabaritos): Promise<string> {
  const servidor = createApp({ production: false, pool, sessionSecret: SESSION_SECRET, catalogo, gabaritos }).listen(0);
  servidores.push(servidor);
  await once(servidor, 'listening');
  return `http://localhost:${(servidor.address() as AddressInfo).port}`;
}

async function respostaNoBanco(userId: string) {
  const { rows } = await pool.query<{ respostas: number[]; acertos: number | null; total: number }>(
    'SELECT respostas, acertos, total FROM placement_answers WHERE user_id = $1',
    [userId],
  );
  return rows[0];
}

before(async () => {
  pool = await prepararBanco();
  idDeA = await criarUsuario('a@exemplo.com');
  await criarUsuario('b@exemplo.com');

  baseUrl = await iniciarApp(catalogoDeTeste, gabaritoDeTeste);
  cookieDeA = await entrar(baseUrl, 'a@exemplo.com', SENHA);
  cookieDeB = await entrar(baseUrl, 'b@exemplo.com', SENHA);
});

beforeEach(async () => {
  await pool.query('DELETE FROM placement_answers');
});

after(async () => {
  for (const servidor of servidores) {
    servidor.closeAllConnections();
    servidor.close();
  }
  await pool?.end();
});

test('sem cookie, GET e POST do nivelamento devolvem 401', async () => {
  const cliente = novoCliente(baseUrl);

  const get = await cliente.enviar('GET', '/api/me/nivelamento');
  assert.equal(get.status, 401);

  const post = await cliente.enviar('POST', '/api/me/nivelamento', { corpo: { respostas: [0, 1, 2] } });
  assert.equal(post.status, 401);
});

test('o nivelamento é respondido uma vez, sem exigir matrícula; a segunda vez devolve 409', async () => {
  const cliente = novoCliente(baseUrl);

  const antes = await cliente.enviar('GET', '/api/me/nivelamento', { cookie: cookieDeA });
  assert.equal(antes.status, 200);
  assert.deepEqual(antes.corpo, { disponivel: true, respondido: false });

  const post = await cliente.enviar('POST', '/api/me/nivelamento', {
    cookie: cookieDeA,
    corpo: { respostas: [0, 1, 2] },
  });
  assert.equal(post.status, 201);
  assert.deepEqual(post.corpo, { disponivel: true, respondido: true });

  const depois = await cliente.enviar('GET', '/api/me/nivelamento', { cookie: cookieDeA });
  assert.deepEqual(depois.corpo, { disponivel: true, respondido: true });

  const repetido = await cliente.enviar('POST', '/api/me/nivelamento', {
    cookie: cookieDeA,
    corpo: { respostas: [2, 2, 2] },
  });
  assert.equal(repetido.status, 409);
  assert.deepEqual(repetido.corpo, {
    error: { code: 'nivelamento_respondido', message: 'Você já respondeu ao nivelamento.' },
  });
  assert.deepEqual((await respostaNoBanco(idDeA)).respostas, [0, 1, 2]);
});

test('respostas inválidas devolvem 400 respostas_invalidas e nada é gravado', async () => {
  const cliente = novoCliente(baseUrl);
  const corpos: unknown[] = [
    {},
    { respostas: null },
    { respostas: [0, 1] },
    { respostas: [0, 1, 2, 0] },
    { respostas: [0, 1, 3] },
    { respostas: [-1, 1, 2] },
    { respostas: [0, 1.5, 2] },
    { respostas: ['0', 1, 2] },
  ];

  for (const corpo of corpos) {
    const resposta = await cliente.enviar('POST', '/api/me/nivelamento', { cookie: cookieDeA, corpo });
    assert.equal(resposta.status, 400, JSON.stringify(corpo));
    assert.deepEqual(resposta.corpo, RESPOSTAS_INVALIDAS);
  }

  assert.equal(await respostaNoBanco(idDeA), undefined);
});

test('os acertos ficam no banco e nunca são devolvidos pela API', async () => {
  const cliente = novoCliente(baseUrl);

  const post = await cliente.enviar('POST', '/api/me/nivelamento', {
    cookie: cookieDeA,
    corpo: { respostas: [0, 1, 0] },
  });
  const get = await cliente.enviar('GET', '/api/me/nivelamento', { cookie: cookieDeA });

  assert.deepEqual(await respostaNoBanco(idDeA), { respostas: [0, 1, 0], acertos: 2, total: 3 });

  for (const resposta of [post, get]) {
    assert.doesNotMatch(JSON.stringify(resposta.corpo), /acertos|respostas|gabarito/i);
  }
});

test('com gabarito do nivelamento null, acertos fica nulo', async () => {
  const semGabarito = await iniciarApp(catalogoDeTeste, { ...gabaritoDeTeste, nivelamento: null });
  const cliente = novoCliente(semGabarito);

  const post = await cliente.enviar('POST', '/api/me/nivelamento', {
    cookie: cookieDeA,
    corpo: { respostas: [0, 1, 2] },
  });

  assert.equal(post.status, 201);
  assert.deepEqual(post.corpo, { disponivel: true, respondido: true });
  assert.deepEqual(await respostaNoBanco(idDeA), { respostas: [0, 1, 2], acertos: null, total: 3 });
});

test('B continua sem ter respondido depois que A responde', async () => {
  const cliente = novoCliente(baseUrl);

  await cliente.enviar('POST', '/api/me/nivelamento', { cookie: cookieDeA, corpo: { respostas: [0, 1, 2] } });
  const deB = await cliente.enviar('GET', '/api/me/nivelamento', { cookie: cookieDeB });

  assert.deepEqual(deB.corpo, { disponivel: true, respondido: false });
});

test('sem perguntas no catálogo, o nivelamento fica indisponível', async () => {
  const semPerguntas = await iniciarApp({ ...catalogoDeTeste, nivelamento: [] }, gabaritoDeTeste);
  const cliente = novoCliente(semPerguntas);

  const get = await cliente.enviar('GET', '/api/me/nivelamento', { cookie: cookieDeA });
  assert.equal(get.status, 200);
  assert.deepEqual(get.corpo, { disponivel: false, respondido: false });

  const post = await cliente.enviar('POST', '/api/me/nivelamento', {
    cookie: cookieDeA,
    corpo: { respostas: [] },
  });
  assert.equal(post.status, 404);
  assert.deepEqual(post.corpo, {
    error: { code: 'nivelamento_indisponivel', message: 'Nivelamento indisponível.' },
  });
  assert.equal(await respostaNoBanco(idDeA), undefined);
});
