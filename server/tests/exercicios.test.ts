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
const EXERCICIO_INEXISTENTE = {
  error: { code: 'exercicio_inexistente', message: 'Avaliação não encontrada.' },
};
const RESPOSTAS_INVALIDAS = {
  error: { code: 'respostas_invalidas', message: 'Responda todas as perguntas.' },
};
const CHAVES_DA_CORRECAO = ['acertos', 'aprovadoNestaTentativa', 'corretas', 'moduleId', 'resultado', 'total'];
const CHAVES_DO_RESULTADO = ['aprovado', 'aprovadoEm', 'melhorAcertos', 'moduleId', 'total'];

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

// Libera 'mod-b': as aulas de 'mod-a' concluídas. A aula de 'mod-b' fica pendente.
async function liberarModB(userId: string): Promise<void> {
  await concluirNoBanco(userId, 'aula-teste-1', 'aula-teste-2');
}

// O gabarito de 'mod-b' é a alternativa 0 em todas as perguntas.
function respostasCom(acertos: number): number[] {
  return Array.from({ length: 10 }, (_, indice) => (indice < acertos ? 0 : 1));
}

async function resultadosNoBanco(): Promise<{ user_id: string; module_id: string }[]> {
  const { rows } = await pool.query<{ user_id: string; module_id: string }>(
    'SELECT user_id, module_id FROM exercise_results ORDER BY user_id, module_id',
  );
  return rows;
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
  await pool.query('DELETE FROM lesson_completions');
  await pool.query('DELETE FROM enrollments');
  await pool.query('DELETE FROM exercise_results');
  await matricular(pool, idDeA);
  await matricular(pool, idDeB);
});

after(async () => {
  servidor?.closeAllConnections();
  servidor?.close();
  await pool?.end();
});

test('sem cookie, listar e enviar exercício devolvem 401; sem o cabeçalho X-FluxoDocente, 403', async () => {
  const cliente = novoCliente(baseUrl);

  const get = await cliente.enviar('GET', '/api/me/exercicios');
  assert.equal(get.status, 401);

  const post = await cliente.enviar('POST', '/api/me/exercicios/mod-b', { corpo: { respostas: respostasCom(10) } });
  assert.equal(post.status, 401);

  await liberarModB(idDeA);
  const semCabecalho = await cliente.enviar('POST', '/api/me/exercicios/mod-b', {
    cookie: cookieDeA,
    corpo: { respostas: respostasCom(10) },
    semCabecalho: true,
  });
  assert.equal(semCabecalho.status, 403);
  assert.deepEqual(await resultadosNoBanco(), []);
});

test('módulo sem exercício ou inexistente devolve 404 exercicio_inexistente', async () => {
  await liberarModB(idDeA);
  const cliente = novoCliente(baseUrl);

  for (const moduleId of ['mod-a', 'mod-inexistente']) {
    const resposta = await cliente.enviar('POST', `/api/me/exercicios/${moduleId}`, {
      cookie: cookieDeA,
      corpo: { respostas: respostasCom(10) },
    });
    assert.equal(resposta.status, 404, moduleId);
    assert.deepEqual(resposta.corpo, EXERCICIO_INEXISTENTE);
  }

  assert.deepEqual(await resultadosNoBanco(), []);
});

test("sem matrícula devolve 403 matricula_necessaria; 'mod-b' antes de concluir 'mod-a', 403 modulo_bloqueado", async () => {
  await pool.query('DELETE FROM enrollments WHERE user_id = $1', [idDeA]);
  const cliente = novoCliente(baseUrl);

  const semMatricula = await cliente.enviar('POST', '/api/me/exercicios/mod-b', {
    cookie: cookieDeA,
    corpo: { respostas: respostasCom(10) },
  });
  assert.equal(semMatricula.status, 403);
  assert.equal(semMatricula.corpo.error.code, 'matricula_necessaria');

  await matricular(pool, idDeA);
  await concluirNoBanco(idDeA, 'aula-teste-1');
  const bloqueado = await cliente.enviar('POST', '/api/me/exercicios/mod-b', {
    cookie: cookieDeA,
    corpo: { respostas: respostasCom(10) },
  });
  assert.equal(bloqueado.status, 403);
  assert.equal(bloqueado.corpo.error.code, 'modulo_bloqueado');

  assert.deepEqual(await resultadosNoBanco(), []);
});

