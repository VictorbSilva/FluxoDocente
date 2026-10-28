import assert from 'node:assert/strict';
import { after, afterEach, beforeEach, test } from 'node:test';
import React from 'react';
import { act, create } from 'react-test-renderer';
import { createServer } from 'vite';

// Carrega os componentes reais pelo Vite, sem servidor HTTP nem banco.
// Apenas os toasts são capturados, pois o Toaster precisa de um DOM.
const vite = await createServer({
  configFile: false,
  appType: 'custom',
  server: { middlewareMode: true },
  optimizeDeps: { noDiscovery: true, include: [] },
  esbuild: { jsx: 'automatic' },
  ssr: { noExternal: ['sonner'] },
  plugins: [{
    name: 'capturar-toasts-nos-testes',
    enforce: 'pre',
    resolveId(id) { if (id === 'sonner') return '\0toasts-do-teste'; },
    load(id) {
      if (id !== '\0toasts-do-teste') return;
      return `
        export const mensagens = [];
        export const toast = Object.fromEntries(['info', 'error', 'success'].map(
          tipo => [tipo, mensagem => mensagens.push({ tipo, mensagem })],
        ));
        export const Toaster = () => null;
      `;
    },
  }],
});

const { default: App } = await vite.ssrLoadModule('/src/app/App.tsx');
const { CategoryGrid } = await vite.ssrLoadModule('/src/app/components/CategoryGrid.tsx');
const { VideoPlayer } = await vite.ssrLoadModule('/src/app/components/VideoPlayer.tsx');
const { courses, modules, lessons } = await vite.ssrLoadModule('/shared/catalog.ts');
const { exercicios } = await vite.ssrLoadModule('/shared/exercicios.ts');
const { mensagens } = await vite.ssrLoadModule('\0toasts-do-teste');
const perguntasOriginais = exercicios.map((exercicio) => exercicio.perguntas);
const globaisOriginais = { fetch: globalThis.fetch, window: globalThis.window, history: globalThis.history };
const aula = lessons.find((lesson) => lesson.moduleId === exercicios[0].moduleId);
// Os módulos do curso antes do da aula vêm completos, para que ela esteja liberada.
const curso = courses.find((c) => c.moduleIds.includes(aula.moduleId));
const posicao = curso.moduleIds.indexOf(aula.moduleId);
const modulosAnteriores = curso.moduleIds.slice(0, posicao);
const proximoModulo = curso.moduleIds[posicao + 1];
const conclusoesAnteriores = lessons
  .filter((lesson) => modulosAnteriores.includes(lesson.moduleId))
  .map((lesson) => ({ lessonId: lesson.id, completedAt: '2026-10-23T00:00:00Z' }));
const aprovacoesAnteriores = exercicios
  .filter((exercicio) => modulosAnteriores.includes(exercicio.moduleId))
  .map(({ moduleId }) => ({ moduleId, melhorAcertos: 1, total: 1, aprovado: true, aprovadoEm: '2026-10-23T00:00:00Z' }));
let tela;
let falhas;
let consultas;
let completions;
let matriculado;

beforeEach(() => {
  falhas = new Map();
  consultas = [];
  completions = [...conclusoesAnteriores];
  matriculado = true;
  mensagens.length = 0;
  exercicios.forEach((exercicio, indice) => { exercicio.perguntas = perguntasOriginais[indice]; });
  globalThis.window = {
    location: { pathname: '/aula/' + aula.id },
    addEventListener() {},
    removeEventListener() {},
  };
  globalThis.history = {
    replaceState(_state, _title, path) { window.location.pathname = path; },
    pushState(_state, _title, path) { window.location.pathname = path; },
  };
  globalThis.fetch = async (url) => {
    consultas.push(url);
    const falha = falhas.get(url);
    if (falha === 'rede') throw new TypeError('Falha de rede simulada');
    if (falha) return Response.json({ error: { code: 'erro_teste', message: 'Falha simulada' } }, { status: falha });
    if (url === '/api/auth/me') return Response.json({ user: { id: 'teste', email: 'teste@example.test', nome: null } });
    if (url === '/api/me/progress') return Response.json({ completions });
    if (url === '/api/me/matriculas') return Response.json({ matriculas: matriculado ? [{ courseId: courses[0].id, enrolledAt: '2026-10-23T00:00:00Z' }] : [] });
    if (url === '/api/me/exercicios') return Response.json({ resultados: aprovacoesAnteriores });
    if (url === '/api/me/nivelamento') return Response.json({ disponivel: false, respondido: false });
    if (url.startsWith('/api/me/notes/')) return Response.json({ lessonId: url.split('/').at(-1), content: '', updatedAt: null });
    if (url.startsWith('/api/me/progress/')) return Response.json({ lessonId: url.split('/').at(-1), completedAt: '2026-10-23T00:00:00Z' });
    throw new Error('Rota inesperada no teste: ' + url);
  };
});

