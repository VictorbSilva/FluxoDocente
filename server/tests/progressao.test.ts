import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cursoConcluido, moduloCompleto, moduloLiberado } from '../../shared/progressao.js';
import { catalogoDeTeste } from './catalogo-de-teste.js';

const nada = new Set<string>();

test("'mod-a' está liberado sem nada concluído", () => {
  assert.equal(moduloLiberado(catalogoDeTeste, 'mod-a', nada, nada), true);
});

test("'mod-b' libera só com as duas aulas de 'mod-a', que não tem exercício", () => {
  assert.equal(moduloLiberado(catalogoDeTeste, 'mod-b', nada, nada), false);
  assert.equal(moduloLiberado(catalogoDeTeste, 'mod-b', new Set(['aula-teste-1']), nada), false);
  assert.equal(moduloLiberado(catalogoDeTeste, 'mod-b', new Set(['aula-teste-1', 'aula-teste-2']), nada), true);
});

test("'mod-b' tem exercício: só fica completo com a aprovação", () => {
  assert.equal(moduloCompleto(catalogoDeTeste, 'mod-b', new Set(['aula-teste-3']), nada), false);
  assert.equal(moduloCompleto(catalogoDeTeste, 'mod-b', new Set(['aula-teste-3']), new Set(['mod-b'])), true);
});

test("'mod-c' fica bloqueado sem a aprovação de 'mod-b' e libera com ela", () => {
  const concluidas = new Set(['aula-teste-1', 'aula-teste-2', 'aula-teste-3']);

  assert.equal(moduloLiberado(catalogoDeTeste, 'mod-c', concluidas, nada), false);
  assert.equal(moduloLiberado(catalogoDeTeste, 'mod-c', concluidas, new Set(['mod-b'])), true);
});

test("'mod-d' não tem aulas e nunca fica completo, então o curso não é concluído", () => {
  const todas = new Set(catalogoDeTeste.lessons.map((aula) => aula.id));
  const aprovados = new Set(['mod-b']);

  assert.equal(moduloCompleto(catalogoDeTeste, 'mod-d', todas, aprovados), false);
  assert.equal(cursoConcluido(catalogoDeTeste, 'curso-teste', todas, aprovados), false);
  assert.equal(cursoConcluido(catalogoDeTeste, 'curso-outro', new Set(['aula-outro-1']), nada), true);
});

test('módulo inexistente fica bloqueado', () => {
  const todas = new Set(catalogoDeTeste.lessons.map((aula) => aula.id));

  assert.equal(moduloLiberado(catalogoDeTeste, 'mod-inexistente', todas, new Set(['mod-b'])), false);
});

test('aceita Map no lugar de Set', () => {
  const concluidas = new Map([['aula-teste-1', true], ['aula-teste-2', true]]);

  assert.equal(moduloLiberado(catalogoDeTeste, 'mod-b', concluidas, new Map()), true);
});
