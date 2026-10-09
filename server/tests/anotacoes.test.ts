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

async function linhasDe(userId: string): Promise<{ lesson_id: string; content: string }[]> {
  const { rows } = await pool.query<{ lesson_id: string; content: string }>(
    'SELECT lesson_id, content FROM lesson_notes WHERE user_id = $1 ORDER BY lesson_id',
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
  await pool.query('DELETE FROM lesson_notes');
});

after(async () => {
  servidor?.closeAllConnections();
  servidor?.close();
  await pool?.end();
});

test('sem cookie, GET e PUT de anotação devolvem 401', async () => {
  const cliente = novoCliente(baseUrl);
  const get = await cliente.enviar('GET', '/api/me/notes/aula-teste-1');
  const put = await cliente.enviar('PUT', '/api/me/notes/aula-teste-1', { corpo: { content: 'nota' } });

  assert.equal(get.status, 401);
  assert.equal(get.corpo.error.code, 'nao_autenticado');
  assert.equal(put.status, 401);
  assert.equal(put.corpo.error.code, 'nao_autenticado');
  assert.deepEqual(await linhasDe(idDeA), []);
  assert.deepEqual(await linhasDe(idDeB), []);
});

test('GET de aula sem anotação devolve conteúdo vazio e updatedAt null', async () => {
  const cliente = novoCliente(baseUrl);
  const resposta = await cliente.enviar('GET', '/api/me/notes/aula-teste-1', { cookie: cookieDeA });

  assert.equal(resposta.status, 200);
  assert.deepEqual(resposta.corpo, { lessonId: 'aula-teste-1', content: '', updatedAt: null });
});

test('PUT grava a anotação e o GET seguinte devolve a mesma', async () => {
  const cliente = novoCliente(baseUrl);
  const put = await cliente.enviar('PUT', '/api/me/notes/aula-teste-1', {
    cookie: cookieDeA,
    corpo: { content: 'minha nota' },
  });

  assert.equal(put.status, 200);
  assert.equal(put.corpo.lessonId, 'aula-teste-1');
  assert.equal(put.corpo.content, 'minha nota');
  assert.equal(typeof put.corpo.updatedAt, 'string');
  assert.equal(new Date(put.corpo.updatedAt).toISOString(), put.corpo.updatedAt);
  assert.deepEqual(Object.keys(put.corpo).sort(), ['content', 'lessonId', 'updatedAt']);

  const get = await cliente.enviar('GET', '/api/me/notes/aula-teste-1', { cookie: cookieDeA });

  assert.equal(get.status, 200);
  assert.deepEqual(get.corpo, put.corpo);
  assert.deepEqual(await linhasDe(idDeA), [{ lesson_id: 'aula-teste-1', content: 'minha nota' }]);
});

test('PUT de novo substitui o texto e avança o updatedAt', async () => {
  const cliente = novoCliente(baseUrl);
  const primeiro = await cliente.enviar('PUT', '/api/me/notes/aula-teste-1', {
    cookie: cookieDeA,
    corpo: { content: 'primeira versão' },
  });
  await esperar(10);
  const segundo = await cliente.enviar('PUT', '/api/me/notes/aula-teste-1', {
    cookie: cookieDeA,
    corpo: { content: 'segunda versão' },
  });

  assert.equal(segundo.status, 200);
  assert.equal(segundo.corpo.content, 'segunda versão');
  assert.ok(new Date(segundo.corpo.updatedAt) > new Date(primeiro.corpo.updatedAt));
  assert.deepEqual(await linhasDe(idDeA), [{ lesson_id: 'aula-teste-1', content: 'segunda versão' }]);
});

test('anotação é do dono da sessão: B não vê a de A e userId no corpo e na query é ignorado', async () => {
  const cliente = novoCliente(baseUrl);
  const putDeA = await cliente.enviar('PUT', '/api/me/notes/aula-teste-1', {
    cookie: cookieDeA,
    corpo: { content: 'nota de A' },
  });

  const getDeB = await cliente.enviar('GET', '/api/me/notes/aula-teste-1', { cookie: cookieDeB });
  assert.equal(getDeB.status, 200);
  assert.deepEqual(getDeB.corpo, { lessonId: 'aula-teste-1', content: '', updatedAt: null });

  const putDeB = await cliente.enviar('PUT', `/api/me/notes/aula-teste-1?userId=${idDeA}`, {
    cookie: cookieDeB,
    corpo: { content: 'nota de B', userId: idDeA },
  });

  assert.equal(putDeB.status, 200);
  assert.equal(putDeB.corpo.content, 'nota de B');
  assert.deepEqual(await linhasDe(idDeB), [{ lesson_id: 'aula-teste-1', content: 'nota de B' }]);
  assert.deepEqual(await linhasDe(idDeA), [{ lesson_id: 'aula-teste-1', content: 'nota de A' }]);

  const getDeA = await cliente.enviar('GET', '/api/me/notes/aula-teste-1', { cookie: cookieDeA });
  assert.deepEqual(getDeA.corpo, putDeA.corpo);
});

