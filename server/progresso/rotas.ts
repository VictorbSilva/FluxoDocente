import express from 'express';
import type pg from 'pg';
import type { Catalogo, CompletionDTO, Lesson, ProgressDTO } from '../../shared/contracts.js';
import { responderAcessoNegado, verificarAcessoAoModulo } from './acesso.js';

// Montado depois de exigirLogin. O dono do progresso é sempre req.session.userId:
// nenhum userId do corpo, da query ou do caminho é lido.
export function criarRotasDeProgresso(
  pool: pg.Pool,
  catalogo: Catalogo,
  aulas: ReadonlyMap<string, Lesson>,
): express.Router {
  const router = express.Router();

  router.get('/progress', async (req, res) => {
    const { rows } = await pool.query<{ lesson_id: string; completed_at: Date }>(
      'SELECT lesson_id, completed_at FROM lesson_completions WHERE user_id = $1 ORDER BY completed_at',
      [req.session.userId],
    );

    // Linhas de aulas que saíram do catálogo continuam no banco, mas não são devolvidas.
    const progresso: ProgressDTO = {
      completions: rows
        .filter((linha) => aulas.has(linha.lesson_id))
        .map((linha) => ({ lessonId: linha.lesson_id, completedAt: linha.completed_at.toISOString() })),
    };
    res.status(200).json(progresso);
  });

  // Idempotente: repetir a conclusão mantém a primeira data, e o corpo é ignorado.
  router.put('/progress/:lessonId', async (req, res) => {
    const { lessonId } = req.params;
    const aula = aulas.get(lessonId);

    if (!aula) {
      res.status(404).json({
        error: { code: 'aula_inexistente', message: 'Aula não encontrada.' },
      });
      return;
    }

    const motivo = await verificarAcessoAoModulo(pool, catalogo, req.session.userId!, aula.moduleId, true);

    if (motivo) {
      responderAcessoNegado(res, motivo);
      return;
    }

    await pool.query(
      'INSERT INTO lesson_completions (user_id, lesson_id) VALUES ($1, $2) ON CONFLICT (user_id, lesson_id) DO NOTHING',
      [req.session.userId, lessonId],
    );
    const { rows } = await pool.query<{ completed_at: Date }>(
      'SELECT completed_at FROM lesson_completions WHERE user_id = $1 AND lesson_id = $2',
      [req.session.userId, lessonId],
    );

    const conclusao: CompletionDTO = { lessonId, completedAt: rows[0].completed_at.toISOString() };
    res.status(200).json(conclusao);
  });

  return router;
}
