import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type pg from 'pg';
import { VERSAO_DO_TERMO } from '../../shared/termo.js';
import { createApp } from '../app.js';
import { hojeEmFortaleza, prepararBanco, registrosDeUso } from './ajuda.js';
import { catalogoDeTeste } from './catalogo-de-teste.js';
import { novoCliente } from './http.js';

const SENHA = 'senha-nova-123';

let pool: pg.Pool;
const servidores: Server[] = [];

async function subirApp(): Promise<string> {
  const servidor = createApp({ production: false, pool, sessionSecret: 'x'.repeat(40), catalogo: catalogoDeTeste }).listen(0);
  servidores.push(servidor);
  await once(servidor, 'listening');
  return `http://localhost:${(servidor.address() as AddressInfo).port}`;
}

function corpoValido(email: string): Record<string, unknown> {
  return { nome: 'Docente Novo', email, password: SENHA, aceitouTermo: true };
}

async function contarUsuarios(): Promise<number> {
  const { rows } = await pool.query<{ total: number }>('SELECT count(*)::int AS total FROM users');
  return rows[0].total;
}

async function contarRegistrosDeUso(): Promise<{ logins: number; acessos: number }> {
  const { rows } = await pool.query<{ logins: number; acessos: number }>(
    'SELECT (SELECT count(*)::int FROM logins) AS logins, (SELECT count(*)::int FROM acessos_diarios) AS acessos',
  );
  return rows[0];
}

let baseUrl: string;

before(async () => {
  pool = await prepararBanco();
  baseUrl = await subirApp();
});

after(async () => {
  for (const servidor of servidores) {
    servidor.closeAllConnections();
    servidor.close();
  }

  await pool?.end();
});

test('cadastro devolve 201 com o usuário e o cookie, e a sessão já vale', async () => {
  const cliente = novoCliente(baseUrl);
  const resposta = await cliente.enviar('POST', '/api/auth/cadastro', {
    corpo: corpoValido('novo@exemplo.com'),
  });

  assert.equal(resposta.status, 201);
  assert.equal(resposta.corpo.user.email, 'novo@exemplo.com');
  assert.equal(resposta.corpo.user.nome, 'Docente Novo');
  assert.equal(typeof resposta.corpo.user.id, 'string');
  assert.ok(!('password_hash' in resposta.corpo.user));

  const sid = resposta.setCookie.find((valor) => valor.startsWith('fd.sid='));
  assert.ok(sid);
  assert.match(sid, /;\s*HttpOnly/i);
  assert.match(sid, /;\s*SameSite=Lax/i);

  const me = await cliente.enviar('GET', '/api/auth/me');
  assert.equal(me.status, 200);
  assert.deepEqual(me.corpo, resposta.corpo);
});

test('cadastro grava o e-mail normalizado e o aceite do termo', async () => {
  const cliente = novoCliente(baseUrl);
  const resposta = await cliente.enviar('POST', '/api/auth/cadastro', {
    corpo: { ...corpoValido('  Maria.Silva@Exemplo.COM '), nome: '  Maria Silva  ' },
  });

  assert.equal(resposta.status, 201);
  assert.equal(resposta.corpo.user.email, 'maria.silva@exemplo.com');
  assert.equal(resposta.corpo.user.nome, 'Maria Silva');

  const { rows } = await pool.query<{ email: string; termo_aceito_em: Date | null; termo_versao: number | null }>(
    'SELECT email, termo_aceito_em, termo_versao FROM users WHERE id = $1',
    [resposta.corpo.user.id],
  );
  assert.equal(rows[0].email, 'maria.silva@exemplo.com');
  assert.ok(rows[0].termo_aceito_em instanceof Date);
  assert.equal(rows[0].termo_versao, VERSAO_DO_TERMO);
  assert.equal(VERSAO_DO_TERMO, 2);
});

test('cadastro grava a entrada e o acesso do dia', async () => {
  const resposta = await novoCliente(baseUrl).enviar('POST', '/api/auth/cadastro', {
    corpo: corpoValido('registro@exemplo.com'),
  });

  assert.equal(resposta.status, 201);
  assert.deepEqual(
    await registrosDeUso(pool, resposta.corpo.user.id),
    { logins: ['cadastro'], dias: [hojeEmFortaleza()] },
  );
});

test('cadastro recusado não grava entrada nem acesso', async () => {
  const existente = await novoCliente(baseUrl).enviar('POST', '/api/auth/cadastro', {
    corpo: corpoValido('recusado@exemplo.com'),
  });
  assert.equal(existente.status, 201);
  const antes = await contarRegistrosDeUso();

  const repetido = await novoCliente(baseUrl).enviar('POST', '/api/auth/cadastro', {
    corpo: corpoValido('recusado@exemplo.com'),
  });
  const semTermo = await novoCliente(baseUrl).enviar('POST', '/api/auth/cadastro', {
    corpo: { ...corpoValido('sem-termo@exemplo.com'), aceitouTermo: false },
  });

  assert.equal(repetido.status, 409);
  assert.equal(semTermo.status, 400);
  assert.deepEqual(await contarRegistrosDeUso(), antes);
});

