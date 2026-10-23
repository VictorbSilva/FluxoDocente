import type express from 'express';
import type pg from 'pg';
import type { Catalogo } from '../../shared/contracts.js';
import { cursoDoModulo, moduloLiberado } from '../../shared/progressao.js';

export type AcessoNegado = 'matricula_necessaria' | 'modulo_bloqueado';

const MENSAGENS: Record<AcessoNegado, string> = {
  matricula_necessaria: 'Faça a matrícula no curso para continuar.',
  modulo_bloqueado: 'Conclua o módulo anterior para liberar este.',
};

// O userId vem sempre de req.session.userId, nas rotas que chamam esta função.
export async function verificarAcessoAoModulo(
  pool: pg.Pool,
  catalogo: Catalogo,
  userId: string,
  moduleId: string,
  exigirLiberado: boolean,
): Promise<AcessoNegado | null> {
  const curso = cursoDoModulo(catalogo, moduleId);

  if (!curso) {
    return 'modulo_bloqueado';
  }

  const matricula = await pool.query(
    'SELECT 1 FROM enrollments WHERE user_id = $1 AND course_id = $2',
    [userId, curso.id],
  );

  if (matricula.rowCount === 0) {
    return 'matricula_necessaria';
  }

  if (!exigirLiberado) {
    return null;
  }

  const [conclusoes, resultados] = await Promise.all([
    pool.query<{ lesson_id: string }>('SELECT lesson_id FROM lesson_completions WHERE user_id = $1', [userId]),
    pool.query<{ module_id: string }>(
      'SELECT module_id FROM exercise_results WHERE user_id = $1 AND aprovado_em IS NOT NULL',
      [userId],
    ),
  ]);
  const concluidas = new Set(conclusoes.rows.map((linha) => linha.lesson_id));
  const aprovados = new Set(resultados.rows.map((linha) => linha.module_id));

  return moduloLiberado(catalogo, moduleId, concluidas, aprovados) ? null : 'modulo_bloqueado';
}

export function responderAcessoNegado(res: express.Response, motivo: AcessoNegado): void {
  res.status(403).json({ error: { code: motivo, message: MENSAGENS[motivo] } });
}