test('respostas ausentes, com tamanho errado, fora de 0 a 2 ou não inteiras devolvem 400 respostas_invalidas', async () => {
  await liberarModB(idDeA);
  const cliente = novoCliente(baseUrl);
  const corpos: unknown[] = [
    {},
    { respostas: null },
    { respostas: '0000000000' },
    { respostas: respostasCom(10).slice(0, 9) },
    { respostas: [...respostasCom(10), 0] },
    { respostas: [3, ...respostasCom(10).slice(1)] },
    { respostas: [-1, ...respostasCom(10).slice(1)] },
    { respostas: [0.5, ...respostasCom(10).slice(1)] },
    { respostas: ['0', ...respostasCom(10).slice(1)] },
    { respostas: [null, ...respostasCom(10).slice(1)] },
  ];

  for (const corpo of corpos) {
    const resposta = await cliente.enviar('POST', '/api/me/exercicios/mod-b', { cookie: cookieDeA, corpo });
    assert.equal(resposta.status, 400, JSON.stringify(corpo));
    assert.deepEqual(resposta.corpo, RESPOSTAS_INVALIDAS);
  }

  const semCorpo = await cliente.enviar('POST', '/api/me/exercicios/mod-b', { cookie: cookieDeA });
  assert.equal(semCorpo.status, 400);
  assert.deepEqual(semCorpo.corpo, RESPOSTAS_INVALIDAS);

  assert.deepEqual(await resultadosNoBanco(), []);
});

test('com 6 acertos de 10 não aprova, e o GET lista a melhor nota', async () => {
  await liberarModB(idDeA);
  const cliente = novoCliente(baseUrl);

  const post = await cliente.enviar('POST', '/api/me/exercicios/mod-b', {
    cookie: cookieDeA,
    corpo: { respostas: respostasCom(6) },
  });
  assert.equal(post.status, 200);
  assert.equal(post.corpo.moduleId, 'mod-b');
  assert.equal(post.corpo.acertos, 6);
  assert.equal(post.corpo.total, 10);
  assert.deepEqual(post.corpo.corretas, [true, true, true, true, true, true, false, false, false, false]);
  assert.equal(post.corpo.aprovadoNestaTentativa, false);
  assert.deepEqual(post.corpo.resultado, {
    moduleId: 'mod-b',
    melhorAcertos: 6,
    total: 10,
    aprovado: false,
    aprovadoEm: null,
  });

  const get = await cliente.enviar('GET', '/api/me/exercicios', { cookie: cookieDeA });
  assert.equal(get.status, 200);
  assert.deepEqual(get.corpo, { resultados: [post.corpo.resultado] });
});

test('com 7 acertos aprova; uma tentativa pior depois mantém a melhor nota e a data da aprovação', async () => {
  await liberarModB(idDeA);
  const cliente = novoCliente(baseUrl);

  const aprovada = await cliente.enviar('POST', '/api/me/exercicios/mod-b', {
    cookie: cookieDeA,
    corpo: { respostas: respostasCom(7) },
  });
  assert.equal(aprovada.status, 200);
  assert.equal(aprovada.corpo.acertos, 7);
  assert.equal(aprovada.corpo.aprovadoNestaTentativa, true);
  assert.equal(aprovada.corpo.resultado.aprovado, true);
  assert.equal(aprovada.corpo.resultado.melhorAcertos, 7);
  assert.equal(typeof aprovada.corpo.resultado.aprovadoEm, 'string');
  assert.ok(!Number.isNaN(Date.parse(aprovada.corpo.resultado.aprovadoEm)));

  const pior = await cliente.enviar('POST', '/api/me/exercicios/mod-b', {
    cookie: cookieDeA,
    corpo: { respostas: respostasCom(3) },
  });
  assert.equal(pior.status, 200);
  assert.equal(pior.corpo.acertos, 3);
  assert.equal(pior.corpo.aprovadoNestaTentativa, false);
  assert.deepEqual(pior.corpo.resultado, aprovada.corpo.resultado);

  const get = await cliente.enviar('GET', '/api/me/exercicios', { cookie: cookieDeA });
  assert.deepEqual(get.corpo, { resultados: [aprovada.corpo.resultado] });
});

