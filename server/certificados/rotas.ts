import { randomInt } from 'node:crypto';
import express from 'express';
import type pg from 'pg';
import type { Catalogo, CertificadoDTO } from '../../shared/contracts.js';
import { cargaHorariaEmHoras } from '../../shared/duracao.js';
import { cursoConcluido } from '../../shared/progressao.js';
import { lerEstadoDoProgresso, responderAcessoNegado } from '../progresso/acesso.js';

// Sem caracteres ambíguos: faltam 0, 1, I e O.
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const TAMANHO_DO_CODIGO = 10;
const TENTATIVAS = 3;

interface LinhaDoCertificado {
  codigo: string;
  carga_horaria: number;
  emitido_em: Date;
}

function sortearCodigo(): string {
  return Array.from({ length: TAMANHO_DO_CODIGO }, () => ALFABETO[randomInt(ALFABETO.length)]).join('');
}

function codigoRepetido(erro: unknown): boolean {
  const erroDoBanco = erro as pg.DatabaseError;
  return erroDoBanco.code === '23505' && erroDoBanco.constraint === 'certificates_codigo_key';
}

// Montado depois de exigirLogin. O dono do certificado é sempre req.session.userId.
// O código só identifica a emissão: não há página pública de verificação.
export function criarRotasDeCertificados(pool: pg.Pool, catalogo: Catalogo): express.Router {
  const router = express.Router();

  async function lerCertificado(userId: string, courseId: string): Promise<LinhaDoCertificado | undefined> {
    const { rows } = await pool.query<LinhaDoCertificado>(
      'SELECT codigo, carga_horaria, emitido_em FROM certificates WHERE user_id = $1 AND course_id = $2',
      [userId, courseId],
    );
    return rows[0];
  }

  // Devolve a linha gravada, ou undefined se outro pedido gravou antes.
  async function gravarCertificado(userId: string, courseId: string): Promise<LinhaDoCertificado | undefined> {
    for (let tentativa = 1; ; tentativa++) {
      try {
        const { rows } = await pool.query<LinhaDoCertificado>(
          `INSERT INTO certificates (user_id, course_id, codigo, carga_horaria) VALUES ($1, $2, $3, $4)
           ON CONFLICT (user_id, course_id) DO NOTHING
           RETURNING codigo, carga_horaria, emitido_em`,
          [userId, courseId, sortearCodigo(), cargaHorariaEmHoras(courseId, catalogo)],
        );
        return rows[0];
      } catch (erro) {
        if (tentativa >= TENTATIVAS || !codigoRepetido(erro)) {
          throw erro;
        }
      }
    }
  }

  // Carga horária e data ficam como na primeira emissão; o nome é o da conta na hora do pedido.
  router.post('/certificados/:courseId', async (req, res) => {
    const { courseId } = req.params;
    const userId = req.session.userId!;

    if (!catalogo.courses.some((curso) => curso.id === courseId)) {
      res.status(404).json({
        error: { code: 'curso_inexistente', message: 'Curso não encontrado.' },
      });
      return;
    }

    const matricula = await pool.query(
      'SELECT 1 FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [userId, courseId],
    );

    if (matricula.rowCount === 0) {
      responderAcessoNegado(res, 'matricula_necessaria');
      return;
    }

    const { concluidas, aprovados, dispensados } = await lerEstadoDoProgresso(pool, userId);

    if (!cursoConcluido(catalogo, courseId, concluidas, aprovados, dispensados)) {
      res.status(403).json({
        error: { code: 'curso_incompleto', message: 'Conclua o curso para emitir o certificado.' },
      });
      return;
    }

    const { rows } = await pool.query<{ nome: string | null }>('SELECT nome FROM users WHERE id = $1', [userId]);
    const nome = rows[0]?.nome;

    if (!nome) {
      res.status(409).json({
        error: { code: 'nome_obrigatorio', message: 'Cadastre seu nome no Painel para emitir o certificado.' },
      });
      return;
    }

    const gravado = await lerCertificado(userId, courseId);
    const novo = gravado ? undefined : await gravarCertificado(userId, courseId);
    // Sem linha gravada nem nova, um pedido simultâneo emitiu antes.
    const linha = gravado ?? novo ?? (await lerCertificado(userId, courseId))!;

    const certificado: CertificadoDTO = {
      courseId,
      nome,
      cargaHorariaHoras: linha.carga_horaria,
      emitidoEm: linha.emitido_em.toISOString(),
      codigo: linha.codigo,
    };
    res.status(novo ? 201 : 200).json(certificado);
  });

  return router;
}
