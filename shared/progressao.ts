import type { Catalogo, Course } from './contracts.js';

// Aceita Set e Map: só a consulta por chave é usada.
type Conjunto = { has(chave: string): boolean };

export function cursoDoModulo(catalogo: Catalogo, moduleId: string): Course | undefined {
  return catalogo.courses.find((curso) => curso.moduleIds.includes(moduleId));
}

// Módulo sem aulas nunca fica completo. Exercício sem perguntas não conta.
export function moduloCompleto(
  catalogo: Catalogo,
  moduleId: string,
  concluidas: Conjunto,
  aprovados: Conjunto,
): boolean {
  const aulas = catalogo.lessons.filter((aula) => aula.moduleId === moduleId);

  if (aulas.length === 0 || !aulas.every((aula) => concluidas.has(aula.id))) {
    return false;
  }

  const temExercicio = catalogo.exercicios.some(
    (exercicio) => exercicio.moduleId === moduleId && exercicio.perguntas.length > 0,
  );
  return !temExercicio || aprovados.has(moduleId);
}

// O primeiro módulo do curso está sempre liberado; os seguintes, quando o anterior está completo.
export function moduloLiberado(
  catalogo: Catalogo,
  moduleId: string,
  concluidas: Conjunto,
  aprovados: Conjunto,
): boolean {
  const curso = cursoDoModulo(catalogo, moduleId);

  if (!curso) {
    return false;
  }

  const posicao = curso.moduleIds.indexOf(moduleId);

  if (posicao === 0) {
    return true;
  }

  return moduloCompleto(catalogo, curso.moduleIds[posicao - 1], concluidas, aprovados);
}

export function cursoConcluido(
  catalogo: Catalogo,
  courseId: string,
  concluidas: Conjunto,
  aprovados: Conjunto,
): boolean {
  const curso = catalogo.courses.find((c) => c.id === courseId);

  if (!curso) {
    return false;
  }

  return curso.moduleIds.every((moduleId) => moduloCompleto(catalogo, moduleId, concluidas, aprovados));
}
