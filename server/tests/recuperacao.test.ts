import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type pg from 'pg';
import { createApp } from '../app.js';
import { hashSenha } from '../auth/senha.js';
import type { EnviarEmail } from '../email/enviar.js';
import { prepararBanco } from './ajuda.js';
import { catalogoDeTeste } from './catalogo-de-teste.js';
import { novoCliente } from './http.js';

type Mensagem = Parameters<EnviarEmail>[0];

const SENHA_ANTIGA = 'senha-antiga-123';
const SENHA_NOVA = 'senha-nova-456';
const APP_URL = 'https://fluxodocente.exemplo';
const TOKEN_INVALIDO = {
  error: { code: 'token_invalido', message: 'Este link expirou ou já foi usado. Peça um novo.' },
};

let pool: pg.Pool;
const servidores: Server[] = [];

// Cada app tem o próprio limite por IP e a própria caixa de saída falsa.
async function subirApp(comEmail = true): Promise<{ url: string; mensagens: Mensagem[] }> {
  const mensagens: Mensagem[] = [];
  const enviar: EnviarEmail = async (mensagem) => {
    mensagens.push(mensagem);
  };
  const servidor = createApp({
    production: false,
    pool,
    sessionSecret: 'x'.repeat(40),
    catalogo: catalogoDeTeste,
    email: comEmail ? { enviar, appUrl: APP_URL } : null,
  }).listen(0);
  servidores.push(servidor);
  await once(servidor, 'listening');
  return { url: `http://localhost:${(servidor.address() as AddressInfo).port}`, mensagens };
}

