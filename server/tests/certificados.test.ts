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
const CODIGO = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}$/;

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

async function nomear(userId: string, nome: string | null): Promise<void> {
  await pool.query('UPDATE users SET nome = $1 WHERE id = $2', [nome, userId]);
}

// 'curso-outro' tem só 'mod-x', sem exercício, completo com 'aula-outro-1'.
async function concluirCursoOutro(userId: string): Promise<void> {
  await matricular(pool, userId, 'curso-outro');
  await pool.query('INSERT INTO lesson_completions (user_id, lesson_id) VALUES ($1, $2)', [userId, 'aula-outro-1']);
}

function emitir(cookie: string, courseId = 'curso-outro') {
  return novoCliente(baseUrl).enviar('POST', `/api/me/certificados/${courseId}`, { cookie });
}

async function certificadosNoBanco(): Promise<number> {
  const { rows } = await pool.query<{ total: number }>('SELECT count(*)::int AS total FROM certificates');
  return rows[0].total;
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
  await pool.query('DELETE FROM certificates');
  await pool.query('DELETE FROM lesson_completions');
  await pool.query('DELETE FROM enrollments');
  await nomear(idDeA, 'Ana Docente');
  await nomear(idDeB, 'Bruno Docente');
});

after(async () => {
  servidor?.closeAllConnections();
  servidor?.close();
  await pool?.end();
});

test('sem login, a emissão devolve 401', async () => {
  const resposta = await novoCliente(baseUrl).enviar('POST', '/api/me/certificados/curso-outro');

  assert.equal(resposta.status, 401);
});

test('sem o cabeçalho X-FluxoDocente, a emissão devolve 403 origem_invalida', async () => {
  await concluirCursoOutro(idDeA);

  const resposta = await novoCliente(baseUrl).enviar('POST', '/api/me/certificados/curso-outro', {
    cookie: cookieDeA,
    semCabecalho: true,
  });

  assert.equal(resposta.status, 403);
  assert.equal(resposta.corpo.error.code, 'origem_invalida');
  assert.equal(await certificadosNoBanco(), 0);
});

test('curso inexistente devolve 404 curso_inexistente', async () => {
  const resposta = await emitir(cookieDeA, 'curso-inexistente');

  assert.equal(resposta.status, 404);
  assert.deepEqual(resposta.corpo, {
    error: { code: 'curso_inexistente', message: 'Curso não encontrado.' },
  });
});

test('sem matrícula, a emissão devolve 403 matricula_necessaria', async () => {
  await pool.query('INSERT INTO lesson_completions (user_id, lesson_id) VALUES ($1, $2)', [idDeA, 'aula-outro-1']);

  const resposta = await emitir(cookieDeA);

  assert.equal(resposta.status, 403);
  assert.deepEqual(resposta.corpo, {
    error: { code: 'matricula_necessaria', message: 'Faça a matrícula no curso para continuar.' },
  });
  assert.equal(await certificadosNoBanco(), 0);
});

test('sem a aula concluída, a emissão devolve 403 curso_incompleto', async () => {
  await matricular(pool, idDeA, 'curso-outro');

  const resposta = await emitir(cookieDeA);

  assert.equal(resposta.status, 403);
  assert.deepEqual(resposta.corpo, {
    error: { code: 'curso_incompleto', message: 'Conclua o curso para emitir o certificado.' },
  });
  assert.equal(await certificadosNoBanco(), 0);
});

test('com o curso concluído e a conta sem nome, a emissão devolve 409 nome_obrigatorio', async () => {
  await concluirCursoOutro(idDeA);
  await nomear(idDeA, null);

  const resposta = await emitir(cookieDeA);

  assert.equal(resposta.status, 409);
  assert.deepEqual(resposta.corpo, {
    error: { code: 'nome_obrigatorio', message: 'Cadastre seu nome no Painel para emitir o certificado.' },
  });
  assert.equal(await certificadosNoBanco(), 0);
});

test('com o curso concluído, a primeira emissão devolve 201 e a segunda, 200 com o mesmo código e a mesma data', async () => {
  await concluirCursoOutro(idDeA);

  const primeira = await emitir(cookieDeA);

  assert.equal(primeira.status, 201);
  assert.deepEqual(Object.keys(primeira.corpo).sort(), ['cargaHorariaHoras', 'codigo', 'courseId', 'emitidoEm', 'nome']);
  assert.equal(primeira.corpo.courseId, 'curso-outro');
  assert.equal(primeira.corpo.nome, 'Ana Docente');
  assert.equal(primeira.corpo.cargaHorariaHoras, 1);
  assert.match(primeira.corpo.codigo, CODIGO);
  assert.equal(new Date(primeira.corpo.emitidoEm).toISOString(), primeira.corpo.emitidoEm);

  const segunda = await emitir(cookieDeA);

  assert.equal(segunda.status, 200);
  assert.deepEqual(segunda.corpo, primeira.corpo);
  assert.equal(await certificadosNoBanco(), 1);
});

test('A e B recebem códigos diferentes, cada um com o próprio nome', async () => {
  await concluirCursoOutro(idDeA);
  await concluirCursoOutro(idDeB);

  const deA = await emitir(cookieDeA);
  const deB = await emitir(cookieDeB);

  assert.equal(deA.status, 201);
  assert.equal(deB.status, 201);
  assert.equal(deA.corpo.nome, 'Ana Docente');
  assert.equal(deB.corpo.nome, 'Bruno Docente');
  assert.notEqual(deA.corpo.codigo, deB.corpo.codigo);
  assert.equal(await certificadosNoBanco(), 2);
});
