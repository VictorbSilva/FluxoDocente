import express from 'express';
import type pg from 'pg';
import type { Catalogo, CorrecaoDTO, PerguntaDTO, ResultadoExercicioDTO } from '../../shared/contracts.js';
import { responderAcessoNegado, verificarAcessoAoModulo } from '../progresso/acesso.js';
import type { Gabaritos } from './gabarito.js';

interface LinhaDeResultado {
  module_id: string;
  melhor_acertos: number;
  total: number;
  aprovado_em: Date | null;
}

// Um índice inteiro por pergunta, entre 0 e o número de alternativas menos 1.
export function respostasValidas(respostas: unknown, perguntas: PerguntaDTO[]): respostas is number[] {
  return (
    Array.isArray(respostas) &&
    respostas.length === perguntas.length &&
    respostas.every(
      (resposta, indice) =>
        Number.isInteger(resposta) && resposta >= 0 && resposta < perguntas[indice].alternativas.length,
    )
  );
}

export function responderRespostasInvalidas(res: express.Response): void {
  res.status(400).json({
    error: { code: 'respostas_invalidas', message: 'Responda todas as perguntas.' },
  });
}

// Aprovação com 70% dos acertos, em conta inteira.
function aprovado(acertos: number, total: number): boolean {
  return acertos * 10 >= total * 7;
}

function paraDTO(linha: LinhaDeResultado): ResultadoExercicioDTO {
  return {
    moduleId: linha.module_id,
    melhorAcertos: linha.melhor_acertos,
    total: linha.total,
    aprovado: linha.aprovado_em !== null,
    aprovadoEm: linha.aprovado_em?.toISOString() ?? null,
  };
}

// Montado depois de exigirLogin. O dono do resultado é sempre req.session.userId:
// nenhum userId do corpo, da query ou do caminho é lido. A API diz quais perguntas
// o docente acertou, nunca qual era a alternativa certa.
export function criarRotasDeExercicios(pool: pg.Pool, catalogo: Catalogo, gabaritos: Gabaritos): express.Router {
  const router = express.Router();
  const exercicios = new Map(catalogo.exercicios.map((exercicio) => [exercicio.moduleId, exercicio]));

  router.get('/exercicios', async (req, res) => {
    const { rows } = await pool.query<LinhaDeResultado>(
      'SELECT module_id, melhor_acertos, total, aprovado_em FROM exercise_results WHERE user_id = $1 ORDER BY module_id',
      [req.session.userId],
    );

    const resultados = rows.filter((linha) => exercicios.has(linha.module_id)).map(paraDTO);
    res.status(200).json({ resultados });
  });

  // Pode ser refeito sem limite: vale a melhor nota, e a aprovação não se perde.
  // As respostas da tentativa não são guardadas.
  router.post('/exercicios/:moduleId', async (req, res) => {
    const { moduleId } = req.params;
    const exercicio = exercicios.get(moduleId);
    const gabarito = gabaritos.exercicios[moduleId];

    if (!exercicio || !gabarito) {
      res.status(404).json({
        error: { code: 'exercicio_inexistente', message: 'Avaliação não encontrada.' },
      });
      return;
    }

    const motivo = await verificarAcessoAoModulo(pool, catalogo, req.session.userId!, moduleId, true);

    if (motivo) {
      responderAcessoNegado(res, motivo);
      return;
    }

    const respostas: unknown = req.body?.respostas;

    if (!respostasValidas(respostas, exercicio.perguntas)) {
      responderRespostasInvalidas(res);
      return;
    }

    const corretas = respostas.map((resposta, indice) => resposta === gabarito[indice]);
    const acertos = corretas.filter(Boolean).length;
    const total = exercicio.perguntas.length;
    const aprovadoNestaTentativa = aprovado(acertos, total);

    const { rows } = await pool.query<Omit<LinhaDeResultado, 'module_id'>>(
      `INSERT INTO exercise_results (user_id, module_id, melhor_acertos, total, aprovado_em)
       VALUES ($1, $2, $3, $4, CASE WHEN $5::boolean THEN now() END)
       ON CONFLICT (user_id, module_id) DO UPDATE SET
         melhor_acertos = GREATEST(exercise_results.melhor_acertos, EXCLUDED.melhor_acertos),
         total = EXCLUDED.total,
         aprovado_em = COALESCE(exercise_results.aprovado_em, EXCLUDED.aprovado_em),
         atualizado_em = now()
       RETURNING melhor_acertos, total, aprovado_em`,
      [req.session.userId, moduleId, acertos, total, aprovadoNestaTentativa],
    );

    const correcao: CorrecaoDTO = {
      moduleId,
      acertos,
      total,
      corretas,
      aprovadoNestaTentativa,
      resultado: paraDTO({ module_id: moduleId, ...rows[0] }),
    };
    res.status(200).json(correcao);
  });

  return router;
}
