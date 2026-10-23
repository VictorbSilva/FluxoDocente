import type pg from 'pg';
import type { Catalogo, Module, PerguntaDTO } from '../../shared/contracts.js';
import type { Gabaritos } from '../exercicios/gabarito.js';

function modulo(id: string): Module {
  return { id, title: `Módulo ${id}`, description: 'Módulo de teste.', color: 'from-gray-500 to-gray-700', tags: [] };
}

function perguntas(prefixo: string, quantidade: number): PerguntaDTO[] {
  return Array.from({ length: quantidade }, (_, indice) => {
    const numero = String(indice + 1).padStart(2, '0');
    return { id: `${prefixo}${numero}`, enunciado: `Pergunta ${prefixo}${numero}`, alternativas: ['A', 'B', 'C'] };
  });
}

// 'mod-a' sem exercício, 'mod-b' com exercício, 'mod-c' sem exercício e 'mod-d' sem aulas.
// No nivelamento, 'n01' a 'n05' avaliam 'mod-b' e 'n06' avalia 'mod-c'.
export const catalogoDeTeste: Catalogo = {
  courses: [
    { id: 'curso-teste', title: 'Curso de teste', description: 'Curso de teste.', moduleIds: ['mod-a', 'mod-b', 'mod-c', 'mod-d'] },
    { id: 'curso-outro', title: 'Outro curso', description: 'Outro curso de teste.', moduleIds: ['mod-x'] },
  ],
  modules: ['mod-a', 'mod-b', 'mod-c', 'mod-d', 'mod-x'].map(modulo),
  lessons: [
    { id: 'aula-teste-1', moduleId: 'mod-a', youtubeId: 'aaaaaaaaaa1', title: 'Aula de teste 1' },
    { id: 'aula-teste-2', moduleId: 'mod-a', youtubeId: 'aaaaaaaaaa2', title: 'Aula de teste 2' },
    { id: 'aula-teste-3', moduleId: 'mod-b', youtubeId: 'bbbbbbbbbb3', title: 'Aula de teste 3' },
    { id: 'aula-teste-4', moduleId: 'mod-c', youtubeId: 'cccccccccc4', title: 'Aula de teste 4' },
    { id: 'aula-outro-1', moduleId: 'mod-x', youtubeId: 'xxxxxxxxxx1', title: 'Aula do outro curso' },
  ],
  exercicios: [{ moduleId: 'mod-b', perguntas: perguntas('b', 10) }],
  nivelamento: perguntas('n', 6).map((pergunta, indice) => ({ ...pergunta, moduleId: indice < 5 ? 'mod-b' : 'mod-c' })),
};

// A alternativa certa de todas as perguntas, do exercício e do nivelamento, é a primeira.
export const gabaritoDeTeste: Gabaritos = {
  exercicios: { 'mod-b': Array(10).fill(0) },
  nivelamento: [0, 0, 0, 0, 0, 0],
};

export async function matricular(pool: pg.Pool, userId: string, courseId = 'curso-teste'): Promise<void> {
  await pool.query(
    'INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) ON CONFLICT (user_id, course_id) DO NOTHING',
    [userId, courseId],
  );
}
