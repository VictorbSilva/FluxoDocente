import { lessonIds } from '../../../shared/catalog';

export type Secao = 'home' | 'meus-cursos' | 'mais-cursos' | 'certificados' | 'sobre' | 'entrar';

export const SECOES_PRIVADAS: ReadonlySet<string> = new Set([
  'meus-cursos',
  'mais-cursos',
  'certificados',
]);

export interface Rota {
  section: Secao;
  lessonId: string | null;
}

const PREFIXO_AULA = '/aula/';

// Caminho desconhecido ou aula fora do catálogo cai no início. O endereço da
// aula não guarda a seção de origem, então ela também abre com a seção inicial.
export function lerRota(pathname: string): Rota {
  if (pathname === '/entrar') return { section: 'entrar', lessonId: null };
  if (pathname === '/meus-cursos' || pathname === '/cursos') {
    return { section: 'meus-cursos', lessonId: null };
  }
  if (pathname === '/mais-cursos' || pathname === '/nossos-cursos') return { section: 'mais-cursos', lessonId: null };
  if (pathname === '/certificados') return { section: 'certificados', lessonId: null };
  if (pathname === '/sobre') return { section: 'sobre', lessonId: null };
  if (pathname === '/progresso') return { section: 'home', lessonId: null };

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
  if (section === 'entrar') return '/entrar';
  if (section === 'meus-cursos') return '/meus-cursos';
  if (section === 'mais-cursos') return '/mais-cursos';
  if (section === 'certificados') return '/certificados';
  if (section === 'sobre') return '/sobre';
  return '/';
}