// O envio acontece depois da resposta, então o teste espera a mensagem chegar.
async function esperarMensagens(mensagens: Mensagem[], quantidade: number): Promise<void> {
  const limite = Date.now() + 2000;

  while (mensagens.length < quantidade) {
    if (Date.now() > limite) {
      throw new Error(`Esperava ${quantidade} e-mail(s), chegaram ${mensagens.length}.`);
    }

    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

function aguardar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function tokenDa(mensagem: Mensagem): string {
  const encontrado = mensagem.texto.match(/#token=([A-Za-z0-9_-]+)/);
  assert.ok(encontrado, 'o e-mail não tem o token');
  return encontrado[1];
}

async function criarUsuario(email: string, nome: string | null = null): Promise<string> {
  const { rows } = await pool.query<{ id: string }>(
    'INSERT INTO users (email, password_hash, nome) VALUES ($1, $2, $3) RETURNING id',
    [email, await hashSenha(SENHA_ANTIGA), nome],
  );
  return rows[0].id;
}

function pedir(url: string, email: string) {
  return novoCliente(url).enviar('POST', '/api/auth/senha/esqueci', { corpo: { email } });
}

function redefinir(url: string, token: string, password: string) {
  return novoCliente(url).enviar('POST', '/api/auth/senha/redefinir', { corpo: { token, password } });
}

function login(url: string, email: string, password: string) {
  return novoCliente(url).enviar('POST', '/api/auth/login', { corpo: { email, password } });
}

async function pedirLink(url: string, mensagens: Mensagem[], email: string): Promise<string> {
  const antes = mensagens.length;
  const resposta = await pedir(url, email);
  assert.equal(resposta.status, 202);
  await esperarMensagens(mensagens, antes + 1);
  return tokenDa(mensagens[antes]);
}

before(async () => {
  pool = await prepararBanco();
});

after(async () => {
  for (const servidor of servidores) {
    servidor.closeAllConnections();
    servidor.close();
  }

  await pool?.end();
});

test('pedir a recuperação responde igual com ou sem conta, e só a conta existente recebe o e-mail', async () => {
  const { url, mensagens } = await subirApp();
  const nome = `Ana <b>"D'Ávila" & Cia</b>`;
  const userId = await criarUsuario('ana@exemplo.com', nome);

  const semConta = await pedir(url, 'ninguem@exemplo.com');
  const comConta = await pedir(url, ' Ana@Exemplo.com ');

  assert.equal(semConta.status, 202);
  assert.equal(comConta.status, 202);
  assert.deepEqual(semConta.corpo, { ok: true });
  assert.deepEqual(comConta.corpo, semConta.corpo);

  await esperarMensagens(mensagens, 1);
  await aguardar(200);
  assert.equal(mensagens.length, 1);

  const [mensagem] = mensagens;
  const token = tokenDa(mensagem);
  const link = `${APP_URL}/redefinir-senha#token=${token}`;
  assert.equal(mensagem.para, 'ana@exemplo.com');
  assert.equal(mensagem.nomeDoDestinatario, nome);
  assert.equal(mensagem.assunto, 'Redefinição de senha do Fluxo Docente');
  assert.equal(Buffer.from(token, 'base64url').length, 32);
  assert.equal(mensagem.texto, [
    `Olá, ${nome}.`,
    'Recebemos um pedido para redefinir a senha da sua conta no Fluxo Docente. Para criar uma senha nova, abra o link abaixo. Ele vale por 1 hora e só pode ser usado uma vez.',
    link,
    'Se você não fez esse pedido, ignore este e-mail. Sua senha continua a mesma.',
    'Equipe Fluxo Docente',
  ].join('\n\n'));

  assert.ok(mensagem.html.includes('Ana &lt;b&gt;&quot;D&#39;Ávila&quot; &amp; Cia&lt;/b&gt;'));
  assert.ok(!mensagem.html.includes(nome));
  assert.ok(mensagem.html.includes(`href="${link}"`));
  assert.ok(mensagem.html.includes(`>${link}</a>`));
  assert.ok(mensagem.html.includes('#177a7a'));

  const { rows } = await pool.query<{ token_hash: string; criado_em: Date; expira_em: Date; usado_em: Date | null }>(
    'SELECT token_hash, criado_em, expira_em, usado_em FROM password_resets WHERE user_id = $1',
    [userId],
  );
  assert.equal(rows.length, 1);
  assert.notEqual(rows[0].token_hash, token);
  assert.equal(rows[0].token_hash, createHash('sha256').update(token).digest('hex'));
  assert.equal(rows[0].usado_em, null);
  // Comparado com o relógio do banco, que pode diferir do da máquina dos testes.
  assert.equal(rows[0].expira_em.getTime() - rows[0].criado_em.getTime(), 60 * 60 * 1000);
});

test('sem nome na conta, o e-mail trata o destinatário por docente', async () => {
  const { url, mensagens } = await subirApp();
  await criarUsuario('sem-nome@exemplo.com');

  await pedirLink(url, mensagens, 'sem-nome@exemplo.com');

  assert.equal(mensagens[0].nomeDoDestinatario, null);
  assert.ok(mensagens[0].texto.startsWith('Olá, docente.\n\n'));
  assert.ok(mensagens[0].html.includes('Olá, docente.'));
});

test('redefinir com o token troca a senha, derruba as sessões e o token não vale de novo', async () => {
  const { url, mensagens } = await subirApp();
  const userId = await criarUsuario('troca@exemplo.com');
  const clienteAntigo = novoCliente(url);
  assert.equal((await clienteAntigo.enviar('POST', '/api/auth/login', {
    corpo: { email: 'troca@exemplo.com', password: SENHA_ANTIGA },
  })).status, 200);

  const token = await pedirLink(url, mensagens, 'troca@exemplo.com');
  const cliente = novoCliente(url);
  const resposta = await cliente.enviar('POST', '/api/auth/senha/redefinir', {
    corpo: { token, password: SENHA_NOVA },
  });

  assert.equal(resposta.status, 200);
  assert.deepEqual(resposta.corpo, { ok: true });
  assert.equal(cliente.cookie, undefined);

  const { rows } = await pool.query<{ total: number }>(
    "SELECT count(*)::int AS total FROM session WHERE sess->>'userId' = $1",
    [userId],
  );
  assert.equal(rows[0].total, 0);

  assert.equal((await clienteAntigo.enviar('GET', '/api/auth/me')).status, 401);
  assert.equal((await login(url, 'troca@exemplo.com', SENHA_NOVA)).status, 200);
  assert.equal((await login(url, 'troca@exemplo.com', SENHA_ANTIGA)).status, 401);

  const deNovo = await redefinir(url, token, 'outra-senha-789');
  assert.equal(deNovo.status, 400);
  assert.deepEqual(deNovo.corpo, TOKEN_INVALIDO);
  assert.equal((await login(url, 'troca@exemplo.com', SENHA_NOVA)).status, 200);
});

test('token vencido devolve 400 e não troca a senha', async () => {
  const { url, mensagens } = await subirApp();
  const userId = await criarUsuario('vencido@exemplo.com');
  const token = await pedirLink(url, mensagens, 'vencido@exemplo.com');
  await pool.query("UPDATE password_resets SET expira_em = now() - interval '1 minute' WHERE user_id = $1", [userId]);

  const resposta = await redefinir(url, token, SENHA_NOVA);

  assert.equal(resposta.status, 400);
  assert.deepEqual(resposta.corpo, TOKEN_INVALIDO);
  assert.equal((await login(url, 'vencido@exemplo.com', SENHA_ANTIGA)).status, 200);
});

test('token desconhecido ou que não é texto devolve 400', async () => {
  const { url } = await subirApp();

  for (const token of ['nao-existe', 123, undefined]) {
    const resposta = await novoCliente(url).enviar('POST', '/api/auth/senha/redefinir', {
      corpo: { token, password: SENHA_NOVA },
    });

    assert.equal(resposta.status, 400, String(token));
    assert.deepEqual(resposta.corpo, TOKEN_INVALIDO, String(token));
  }
});

test('um pedido novo invalida o link anterior', async () => {
  const { url, mensagens } = await subirApp();
  const userId = await criarUsuario('dois-links@exemplo.com');
  const primeiro = await pedirLink(url, mensagens, 'dois-links@exemplo.com');
  // Passa da janela de 2 minutos entre pedidos.
  await pool.query("UPDATE password_resets SET criado_em = now() - interval '3 minutes' WHERE user_id = $1", [userId]);
  const segundo = await pedirLink(url, mensagens, 'dois-links@exemplo.com');

  assert.notEqual(primeiro, segundo);
  assert.deepEqual((await redefinir(url, primeiro, SENHA_NOVA)).corpo, TOKEN_INVALIDO);

  const resposta = await redefinir(url, segundo, SENHA_NOVA);
  assert.equal(resposta.status, 200);
  assert.equal((await login(url, 'dois-links@exemplo.com', SENHA_NOVA)).status, 200);
});

test('senha inválida devolve 400 e o token continua valendo', async () => {
  const { url, mensagens } = await subirApp();
  await criarUsuario('senha-curta@exemplo.com');
  const token = await pedirLink(url, mensagens, 'senha-curta@exemplo.com');

  for (const password of ['1234567', 'a'.repeat(201), undefined, 12345678]) {
    const resposta = await novoCliente(url).enviar('POST', '/api/auth/senha/redefinir', {
      corpo: { token, password },
    });

    assert.equal(resposta.status, 400, String(password));
    assert.deepEqual(resposta.corpo, {
      error: { code: 'senha_invalida', message: 'A senha precisa ter de 8 a 200 caracteres.' },
    }, String(password));
  }

  assert.equal((await redefinir(url, token, SENHA_NOVA)).status, 200);
  assert.equal((await login(url, 'senha-curta@exemplo.com', SENHA_NOVA)).status, 200);
});

test('dois pedidos em menos de 2 minutos mandam um e-mail só', async () => {
  const { url, mensagens } = await subirApp();
  const userId = await criarUsuario('apressado@exemplo.com');

  assert.equal((await pedir(url, 'apressado@exemplo.com')).status, 202);
  assert.equal((await pedir(url, 'apressado@exemplo.com')).status, 202);
  await esperarMensagens(mensagens, 1);
  await aguardar(200);

  assert.equal(mensagens.length, 1);
  const { rows } = await pool.query('SELECT 1 FROM password_resets WHERE user_id = $1', [userId]);
  assert.equal(rows.length, 1);
});

test('e-mail inválido devolve 400', async () => {
  const { url, mensagens } = await subirApp();

  for (const email of [undefined, 'sem-arroba.com', `${'a'.repeat(250)}@x.com`]) {
    const resposta = await novoCliente(url).enviar('POST', '/api/auth/senha/esqueci', { corpo: { email } });

    assert.equal(resposta.status, 400, String(email));
    assert.deepEqual(resposta.corpo, {
      error: { code: 'email_invalido', message: 'Informe um e-mail válido.' },
    }, String(email));
  }

  assert.equal(mensagens.length, 0);
});

test('sem e-mail configurado, pedir a recuperação devolve 503', async () => {
  const { url } = await subirApp(false);
  await criarUsuario('sem-envio@exemplo.com');

  const resposta = await pedir(url, 'sem-envio@exemplo.com');

  assert.equal(resposta.status, 503);
  assert.deepEqual(resposta.corpo, {
    error: {
      code: 'email_indisponivel',
      message: 'A recuperação de senha está indisponível. Fale com a equipe do projeto.',
    },
  });
});

test('sem o cabeçalho X-FluxoDocente, as duas rotas recusam', async () => {
  const { url, mensagens } = await subirApp();
  await criarUsuario('sem-cabecalho@exemplo.com');

  const esqueci = await novoCliente(url).enviar('POST', '/api/auth/senha/esqueci', {
    corpo: { email: 'sem-cabecalho@exemplo.com' },
    semCabecalho: true,
  });
  const redefinicao = await novoCliente(url).enviar('POST', '/api/auth/senha/redefinir', {
    corpo: { token: 'qualquer', password: SENHA_NOVA },
    semCabecalho: true,
  });

  assert.equal(esqueci.status, 403);
  assert.equal(esqueci.corpo.error.code, 'origem_invalida');
  assert.equal(redefinicao.status, 403);
  assert.equal(redefinicao.corpo.error.code, 'origem_invalida');
  await aguardar(200);
  assert.equal(mensagens.length, 0);
});

test('o 6º pedido seguido do mesmo IP devolve 429', async () => {
  const { url } = await subirApp();

  for (let numero = 1; numero <= 5; numero++) {
    assert.equal((await pedir(url, `limite${numero}@exemplo.com`)).status, 202, `pedido ${numero}`);
  }

  const bloqueado = await pedir(url, 'limite6@exemplo.com');
  assert.equal(bloqueado.status, 429);
  assert.deepEqual(bloqueado.corpo, {
    error: { code: 'muitas_tentativas', message: 'Muitas tentativas. Aguarde 15 minutos.' },
  });
  // Deixa terminar as buscas feitas depois das respostas antes de fechar o pool.
  await aguardar(200);
});
