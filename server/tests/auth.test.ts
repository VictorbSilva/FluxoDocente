import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type pg from 'pg';
import { createApp } from '../app.js';
import { hashSenha } from '../auth/senha.js';
import { prepararBanco } from './ajuda.js';
import { novoCliente } from './http.js';

const SENHA = 'senha-correta-123';

let pool: pg.Pool;
const servidores: Server[] = [];

async function subirApp(): Promise<string> {
  const servidor = createApp({ production: false, pool, sessionSecret: 'x'.repeat(40), lessonIds: new Set() }).listen(0);
  servidores.push(servidor);
  await once(servidor, 'listening');
  return `http://localhost:${(servidor.address() as AddressInfo).port}`;
}

async function criarUsuario(email: string): Promise<string> {
  const { rows } = await pool.query<{ id: string }>(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
    [email, await hashSenha(SENHA)],
  );
  return rows[0].id;
}

let baseUrl: string;
let docenteId: string;
let fulanoId: string;

before(async () => {
  pool = await prepararBanco();
  docenteId = await criarUsuario('docente@exemplo.com');
  fulanoId = await criarUsuario('fulano@x.com');
  baseUrl = await subirApp();
});

after(async () => {
  for (const servidor of servidores) {
    servidor.closeAllConnections();
    servidor.close();
  }

  await pool?.end();
});

test('login com senha certa devolve o usuário e o cookie de sessão', async () => {
  const cliente = novoCliente(baseUrl);
  const resposta = await cliente.enviar('POST', '/api/auth/login', {
    corpo: { email: 'docente@exemplo.com', password: SENHA },
  });

  assert.equal(resposta.status, 200);
  assert.deepEqual(resposta.corpo, { user: { id: docenteId, email: 'docente@exemplo.com' } });

  const sid = resposta.setCookie.find((valor) => valor.startsWith('fd.sid='));
  assert.ok(sid);
  assert.match(sid, /;\s*HttpOnly/i);
  assert.match(sid, /;\s*SameSite=Lax/i);
});

test('senha errada e e-mail inexistente recebem a mesma resposta 401', async () => {
  const cliente = novoCliente(baseUrl);
  const senhaErrada = await cliente.enviar('POST', '/api/auth/login', {
    corpo: { email: 'docente@exemplo.com', password: 'senha-errada' },
  });
  const emailInexistente = await cliente.enviar('POST', '/api/auth/login', {
    corpo: { email: 'ninguem@exemplo.com', password: SENHA },
  });

  assert.equal(senhaErrada.status, 401);
  assert.equal(emailInexistente.status, 401);
  assert.equal(senhaErrada.corpo.error.code, 'credenciais_invalidas');
  assert.deepEqual(emailInexistente.corpo, senhaErrada.corpo);
  assert.equal(cliente.cookie, undefined);
});

test('e-mail com espaços e maiúsculas entra na conta normalizada', async () => {
  const cliente = novoCliente(baseUrl);
  const resposta = await cliente.enviar('POST', '/api/auth/login', {
    corpo: { email: ' Fulano@X.com ', password: SENHA },
  });

  assert.equal(resposta.status, 200);
  assert.deepEqual(resposta.corpo, { user: { id: fulanoId, email: 'fulano@x.com' } });
});

test('GET /api/auth/me exige sessão e não expõe o hash da senha', async () => {
  const cliente = novoCliente(baseUrl);
  const semCookie = await cliente.enviar('GET', '/api/auth/me');

  assert.equal(semCookie.status, 401);
  assert.equal(semCookie.corpo.error.code, 'nao_autenticado');

  await cliente.enviar('POST', '/api/auth/login', {
    corpo: { email: 'docente@exemplo.com', password: SENHA },
  });
  const comCookie = await cliente.enviar('GET', '/api/auth/me');

  assert.equal(comCookie.status, 200);
  assert.deepEqual(comCookie.corpo, { user: { id: docenteId, email: 'docente@exemplo.com' } });
  assert.ok(!('password_hash' in comCookie.corpo.user));
});

test('logout encerra a sessão e o cookie antigo deixa de valer', async () => {
  const cliente = novoCliente(baseUrl);
  await cliente.enviar('POST', '/api/auth/login', {
    corpo: { email: 'docente@exemplo.com', password: SENHA },
  });
  const cookieAntigo = cliente.cookie;
  assert.ok(cookieAntigo);

  const logout = await cliente.enviar('POST', '/api/auth/logout');
  assert.equal(logout.status, 204);

  const depois = await cliente.enviar('GET', '/api/auth/me', { cookie: cookieAntigo });
  assert.equal(depois.status, 401);
});

test('sessão criada antes da troca de senha deixa de valer', async () => {
  const id = await criarUsuario('troca@exemplo.com');
  const cliente = novoCliente(baseUrl);
  await cliente.enviar('POST', '/api/auth/login', {
    corpo: { email: 'troca@exemplo.com', password: SENHA },
  });
  const cookieAntigo = cliente.cookie;
  assert.ok(cookieAntigo);

  // Troca o hash sem apagar as sessões, como num login que termina depois do reset.
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
    await hashSenha('outra-senha'),
    id,
  ]);

  const primeira = await cliente.enviar('GET', '/api/auth/me', { cookie: cookieAntigo });
  assert.equal(primeira.status, 401);
  assert.equal(primeira.corpo.error.code, 'nao_autenticado');

  const segunda = await cliente.enviar('GET', '/api/auth/me', { cookie: cookieAntigo });
  assert.equal(segunda.status, 401);
  assert.equal(segunda.corpo.error.code, 'nao_autenticado');
});

test('login sem o cabeçalho X-FluxoDocente é recusado', async () => {
  const cliente = novoCliente(baseUrl);
  const resposta = await cliente.enviar('POST', '/api/auth/login', {
    corpo: { email: 'docente@exemplo.com', password: SENHA },
    semCabecalho: true,
  });

  assert.equal(resposta.status, 403);
  assert.equal(resposta.corpo.error.code, 'origem_invalida');
  assert.equal(cliente.cookie, undefined);
});

test('login com corpo inválido devolve 400', async () => {
  const cliente = novoCliente(baseUrl);
  const semEmail = await cliente.enviar('POST', '/api/auth/login', {
    corpo: { password: SENHA },
  });
  const senhaNaoTexto = await cliente.enviar('POST', '/api/auth/login', {
    corpo: { email: 'docente@exemplo.com', password: 123456 },
  });

  assert.equal(semEmail.status, 400);
  assert.equal(semEmail.corpo.error.code, 'dados_invalidos');
  assert.equal(senhaNaoTexto.status, 400);
  assert.equal(senhaNaoTexto.corpo.error.code, 'dados_invalidos');
});

test('a 11ª tentativa de login seguida devolve 429', async () => {
  const cliente = novoCliente(await subirApp());
  const tentar = () => cliente.enviar('POST', '/api/auth/login', {
    corpo: { email: 'docente@exemplo.com', password: 'senha-errada' },
  });

  for (let tentativa = 1; tentativa <= 10; tentativa++) {
    assert.equal((await tentar()).status, 401, `tentativa ${tentativa}`);
  }

  const bloqueada = await tentar();
  assert.equal(bloqueada.status, 429);
  assert.equal(bloqueada.corpo.error.code, 'muitas_tentativas');
});
