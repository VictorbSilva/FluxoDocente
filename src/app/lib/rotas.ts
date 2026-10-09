import { lessonIds } from '../../../shared/catalog';

export type Secao = 'home' | 'courses' | 'progress';

export interface Rota {
  section: Secao;
  lessonId: string | null;
}

const PREFIXO_AULA = '/aula/';

// Caminho desconhecido ou aula fora do catálogo cai no início. O endereço da
// aula não guarda a seção de origem, então ela também abre com a seção inicial.
export function lerRota(pathname: string): Rota {
  if (pathname === '/cursos') return { section: 'courses', lessonId: null };
  if (pathname === '/progresso') return { section: 'progress', lessonId: null };

  if (pathname.startsWith(PREFIXO_AULA)) {
    let id = '';
    try {
      id = decodeURIComponent(pathname.slice(PREFIXO_AULA.length));
    } catch {
      id = '';
    }
    if (lessonIds.has(id)) return { section: 'home', lessonId: id };
  }

  return { section: 'home', lessonId: null };
}

export function caminhoDe(section: string, lessonId: string | null): string {
  if (lessonId) return PREFIXO_AULA + encodeURIComponent(lessonId);
  if (section === 'courses') return '/cursos';
  if (section === 'progress') return '/progresso';
  return '/';
}
