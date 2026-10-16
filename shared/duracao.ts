import { courses, lessons, modules } from './catalog.js';

// Aulas sem durationSeconds e módulos sem exerciseMinutes contam zero.
export function duracaoDoModuloEmSegundos(moduleId: string): number {
  const modulo = modules.find((m) => m.id === moduleId);
  const exercicios = (modulo?.exerciseMinutes ?? 0) * 60;
  const aulas = lessons
    .filter((l) => l.moduleId === moduleId)
    .reduce((total, l) => total + (l.durationSeconds ?? 0), 0);

  return aulas + exercicios;
}

// O vídeo de encerramento do curso não é aula e não entra na soma.
export function duracaoDoCursoEmSegundos(courseId: string): number {
  const curso = courses.find((c) => c.id === courseId);

  return (curso?.moduleIds ?? []).reduce((total, id) => total + duracaoDoModuloEmSegundos(id), 0);
}

export function formatarDuracao(segundos: number): string | null {
  if (segundos <= 0) {
    return null;
  }

  const minutos = Math.max(1, Math.round(segundos / 60));
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;

  if (horas === 0) {
    return `${minutos} min`;
  }

  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}
