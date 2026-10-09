import express from 'express';
import type pg from 'pg';
import type { NoteDTO } from '../../shared/contracts.js';

const LIMITE_DE_CARACTERES = 5000;

// Montado depois de exigirLogin. O dono da anotação é sempre req.session.userId:
// nenhum userId do corpo, da query ou do caminho é lido.
export function criarRotasDeAnotacoes(pool: pg.Pool, lessonIds: ReadonlySet<string>): express.Router {
  const router = express.Router();

  router.get('/notes/:lessonId', async (req, res) => {
    const { lessonId } = req.params;

    if (!lessonIds.has(lessonId)) {
      res.status(404).json({
        error: { code: 'aula_inexistente', message: 'Aula não encontrada.' },
      });
      return;
    }

    const { rows } = await pool.query<{ content: string; updated_at: Date }>(
      'SELECT content, updated_at FROM lesson_notes WHERE user_id = $1 AND lesson_id = $2',
      [req.session.userId, lessonId],
    );

    const anotacao: NoteDTO = rows.length === 0
      ? { lessonId, content: '', updatedAt: null }
      : { lessonId, content: rows[0].content, updatedAt: rows[0].updated_at.toISOString() };
    res.status(200).json(anotacao);
  });

  // Conteúdo vazio ou só com espaços apaga a anotação. O texto é gravado como veio.
  router.put('/notes/:lessonId', async (req, res) => {
    const { lessonId } = req.params;

    if (!lessonIds.has(lessonId)) {
      res.status(404).json({
        error: { code: 'aula_inexistente', message: 'Aula não encontrada.' },
      });
      return;
    }

    const content: unknown = req.body?.content;

    if (typeof content !== 'string') {
      res.status(400).json({
        error: { code: 'dados_invalidos', message: 'Requisição inválida.' },
      });
      return;
    }

    // Conta caracteres, não unidades UTF-16: um emoji vale um.
    if ([...content].length > LIMITE_DE_CARACTERES) {
      res.status(400).json({
        error: { code: 'anotacao_grande', message: 'A anotação pode ter até 5.000 caracteres.' },
      });
      return;
    }

    if (content.trim() === '') {
      await pool.query(
        'DELETE FROM lesson_notes WHERE user_id = $1 AND lesson_id = $2',
        [req.session.userId, lessonId],
      );
      const vazia: NoteDTO = { lessonId, content: '', updatedAt: null };
      res.status(200).json(vazia);
      return;
    }

    const { rows } = await pool.query<{ updated_at: Date }>(
      `INSERT INTO lesson_notes (user_id, lesson_id, content) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, lesson_id) DO UPDATE SET content = EXCLUDED.content, updated_at = now()
       RETURNING updated_at`,
      [req.session.userId, lessonId, content],
    );

    const anotacao: NoteDTO = { lessonId, content, updatedAt: rows[0].updated_at.toISOString() };
    res.status(200).json(anotacao);
  });

  return router;
}