afterEach(async () => {
  if (tela) await act(async () => { tela.unmount(); });
  tela = undefined;
  exercicios.forEach((exercicio, indice) => { exercicio.perguntas = perguntasOriginais[indice]; });
});

after(async () => {
  Object.assign(globalThis, globaisOriginais);
  await vite.close();
});

async function montar(componente, props = {}) {
  await act(async () => {
    tela = create(React.createElement(componente, props));
  });
}

function texto(no) {
  return no.children.map((filho) => typeof filho === 'string' ? filho : texto(filho)).join('');
}

function botao(rotulo) {
  return tela.root.findAllByType('button').find((no) => texto(no) === rotulo);
}

for (const rota of ['/api/me/progress', '/api/me/matriculas', '/api/me/exercicios']) {
  for (const falha of [500, 'rede']) {
    test(`aula oferece nova tentativa após ${falha} em ${rota}`, async () => {
      falhas.set(rota, falha);
      await montar(App);
      assert.match(texto(tela.root.findByType('main')), /Não foi possível carregar a aula/);
      assert.equal(tela.root.findAllByType('iframe').length, 0);
      assert.ok(botao('Tentar novamente'));

      falhas.delete(rota);
      await act(async () => { botao('Tentar novamente').props.onClick(); });
      assert.equal(tela.root.findAllByType('iframe').length, 1);
      assert.ok(consultas.filter((url) => url === rota).length >= 2);
    });
  }
}

test('erro 401 ainda leva ao login', async () => {
  falhas.set('/api/me/exercicios', 401);
  await montar(App);
  assert.ok(botao('Fazer Login'));
  assert.equal(tela.root.findAllByType('iframe').length, 0);
});

test('nova tentativa continua exigindo matrícula', async () => {
  falhas.set('/api/me/matriculas', 500);
  await montar(App);
  assert.ok(botao('Tentar novamente'));
  falhas.clear();
  matriculado = false;
  await act(async () => { botao('Tentar novamente').props.onClick(); });
  assert.match(texto(tela.root.findByType('main')), /Matrícula necessária/);
  assert.equal(tela.root.findAllByType('iframe').length, 0);
});

test('nova tentativa mantém o bloqueio do módulo', async () => {
  window.location.pathname = '/aula/' + lessons.find((lesson) => lesson.moduleId === proximoModulo).id;
  falhas.set('/api/me/exercicios', 500);
  await montar(App);
  assert.ok(botao('Tentar novamente'));
  falhas.clear();
  await act(async () => { botao('Tentar novamente').props.onClick(); });
  assert.match(texto(tela.root.findByType('main')), /Módulo bloqueado/);
  assert.equal(tela.root.findAllByType('iframe').length, 0);
});

for (const vazio of [true, false]) {
  test(`grade ${vazio ? 'ignora exercício vazio' : 'oferece exercício com perguntas'}`, async () => {
    if (vazio) exercicios[0].perguntas = [];
    await montar(CategoryGrid, {
      onCategorySelect() {}, onExercicio() {}, moduleIds: [aula.moduleId], liberado: () => true,
    });
    assert.equal(Boolean(botao('Fazer avaliação')), !vazio);
  });

  test(`player ${vazio ? 'ignora exercício vazio' : 'oferece exercício com perguntas'}`, async () => {
    if (vazio) exercicios[0].perguntas = [];
    await montar(VideoPlayer, {
      lesson: aula,
      module: modules.find((modulo) => modulo.id === aula.moduleId),
      onSelectLesson() {}, concluidas: new Map(), carregado: true,
      onConcluir: async () => {}, onAlteracoesPendentes() {}, onErro() {},
      liberado: () => true, resultados: new Map(), onAbrirExercicio() {},
    });
    assert.equal(texto(tela.root).includes('Avaliação do módulo'), !vazio);
  });

  test(`concluir módulo ${vazio ? 'não pede exercício vazio' : 'pede avaliação com perguntas'}`, async () => {
    if (vazio) exercicios[0].perguntas = [];
    completions = [...conclusoesAnteriores, ...lessons
      .filter((lesson) => lesson.moduleId === aula.moduleId && lesson.id !== aula.id)
      .map((lesson) => ({ lessonId: lesson.id, completedAt: '2026-10-23T00:00:00Z' }))];
    await montar(App);
    await act(async () => { await botao('Marcar como Concluído').props.onClick(); });
    assert.equal(mensagens.some(({ tipo, mensagem }) => tipo === 'info' && mensagem.includes('Faça a avaliação')), !vazio);
  });
}