test('PUT com conteúdo vazio ou só espaços apaga a anotação', async () => {
  const cliente = novoCliente(baseUrl);

  for (const vazio of ['', '   ', '\n\t ']) {
    await cliente.enviar('PUT', '/api/me/notes/aula-teste-1', {
      cookie: cookieDeA,
      corpo: { content: 'nota a apagar' },
    });
    assert.equal((await linhasDe(idDeA)).length, 1);

    const resposta = await cliente.enviar('PUT', '/api/me/notes/aula-teste-1', {
      cookie: cookieDeA,
      corpo: { content: vazio },
    });

    assert.equal(resposta.status, 200);
    assert.deepEqual(resposta.corpo, { lessonId: 'aula-teste-1', content: '', updatedAt: null });
    assert.deepEqual(await linhasDe(idDeA), []);
  }
});

test('PUT grava o texto como veio, sem tirar espaços das pontas', async () => {
  const cliente = novoCliente(baseUrl);
  const texto = '  com espaços nas pontas\n';
  const resposta = await cliente.enviar('PUT', '/api/me/notes/aula-teste-1', {
    cookie: cookieDeA,
    corpo: { content: texto },
  });

  assert.equal(resposta.status, 200);
  assert.equal(resposta.corpo.content, texto);
  assert.deepEqual(await linhasDe(idDeA), [{ lesson_id: 'aula-teste-1', content: texto }]);
});

test('PUT com content que não é texto devolve 400 dados_invalidos', async () => {
  const cliente = novoCliente(baseUrl);

  for (const corpo of [{ content: 123 }, { content: null }, { content: ['a'] }, {}]) {
    const resposta = await cliente.enviar('PUT', '/api/me/notes/aula-teste-1', { cookie: cookieDeA, corpo });

    assert.equal(resposta.status, 400);
    assert.equal(resposta.corpo.error.code, 'dados_invalidos');
  }

  const semCorpo = await cliente.enviar('PUT', '/api/me/notes/aula-teste-1', { cookie: cookieDeA });
  assert.equal(semCorpo.status, 400);
  assert.equal(semCorpo.corpo.error.code, 'dados_invalidos');
  assert.deepEqual(await linhasDe(idDeA), []);
});

test('PUT aceita até 5.000 caracteres, contando emoji como um caractere', async () => {
  const cliente = novoCliente(baseUrl);
  const noLimite = '😀'.repeat(5000);
  const aceito = await cliente.enviar('PUT', '/api/me/notes/aula-teste-1', {
    cookie: cookieDeA,
    corpo: { content: noLimite },
  });

  assert.equal(aceito.status, 200);
  assert.equal(aceito.corpo.content, noLimite);

  const grande = await cliente.enviar('PUT', '/api/me/notes/aula-teste-2', {
    cookie: cookieDeA,
    corpo: { content: 'á'.repeat(5001) },
  });

  assert.equal(grande.status, 400);
  assert.equal(grande.corpo.error.code, 'anotacao_grande');
  assert.equal(grande.corpo.error.message, 'A anotação pode ter até 5.000 caracteres.');
  assert.deepEqual(await linhasDe(idDeA), [{ lesson_id: 'aula-teste-1', content: noLimite }]);
});

test('GET e PUT de aula fora do catálogo devolvem 404 aula_inexistente', async () => {
  const cliente = novoCliente(baseUrl);
  const get = await cliente.enviar('GET', '/api/me/notes/aula-que-nao-existe', { cookie: cookieDeA });
  const put = await cliente.enviar('PUT', '/api/me/notes/aula-que-nao-existe', {
    cookie: cookieDeA,
    corpo: { content: 'nota' },
  });

  assert.equal(get.status, 404);
  assert.equal(get.corpo.error.code, 'aula_inexistente');
  assert.equal(put.status, 404);
  assert.equal(put.corpo.error.code, 'aula_inexistente');
  assert.deepEqual(await linhasDe(idDeA), []);
});

test('PUT sem o cabeçalho X-FluxoDocente é recusado', async () => {
  const cliente = novoCliente(baseUrl);
  const resposta = await cliente.enviar('PUT', '/api/me/notes/aula-teste-1', {
    cookie: cookieDeA,
    corpo: { content: 'nota' },
    semCabecalho: true,
  });

  assert.equal(resposta.status, 403);
  assert.equal(resposta.corpo.error.code, 'origem_invalida');
  assert.deepEqual(await linhasDe(idDeA), []);
});
