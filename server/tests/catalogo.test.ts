import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalogo, courses, modules, lessons } from '../../shared/catalog.js';
import type { PerguntaDTO } from '../../shared/contracts.js';
import { formatarDuracao } from '../../shared/duracao.js';
import { gabaritoDosExercicios } from '../exercicios/gabarito.js';
import { gabaritoDoNivelamento } from '../nivelamento/gabarito.js';

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

test('o módulo avaliado por uma pergunta do nivelamento existe, quando informado', () => {
  const moduleIds = new Set(modules.map((modulo) => modulo.id));

  for (const pergunta of catalogo.nivelamento) {
    if (pergunta.moduleId !== undefined) {
      assert.ok(moduleIds.has(pergunta.moduleId), pergunta.id);
    }
  }
});

test('as perguntas do nivelamento têm moduleId em todas ou em nenhuma', () => {
  const comModulo = catalogo.nivelamento.filter((pergunta) => pergunta.moduleId !== undefined);
  assert.ok(comModulo.length === 0 || comModulo.length === catalogo.nivelamento.length);
});

test('o questionário diagnóstico tem 20 perguntas com quatro alternativas, cinco por módulo', () => {
  assert.equal(catalogo.nivelamento.length, 20);

  for (const pergunta of catalogo.nivelamento) {
    assert.equal(pergunta.alternativas.length, 4, pergunta.id);
  }

  for (const modulo of modules) {
    assert.equal(catalogo.nivelamento.filter((pergunta) => pergunta.moduleId === modulo.id).length, 5, modulo.id);
  }
});

function indiceValido(indice: number, pergunta: PerguntaDTO): boolean {
  return Number.isInteger(indice) && indice >= 0 && indice < pergunta.alternativas.length;
}

test('todo exercício tem gabarito com um índice válido por pergunta', () => {
  for (const exercicio of catalogo.exercicios) {
    const gabarito = gabaritoDosExercicios[exercicio.moduleId];
    assert.ok(gabarito, exercicio.moduleId);
    assert.equal(gabarito.length, exercicio.perguntas.length, exercicio.moduleId);

    exercicio.perguntas.forEach((pergunta, indice) => {
      assert.ok(indiceValido(gabarito[indice], pergunta), pergunta.id);
    });
  }
});

test('todo gabarito de exercício aponta para um exercício existente', () => {
  const comExercicio = new Set(catalogo.exercicios.map((exercicio) => exercicio.moduleId));

  for (const moduleId of Object.keys(gabaritoDosExercicios)) {
    assert.ok(comExercicio.has(moduleId), moduleId);
  }
});

test('o gabarito do nivelamento é null ou tem um índice válido por pergunta', () => {
  const gabarito = gabaritoDoNivelamento;

  if (gabarito === null) {
    return;
  }

  assert.equal(gabarito.length, catalogo.nivelamento.length);
  catalogo.nivelamento.forEach((pergunta, indice) => {
    assert.ok(indiceValido(gabarito[indice], pergunta), pergunta.id);
  });
});

test('nenhum arquivo de src/ importa algo de server/', () => {
  const raiz = fileURLToPath(new URL('../../src/', import.meta.url));
  const arquivos = readdirSync(raiz, { recursive: true, encoding: 'utf8' })
    .filter((arquivo) => /\.tsx?$/.test(arquivo));

  assert.ok(arquivos.length > 0);

  for (const arquivo of arquivos) {
    const conteudo = readFileSync(path.join(raiz, arquivo), 'utf8');
    assert.doesNotMatch(conteudo, /from\s+['"][^'"]*\bserver\//, arquivo);
  }
});

test('formatarDuracao arredonda para minutos e separa horas', () => {
  assert.equal(formatarDuracao(0), null);
  assert.equal(formatarDuracao(59), '1 min');
  assert.equal(formatarDuracao(3600), '1 h');
  assert.equal(formatarDuracao(5400), '1 h 30 min');
});
