import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalogo, courses, modules, lessons } from '../../shared/catalog.js';
import { formatarDuracao } from '../../shared/duracao.js';

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

test('IDs de curso são únicos', () => {
  assert.equal(new Set(courses.map((curso) => curso.id)).size, courses.length);
});

test('todo módulo citado por um curso existe', () => {
  const moduleIds = new Set(modules.map((modulo) => modulo.id));

  for (const curso of courses) {
    for (const moduleId of curso.moduleIds) {
      assert.ok(moduleIds.has(moduleId));
    }
  }
});

test('todo módulo pertence a exatamente um curso', () => {
  for (const modulo of modules) {
    const cursos = courses.filter((curso) => curso.moduleIds.includes(modulo.id));
    assert.equal(cursos.length, 1, modulo.id);
  }
});

test('durationSeconds das aulas, quando existe, é inteiro positivo', () => {
  for (const aula of lessons) {
    if (aula.durationSeconds !== undefined) {
      assert.ok(Number.isInteger(aula.durationSeconds) && aula.durationSeconds > 0, aula.id);
    }
  }
});

test('exerciseMinutes dos módulos, quando existe, é inteiro positivo', () => {
  for (const modulo of modules) {
    if (modulo.exerciseMinutes !== undefined) {
      assert.ok(Number.isInteger(modulo.exerciseMinutes) && modulo.exerciseMinutes > 0, modulo.id);
    }
  }
});

test('vídeo de encerramento do curso, quando existe, tem o formato de ID do YouTube', () => {
  for (const curso of courses) {
    if (curso.closingYoutubeId !== undefined) {
      assert.match(curso.closingYoutubeId, /^[A-Za-z0-9_-]{11}$/);
    }
  }
});

test('todo exercício aponta para um módulo existente', () => {
  const moduleIds = new Set(modules.map((modulo) => modulo.id));

  for (const exercicio of catalogo.exercicios) {
    assert.ok(moduleIds.has(exercicio.moduleId), exercicio.moduleId);
  }
});

test('cada módulo tem no máximo um exercício', () => {
  const moduleIds = catalogo.exercicios.map((exercicio) => exercicio.moduleId);
  assert.equal(new Set(moduleIds).size, moduleIds.length);
});

test('IDs de pergunta são únicos em cada exercício e no nivelamento', () => {
  const grupos = [...catalogo.exercicios.map((exercicio) => exercicio.perguntas), catalogo.nivelamento];

  for (const perguntas of grupos) {
    assert.equal(new Set(perguntas.map((pergunta) => pergunta.id)).size, perguntas.length);
  }
});

test('toda pergunta tem enunciado e ao menos 2 alternativas, nenhum deles vazio', () => {
  const perguntas = [...catalogo.exercicios.flatMap((exercicio) => exercicio.perguntas), ...catalogo.nivelamento];

  for (const pergunta of perguntas) {
    assert.ok(pergunta.enunciado.trim().length > 0, pergunta.id);
    assert.ok(pergunta.alternativas.length >= 2, pergunta.id);

    for (const alternativa of pergunta.alternativas) {
      assert.ok(alternativa.trim().length > 0, pergunta.id);
    }
  }
});

test('formatarDuracao arredonda para minutos e separa horas', () => {
  assert.equal(formatarDuracao(0), null);
  assert.equal(formatarDuracao(59), '1 min');
  assert.equal(formatarDuracao(3600), '1 h');
  assert.equal(formatarDuracao(5400), '1 h 30 min');
});
