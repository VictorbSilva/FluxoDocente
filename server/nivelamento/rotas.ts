import express from 'express';
import type pg from 'pg';
import type { Catalogo, NivelamentoDTO } from '../../shared/contracts.js';
import type { Gabaritos } from '../exercicios/gabarito.js';
import { responderRespostasInvalidas, respostasValidas } from '../exercicios/rotas.js';

// Montado depois de exigirLogin. O dono da resposta é sempre req.session.userId.
// Respostas e acertos são dado da pesquisa: ficam no banco e nunca são devolvidos.
export function criarRotasDoNivelamento(pool: pg.Pool, catalogo: Catalogo, gabaritos: Gabaritos): express.Router {
  const router = express.Router();
  const perguntas = catalogo.nivelamento;
  const disponivel = perguntas.length > 0;

  router.get('/nivelamento', async (req, res) => {
    const { rowCount } = await pool.query('SELECT 1 FROM placement_answers WHERE user_id = $1', [req.session.userId]);

    const nivelamento: NivelamentoDTO = { disponivel, respondido: rowCount !== 0 };
    res.status(200).json(nivelamento);
  });

  // Respondido uma vez, sem exigir matrícula.
  router.post('/nivelamento', async (req, res) => {
    if (!disponivel) {
      res.status(404).json({
        error: { code: 'nivelamento_indisponivel', message: 'Nivelamento indisponível.' },
      });
      return;
    }

    const respostas: unknown = req.body?.respostas;

    if (!respostasValidas(respostas, perguntas)) {
      responderRespostasInvalidas(res);
      return;
    }

    // Sem gabarito (questionário de perfil), acertos fica nulo.
    const { nivelamento: gabarito } = gabaritos;
    const acertos = gabarito ? respostas.filter((resposta, indice) => resposta === gabarito[indice]).length : null;

    // O pg converteria um array em array do Postgres; a coluna é jsonb.
    const { rowCount } = await pool.query(
      `INSERT INTO placement_answers (user_id, respostas, acertos, total) VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO NOTHING RETURNING user_id`,
      [req.session.userId, JSON.stringify(respostas), acertos, perguntas.length],
    );

    if (rowCount === 0) {
      res.status(409).json({
        error: { code: 'nivelamento_respondido', message: 'Você já respondeu ao nivelamento.' },
      });
      return;
    }

    const nivelamento: NivelamentoDTO = { disponivel: true, respondido: true };
    res.status(201).json(nivelamento);
  });

  return router;
}