test("depois da aprovação pela API, a aula de 'mod-c' pode ser concluída", async () => {
  await concluirNoBanco(idDeA, 'aula-teste-1', 'aula-teste-2', 'aula-teste-3');
  const cliente = novoCliente(baseUrl);

  const antes = await cliente.enviar('PUT', '/api/me/progress/aula-teste-4', { cookie: cookieDeA });
  assert.equal(antes.status, 403);

  const post = await cliente.enviar('POST', '/api/me/exercicios/mod-b', {
    cookie: cookieDeA,
    corpo: { respostas: respostasCom(10) },
  });
  assert.equal(post.status, 200);

  const depois = await cliente.enviar('PUT', '/api/me/progress/aula-teste-4', { cookie: cookieDeA });
  assert.equal(depois.status, 200);
});

test('B não vê o resultado de A, e userId no corpo é ignorado', async () => {
  await liberarModB(idDeA);
  const cliente = novoCliente(baseUrl);

  const post = await cliente.enviar('POST', '/api/me/exercicios/mod-b', {
    cookie: cookieDeA,
    corpo: { respostas: respostasCom(8), userId: idDeB },
  });
  assert.equal(post.status, 200);

  const deB = await cliente.enviar('GET', '/api/me/exercicios', { cookie: cookieDeB });
  assert.equal(deB.status, 200);
  assert.deepEqual(deB.corpo, { resultados: [] });

  const deA = await cliente.enviar('GET', '/api/me/exercicios', { cookie: cookieDeA });
  assert.equal(deA.corpo.resultados.length, 1);
  assert.deepEqual(await resultadosNoBanco(), [{ user_id: idDeA, module_id: 'mod-b' }]);
});

test('o POST devolve exatamente as chaves de CorrecaoDTO, e nenhuma resposta traz o gabarito', async () => {
  await liberarModB(idDeA);
  const cliente = novoCliente(baseUrl);

  const post = await cliente.enviar('POST', '/api/me/exercicios/mod-b', {
    cookie: cookieDeA,
    corpo: { respostas: respostasCom(5) },
  });
  const get = await cliente.enviar('GET', '/api/me/exercicios', { cookie: cookieDeA });

  assert.deepEqual(Object.keys(post.corpo).sort(), CHAVES_DA_CORRECAO);
  assert.deepEqual(Object.keys(post.corpo.resultado).sort(), CHAVES_DO_RESULTADO);
  assert.deepEqual(Object.keys(get.corpo), ['resultados']);
  assert.deepEqual(Object.keys(get.corpo.resultados[0]).sort(), CHAVES_DO_RESULTADO);

  for (const resposta of [post, get]) {
    assert.doesNotMatch(JSON.stringify(resposta.corpo), /gabarito/i);
  }
});

test('o GET ignora resultados de módulos que não têm exercício no catálogo', async () => {
  await pool.query(
    'INSERT INTO exercise_results (user_id, module_id, melhor_acertos, total, aprovado_em) VALUES ($1, $2, 10, 10, now())',
    [idDeA, 'mod-a'],
  );
  const cliente = novoCliente(baseUrl);

  const get = await cliente.enviar('GET', '/api/me/exercicios', { cookie: cookieDeA });

  assert.equal(get.status, 200);
  assert.deepEqual(get.corpo, { resultados: [] });
});
