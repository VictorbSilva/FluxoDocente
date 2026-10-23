import type express from 'express';
import type pg from 'pg';
import type { Catalogo } from '../../shared/contracts.js';
import { cursoDoModulo, moduloLiberado } from '../../shared/progressao.js';

export type AcessoNegado = 'matricula_necessaria' | 'modulo_bloqueado';

const MENSAGENS: Record<AcessoNegado, string> = {
  matricula_necessaria: 'Faça a matrícula no curso para continuar.',
  modulo_bloqueado: 'Conclua o módulo anterior para liberar este.',
};

export interface EstadoDoProgresso {
  concluidas: Set<string>;
  aprovados: Set<string>;
  dispensados: Set<string>;
}

// O userId vem sempre de req.session.userId, nas rotas que chamam estas funções.
export async function lerEstadoDoProgresso(pool: pg.Pool, userId: string): Promise<EstadoDoProgresso> {
  const [conclusoes, resultados, dispensas] = await Promise.all([
    pool.query<{ lesson_id: string }>('SELECT lesson_id FROM lesson_completions WHERE user_id = $1', [userId]),
    pool.query<{ module_id: string }>(
      'SELECT module_id FROM exercise_results WHERE user_id = $1 AND aprovado_em IS NOT NULL',
      [userId],
    ),
    pool.query<{ module_id: string }>('SELECT module_id FROM module_skips WHERE user_id = $1', [userId]),
  ]);

  return {
    concluidas: new Set(conclusoes.rows.map((linha) => linha.lesson_id)),
    aprovados: new Set(resultados.rows.map((linha) => linha.module_id)),
    dispensados: new Set(dispensas.rows.map((linha) => linha.module_id)),
  };
}

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

  const { concluidas, aprovados, dispensados } = await lerEstadoDoProgresso(pool, userId);

  return moduloLiberado(catalogo, moduleId, concluidas, aprovados, dispensados) ? null : 'modulo_bloqueado';
}

export function responderAcessoNegado(res: express.Response, motivo: AcessoNegado): void {
  res.status(403).json({ error: { code: motivo, message: MENSAGENS[motivo] } });
}
