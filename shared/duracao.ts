import { catalogo } from './catalog.js';
import type { Catalogo } from './contracts.js';

// Sem fonte, as somas usam o catálogo real; a API passa o catálogo recebido em createApp.
type Fonte = Pick<Catalogo, 'courses' | 'modules' | 'lessons'>;

// Aulas sem durationSeconds e módulos sem exerciseMinutes contam zero.
export function duracaoDoModuloEmSegundos(moduleId: string, fonte: Fonte = catalogo): number {
  const modulo = fonte.modules.find((m) => m.id === moduleId);
  const exercicios = (modulo?.exerciseMinutes ?? 0) * 60;
  const aulas = fonte.lessons
    .filter((l) => l.moduleId === moduleId)
    .reduce((total, l) => total + (l.durationSeconds ?? 0), 0);

  return aulas + exercicios;
}

export function duracaoDoCursoEmSegundos(courseId: string, fonte: Fonte = catalogo): number {
  const curso = fonte.courses.find((c) => c.id === courseId);

  return (curso?.moduleIds ?? []).reduce((total, id) => total + duracaoDoModuloEmSegundos(id, fonte), 0);
}

// Carga horária do certificado: a declarada no curso; sem ela, a duração em horas inteiras arredondadas, no mínimo 1.
export function cargaHorariaEmHoras(courseId: string, fonte: Fonte = catalogo): number {
  const curso = fonte.courses.find((c) => c.id === courseId);

  if (curso?.cargaHorariaHoras !== undefined) {
    return curso.cargaHorariaHoras;
  }

  return Math.max(1, Math.round(duracaoDoCursoEmSegundos(courseId, fonte) / 3600));
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
