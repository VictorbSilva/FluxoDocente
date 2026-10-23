import express from 'express';
import type pg from 'pg';
import type { Catalogo, NivelamentoDTO } from '../../shared/contracts.js';
import { moduloCompleto, modulosDispensaveis } from '../../shared/progressao.js';
import type { Gabaritos } from '../exercicios/gabarito.js';
import { responderRespostasInvalidas, respostasValidas } from '../exercicios/rotas.js';
import { lerEstadoDoProgresso, responderAcessoNegado, verificarAcessoAoModulo } from '../progresso/acesso.js';

// Montado depois de exigirLogin. O dono da resposta e das dispensas é sempre req.session.userId.
// Respostas e acertos são dado da pesquisa: ficam no banco e nunca são devolvidos;
// a API devolve só os módulos que o docente pode pular.
export function criarRotasDoNivelamento(pool: pg.Pool, catalogo: Catalogo, gabaritos: Gabaritos): express.Router {
  const router = express.Router();
  const perguntas = catalogo.nivelamento;
  const disponivel = perguntas.length > 0;
  const { nivelamento: gabarito } = gabaritos;

  async function lerNivelamento(userId: string): Promise<NivelamentoDTO> {
    const [resposta, dispensas] = await Promise.all([
      pool.query<{ respostas: number[] }>('SELECT respostas FROM placement_answers WHERE user_id = $1', [userId]),
      pool.query<{ module_id: string }>('SELECT module_id FROM module_skips WHERE user_id = $1', [userId]),
    ]);
    const respostas = resposta.rows[0]?.respostas;
    const dispensados = new Set(dispensas.rows.map((linha) => linha.module_id));

    // Sem resposta ou sem gabarito (questionário de perfil), nenhum módulo é dispensável.
    return {
      disponivel,
      respondido: respostas !== undefined,
      dispensaveis: respostas && gabarito ? modulosDispensaveis(catalogo, respostas, gabarito) : [],
      dispensados: catalogo.modules.filter((modulo) => dispensados.has(modulo.id)).map((modulo) => modulo.id),
    };
  }

  router.get('/nivelamento', async (req, res) => {
    res.status(200).json(await lerNivelamento(req.session.userId!));
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

    res.status(201).json(await lerNivelamento(req.session.userId!));
  });

  // Pular é opcional e não se desfaz. Vale para módulo dispensável, liberado, com aulas
  // e ainda não completo pelas aulas e pela avaliação; repetir a dispensa não muda nada.
  router.post('/dispensas/:moduleId', async (req, res) => {
    const { moduleId } = req.params;
    const userId = req.session.userId!;

    if (!catalogo.modules.some((modulo) => modulo.id === moduleId)) {
      res.status(404).json({
        error: { code: 'modulo_inexistente', message: 'Módulo não encontrado.' },
      });
      return;
    }

    const motivo = await verificarAcessoAoModulo(pool, catalogo, userId, moduleId, true);

    if (motivo) {
      responderAcessoNegado(res, motivo);
      return;
    }

    const [nivelamento, { concluidas, aprovados }] = await Promise.all([
      lerNivelamento(userId),
      lerEstadoDoProgresso(pool, userId),
    ]);
    const temAulas = catalogo.lessons.some((aula) => aula.moduleId === moduleId);

    if (
      !nivelamento.dispensaveis.includes(moduleId) ||
      !temAulas ||
      moduloCompleto(catalogo, moduleId, concluidas, aprovados)
    ) {
      res.status(403).json({
        error: { code: 'dispensa_indisponivel', message: 'Este módulo não pode ser dispensado.' },
      });
      return;
    }

    await pool.query(
      'INSERT INTO module_skips (user_id, module_id) VALUES ($1, $2) ON CONFLICT (user_id, module_id) DO NOTHING',
      [userId, moduleId],
    );

    res.status(200).json(await lerNivelamento(userId));
  });

  return router;
}