test('o login funciona com a senha escolhida no cadastro', async () => {
  const cadastro = await novoCliente(baseUrl).enviar('POST', '/api/auth/cadastro', {
    corpo: corpoValido('login@exemplo.com'),
  });
  assert.equal(cadastro.status, 201);

  const cliente = novoCliente(baseUrl);
  const login = await cliente.enviar('POST', '/api/auth/login', {
    corpo: { email: 'login@exemplo.com', password: SENHA },
  });

  assert.equal(login.status, 200);
  assert.deepEqual(login.corpo, cadastro.corpo);
});

test('e-mail já cadastrado, mesmo com maiúsculas, devolve 409', async () => {
  const primeiro = await novoCliente(baseUrl).enviar('POST', '/api/auth/cadastro', {
    corpo: corpoValido('repetido@exemplo.com'),
  });
  assert.equal(primeiro.status, 201);
  const total = await contarUsuarios();

  for (const email of ['repetido@exemplo.com', ' Repetido@Exemplo.com ']) {
    const cliente = novoCliente(baseUrl);
    const resposta = await cliente.enviar('POST', '/api/auth/cadastro', {
      corpo: corpoValido(email),
    });

    assert.equal(resposta.status, 409, email);
    assert.deepEqual(resposta.corpo, {
      error: { code: 'email_em_uso', message: 'Já existe uma conta com esse e-mail.' },
    });
    assert.equal(cliente.cookie, undefined);
  }

  assert.equal(await contarUsuarios(), total);
});

test('cada campo inválido devolve 400 e não cria conta', async () => {
  const url = await subirApp();
  const total = await contarUsuarios();
  const erroDoNome = { code: 'nome_invalido', message: 'Informe um nome de 1 a 120 caracteres.' };
  const erroDoEmail = { code: 'email_invalido', message: 'Informe um e-mail válido.' };
  const erroDaSenha = { code: 'senha_invalida', message: 'A senha precisa ter de 8 a 200 caracteres.' };
  const erroDoTermo = { code: 'termo_obrigatorio', message: 'Aceite o termo de consentimento para criar a conta.' };
  const base = corpoValido('invalido@exemplo.com');

  const casos: Array<[Record<string, unknown>, { code: string; message: string }]> = [
    [{}, erroDoNome],
    [{ ...base, nome: undefined }, erroDoNome],
    [{ ...base, nome: '   ' }, erroDoNome],
    [{ ...base, nome: 123 }, erroDoNome],
    [{ ...base, nome: 'a'.repeat(121) }, erroDoNome],
    [{ ...base, email: undefined }, erroDoEmail],
    [{ ...base, email: 'sem-arroba.com' }, erroDoEmail],
    [{ ...base, email: 'docente@exemplo' }, erroDoEmail],
    [{ ...base, email: `${'a'.repeat(250)}@x.com` }, erroDoEmail],
    [{ ...base, password: undefined }, erroDaSenha],
    [{ ...base, password: '1234567' }, erroDaSenha],
    [{ ...base, password: 'a'.repeat(201) }, erroDaSenha],
    [{ ...base, aceitouTermo: false }, erroDoTermo],
    [{ ...base, aceitouTermo: 'true' }, erroDoTermo],
    [{ ...base, aceitouTermo: undefined }, erroDoTermo],
  ];

  for (const [corpo, erro] of casos) {
    const cliente = novoCliente(url);
    const resposta = await cliente.enviar('POST', '/api/auth/cadastro', { corpo });

    assert.equal(resposta.status, 400, JSON.stringify(corpo));
    assert.deepEqual(resposta.corpo, { error: erro }, JSON.stringify(corpo));
    assert.equal(cliente.cookie, undefined);
  }

  assert.equal(await contarUsuarios(), total);
});

test('cadastro sem o cabeçalho X-FluxoDocente é recusado', async () => {
  const cliente = novoCliente(baseUrl);
  const resposta = await cliente.enviar('POST', '/api/auth/cadastro', {
    corpo: corpoValido('sem-cabecalho@exemplo.com'),
    semCabecalho: true,
  });

  assert.equal(resposta.status, 403);
  assert.equal(resposta.corpo.error.code, 'origem_invalida');
  assert.equal(cliente.cookie, undefined);

  const { rows } = await pool.query('SELECT 1 FROM users WHERE email = $1', ['sem-cabecalho@exemplo.com']);
  assert.equal(rows.length, 0);
});

test('o 21º cadastro seguido do mesmo IP devolve 429', async () => {
  const url = await subirApp();
  const cadastrar = (numero: number) => novoCliente(url).enviar('POST', '/api/auth/cadastro', {
    corpo: corpoValido(`limite${numero}@exemplo.com`),
  });

  for (let numero = 1; numero <= 20; numero++) {
    assert.equal((await cadastrar(numero)).status, 201, `cadastro ${numero}`);
  }

  const bloqueado = await cadastrar(21);
  assert.equal(bloqueado.status, 429);
  assert.deepEqual(bloqueado.corpo, {
    error: { code: 'muitas_tentativas', message: 'Muitas tentativas. Aguarde uma hora.' },
  });
});
