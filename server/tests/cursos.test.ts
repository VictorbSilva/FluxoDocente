import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { setTimeout as esperar } from 'node:timers/promises';
import type pg from 'pg';
import { createApp } from '../app.js';
import { hashSenha } from '../auth/senha.js';
import { prepararBanco } from './ajuda.js';
import { entrar, novoCliente } from './http.js';

const SENHA = 'senha-correta-123';
const lessonIds: ReadonlySet<string> = new Set(['aula-teste-1']);

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

async function matriculasDe(userId: string): Promise<string[]> {
  const { rows } = await pool.query<{ course_id: string }>(
    'SELECT course_id FROM enrollments WHERE user_id = $1 ORDER BY course_id',
    [userId],
  );
  return rows.map((linha) => linha.course_id);
}

async function nomeDe(userId: string): Promise<string | null> {
  const { rows } = await pool.query<{ nome: string | null }>('SELECT nome FROM users WHERE id = $1', [userId]);
  return rows[0].nome;
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
  await pool.query('DELETE FROM enrollments');
  await pool.query('UPDATE users SET nome = NULL');
});

after(async () => {
  servidor?.closeAllConnections();
  servidor?.close();
  await pool?.end();
});

test('sem cookie, matrículas e perfil devolvem 401', async () => {
  const cliente = novoCliente(baseUrl);
  const get = await cliente.enviar('GET', '/api/me/matriculas');
  const post = await cliente.enviar('POST', '/api/me/matriculas/ia-docencia');
  const put = await cliente.enviar('PUT', '/api/me/perfil', { corpo: { nome: 'Ana Souza' } });

  for (const resposta of [get, post, put]) {
    assert.equal(resposta.status, 401);
    assert.equal(resposta.corpo.error.code, 'nao_autenticado');
  }

  assert.deepEqual(await matriculasDe(idDeA), []);
  assert.equal(await nomeDe(idDeA), null);
});

test('matrícula: lista vazia, matricula, repete sem mudar a data e lista a matrícula', async () => {
  const cliente = novoCliente(baseUrl);
  const vazia = await cliente.enviar('GET', '/api/me/matriculas', { cookie: cookieDeA });

  assert.equal(vazia.status, 200);
  assert.deepEqual(vazia.corpo, { matriculas: [] });

  const primeira = await cliente.enviar('POST', '/api/me/matriculas/ia-docencia', { cookie: cookieDeA });

  assert.equal(primeira.status, 200);
  assert.deepEqual(Object.keys(primeira.corpo).sort(), ['courseId', 'enrolledAt']);
  assert.equal(primeira.corpo.courseId, 'ia-docencia');
  assert.equal(new Date(primeira.corpo.enrolledAt).toISOString(), primeira.corpo.enrolledAt);

  await esperar(10);
  const repetida = await cliente.enviar('POST', '/api/me/matriculas/ia-docencia', { cookie: cookieDeA });

  assert.equal(repetida.status, 200);
  assert.deepEqual(repetida.corpo, primeira.corpo);

  const lista = await cliente.enviar('GET', '/api/me/matriculas', { cookie: cookieDeA });

  assert.equal(lista.status, 200);
  assert.deepEqual(lista.corpo, { matriculas: [primeira.corpo] });
  assert.deepEqual(await matriculasDe(idDeA), ['ia-docencia']);
});

test('matrícula é do dono da sessão: B não vê a de A', async () => {
  const cliente = novoCliente(baseUrl);
  await cliente.enviar('POST', '/api/me/matriculas/ia-docencia', { cookie: cookieDeA });

  const deB = await cliente.enviar('GET', '/api/me/matriculas', { cookie: cookieDeB });

  assert.equal(deB.status, 200);
  assert.deepEqual(deB.corpo, { matriculas: [] });
  assert.deepEqual(await matriculasDe(idDeB), []);
});

test('matrícula em curso inexistente devolve 404 curso_inexistente', async () => {
  const cliente = novoCliente(baseUrl);
  const resposta = await cliente.enviar('POST', '/api/me/matriculas/curso-que-nao-existe', { cookie: cookieDeA });

  assert.equal(resposta.status, 404);
  assert.deepEqual(resposta.corpo, {
    error: { code: 'curso_inexistente', message: 'Curso não encontrado.' },
  });
  assert.deepEqual(await matriculasDe(idDeA), []);
});

test('POST de matrícula sem o cabeçalho X-FluxoDocente é recusado', async () => {
  const cliente = novoCliente(baseUrl);
  const resposta = await cliente.enviar('POST', '/api/me/matriculas/ia-docencia', {
    cookie: cookieDeA,
    semCabecalho: true,
  });

  assert.equal(resposta.status, 403);
  assert.equal(resposta.corpo.error.code, 'origem_invalida');
  assert.deepEqual(await matriculasDe(idDeA), []);
});

test('PUT /api/me/perfil grava o nome sem espaços nas pontas e o /me passa a devolvê-lo', async () => {
  const cliente = novoCliente(baseUrl);
  const resposta = await cliente.enviar('PUT', '/api/me/perfil', {
    cookie: cookieDeA,
    corpo: { nome: '  Ana Souza  ' },
  });

  assert.equal(resposta.status, 200);
  assert.deepEqual(resposta.corpo, { user: { id: idDeA, email: 'a@exemplo.com', nome: 'Ana Souza' } });
  assert.equal(await nomeDe(idDeA), 'Ana Souza');
  assert.equal(await nomeDe(idDeB), null);

  const me = await cliente.enviar('GET', '/api/auth/me', { cookie: cookieDeA });

  assert.equal(me.status, 200);
  assert.deepEqual(me.corpo, { user: { id: idDeA, email: 'a@exemplo.com', nome: 'Ana Souza' } });
});

test('PUT /api/me/perfil aceita nome de 120 caracteres', async () => {
  const cliente = novoCliente(baseUrl);
  const nome = 'a'.repeat(120);
  const resposta = await cliente.enviar('PUT', '/api/me/perfil', { cookie: cookieDeA, corpo: { nome } });

  assert.equal(resposta.status, 200);
  assert.equal(resposta.corpo.user.nome, nome);
});

test('PUT /api/me/perfil com nome inválido devolve 400 nome_invalido', async () => {
  const cliente = novoCliente(baseUrl);
  const corpos = [
    { nome: '' },
    { nome: '   ' },
    { nome: 'a'.repeat(121) },
    { nome: 123 },
    { nome: null },
    { nome: ['Ana'] },
    {},
  ];

  for (const corpo of corpos) {
    const resposta = await cliente.enviar('PUT', '/api/me/perfil', { cookie: cookieDeA, corpo });

    assert.equal(resposta.status, 400);
    assert.deepEqual(resposta.corpo, {
      error: { code: 'nome_invalido', message: 'Informe um nome de 1 a 120 caracteres.' },
    });
  }

  const semCorpo = await cliente.enviar('PUT', '/api/me/perfil', { cookie: cookieDeA });

  assert.equal(semCorpo.status, 400);
  assert.equal(semCorpo.corpo.error.code, 'nome_invalido');
  assert.equal(await nomeDe(idDeA), null);
});

test('login devolve nome null antes de o nome ser definido', async () => {
  const cliente = novoCliente(baseUrl);
  const resposta = await cliente.enviar('POST', '/api/auth/login', {
    corpo: { email: 'b@exemplo.com', password: SENHA },
  });

  assert.equal(resposta.status, 200);
  assert.deepEqual(resposta.corpo, { user: { id: idDeB, email: 'b@exemplo.com', nome: null } });
});
