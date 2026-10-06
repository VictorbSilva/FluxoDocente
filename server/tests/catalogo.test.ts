import { test } from 'node:test';
import assert from 'node:assert/strict';
import { modules, lessons } from '../../shared/catalog.js';

test('IDs de módulo são únicos', () => {
  assert.equal(new Set(modules.map((modulo) => modulo.id)).size, modules.length);
});

test('IDs de aula são únicos', () => {
  assert.equal(new Set(lessons.map((aula) => aula.id)).size, lessons.length);
});

test('toda aula pertence a um módulo existente', () => {
  const moduleIds = new Set(modules.map((modulo) => modulo.id));

  for (const aula of lessons) {
    assert.ok(moduleIds.has(aula.moduleId));
  }
});

test('IDs de aula são slugs de até 64 caracteres', () => {
  for (const aula of lessons) {
    assert.match(aula.id, /^[a-z0-9-]{1,64}$/);
  }
});

test('IDs de vídeo do YouTube têm o formato esperado', () => {
  for (const aula of lessons) {
    assert.match(aula.youtubeId, /^[A-Za-z0-9_-]{11}$/);
  }
});

test('títulos dos módulos não são vazios', () => {
  for (const modulo of modules) {
    assert.ok(modulo.title.trim().length > 0);
  }
});

test('títulos das aulas não são vazios', () => {
  for (const aula of lessons) {
    assert.ok(aula.title.trim().length > 0);
  }
});
