import assert from 'node:assert/strict';
import { after, afterEach, beforeEach, test } from 'node:test';
import React from 'react';
import { act, create } from 'react-test-renderer';
import { createServer } from 'vite';

const vite = await createServer({
  configFile: false,
  appType: 'custom',
  server: { middlewareMode: true, hmr: false },
  optimizeDeps: { noDiscovery: true, include: [] },
  esbuild: { jsx: 'automatic' },
  ssr: { noExternal: ['sonner'] },
  plugins: [{
    name: 'toasts-recuperacao',
    enforce: 'pre',
    resolveId(id) { if (id === 'sonner') return '\0toasts-recuperacao'; },
    load(id) {
      if (id === '\0toasts-recuperacao') return `
        export const mensagens = [];
        export const toast = Object.fromEntries(['info', 'error', 'success'].map(
          tipo => [tipo, (mensagem, opcoes) => mensagens.push({ tipo, mensagem, opcoes })],
        ));
        export const Toaster = () => null;
      `;
    },
  }],
});
const { default: App } = await vite.ssrLoadModule('/src/app/App.tsx');
const { mensagens } = await vite.ssrLoadModule('\0toasts-recuperacao');
const originais = { fetch: globalThis.fetch, window: globalThis.window, history: globalThis.history };
let tela;
let endereco;
let autenticado;
let chamadas;
let responder;

beforeEach(() => {
  endereco = new URL('https://example.test/redefinir-senha#token=token-do-email');
  autenticado = false;
  chamadas = [];
  mensagens.length = 0;
  responder = () => Response.json({ ok: true });
  globalThis.window = {
    get location() { return endereco; },
    addEventListener() {}, removeEventListener() {},
  };
  globalThis.history = {
    replaceState(_state, _title, path) { endereco = new URL(path, endereco); },
    pushState(_state, _title, path) { endereco = new URL(path, endereco); },
  };
  globalThis.fetch = async (url, opcoes) => {
    chamadas.push({ url, opcoes });
    if (url === '/api/auth/me') return autenticado
      ? Response.json({ user: { id: 'teste', email: 'teste@example.test', nome: null } })
      : Response.json({ error: { code: 'nao_autenticado', message: 'Entre novamente.' } }, { status: 401 });
    if (url === '/api/me/progress') return Response.json({ completions: [] });
    if (url === '/api/me/matriculas') return Response.json({ matriculas: [] });
    if (url === '/api/me/exercicios') return Response.json({ resultados: [] });
    if (url === '/api/me/nivelamento') return Response.json({ disponivel: false, respondido: false });
    return responder(url, opcoes);
  };
});
afterEach(async () => {
  if (tela) await act(async () => { tela.unmount(); });
  tela = undefined;
});
after(async () => {
  Object.assign(globalThis, originais);
  await vite.close();
});
async function montar() {
  await act(async () => { tela = create(React.createElement(App)); });
}
function texto(no = tela.root) {
  return no.children.map((filho) => typeof filho === 'string' ? filho : texto(filho)).join('');
}
function botao(rotulo) {
  return tela.root.findAllByType('button').find((no) => texto(no) === rotulo);
}
async function preencher(senha = 'nova-senha', confirmacao = senha) {
  await act(async () => {
    tela.root.findByProps({ id: 'redefinir-senha' }).props.onChange({ target: { value: senha } });
    tela.root.findByProps({ id: 'redefinir-confirmacao' }).props.onChange({ target: { value: confirmacao } });
  });
}
async function enviar() {
  await act(async () => { await tela.root.findByType('form').props.onSubmit({ preventDefault() {} }); });
}

test('App lê o token antes de limpar o endereço e usa o token guardado ao salvar', async () => {
  await montar();
  assert.equal(endereco.pathname, '/redefinir-senha');
  assert.equal(endereco.hash, '');
  await preencher();
  await enviar();
  const pedido = chamadas.find(({ url }) => url === '/api/auth/senha/redefinir');
  assert.deepEqual(JSON.parse(pedido.opcoes.body), { token: 'token-do-email', password: 'nova-senha' });
  assert.equal(endereco.pathname, '/entrar');
  assert.ok(mensagens.some(({ mensagem }) => mensagem === 'Senha alterada. Entre com a senha nova.'));
});

test('link aberto com sessão ativa avisa para sair e reabrir o e-mail antes de voltar ao início', async () => {
  autenticado = true;
  await montar();
  assert.equal(endereco.pathname, '/');
  assert.equal(endereco.hash, '');
  assert.ok(mensagens.some(({ tipo, mensagem }) => tipo === 'info' && /Sair/.test(mensagem) && /link do e-mail/.test(mensagem)));
  assert.ok(mensagens.find(({ tipo }) => tipo === 'info').opcoes?.duration >= 10_000);
  assert.equal(chamadas.some(({ url }) => url === '/api/auth/senha/redefinir'), false);
});

test('recarregar sem fragmento orienta reabrir o e-mail e esperar entre pedidos', async () => {
  await montar();
  await act(async () => { tela.unmount(); });
  await montar();
  assert.match(texto(), /reabra o link no e-mail recebido/);
  assert.match(texto(), /aguarde 2 minutos/);
  assert.doesNotMatch(texto(), /Link inválido/);
  assert.equal(tela.root.findAllByType('form').length, 0);
  await act(async () => { botao('Pedir um novo link').props.onClick(); });
  assert.equal(endereco.pathname, '/esqueci-senha');
});

test('token_invalido exibe a mensagem da API e oferece pedir outro link', async () => {
  responder = () => Response.json({ error: { code: 'token_invalido', message: 'Este link expirou ou já foi usado. Peça um novo.' } }, { status: 400 });
  await montar();
  await preencher();
  await enviar();
  assert.match(texto(tela.root.findByProps({ role: 'alert' })), /Este link expirou ou já foi usado/);
  assert.equal(tela.root.findAllByType('form').length, 0);
  assert.ok(botao('Pedir um novo link'));
});

test('senhas diferentes não chamam a API', async () => {
  await montar();
  await preencher('nova-senha', 'outra-senha');
  await enviar();
  assert.match(texto(), /As senhas não conferem/);
  assert.equal(chamadas.some(({ url }) => url === '/api/auth/senha/redefinir'), false);
});

test('pedido de link exibe confirmação neutra no 202', async () => {
  endereco = new URL('/esqueci-senha', endereco);
  responder = () => Response.json({ ok: true }, { status: 202 });
  await montar();
  await act(async () => { tela.root.findByProps({ id: 'recuperacao-email' }).props.onChange({ target: { value: 'docente@example.test' } }); });
  await enviar();
  assert.match(texto(), /Se houver uma conta com esse e-mail/);
  assert.equal(tela.root.findAllByType('form').length, 0);
  assert.ok(botao('Voltar para o login'));
});
