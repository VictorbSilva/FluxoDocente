import express from 'express';
import type pg from 'pg';
import type { Catalogo, MatriculaDTO, UserDTO } from '../../shared/contracts.js';

const LIMITE_DO_NOME = 120;

// Montado depois de exigirLogin. O dono da matrícula e do perfil é sempre
// req.session.userId: nenhum userId do corpo, da query ou do caminho é lido.
export function criarRotasDeCursos(pool: pg.Pool, catalogo: Catalogo): express.Router {
  const router = express.Router();

  router.get('/matriculas', async (req, res) => {
    const { rows } = await pool.query<{ course_id: string; enrolled_at: Date }>(
      'SELECT course_id, enrolled_at FROM enrollments WHERE user_id = $1 ORDER BY enrolled_at',
      [req.session.userId],
    );

    const matriculas: MatriculaDTO[] = rows.map((linha) => ({
      courseId: linha.course_id,
      enrolledAt: linha.enrolled_at.toISOString(),
    }));
    res.status(200).json({ matriculas });
  });

  // Idempotente: repetir a matrícula mantém a primeira data, e o corpo é ignorado.
  router.post('/matriculas/:courseId', async (req, res) => {
    const { courseId } = req.params;

    if (!catalogo.courses.some((curso) => curso.id === courseId)) {
      res.status(404).json({
        error: { code: 'curso_inexistente', message: 'Curso não encontrado.' },
      });
      return;
    }

    await pool.query(
      'INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) ON CONFLICT (user_id, course_id) DO NOTHING',
      [req.session.userId, courseId],
    );
    const { rows } = await pool.query<{ enrolled_at: Date }>(
      'SELECT enrolled_at FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [req.session.userId, courseId],
    );

    const matricula: MatriculaDTO = { courseId, enrolledAt: rows[0].enrolled_at.toISOString() };
    res.status(200).json(matricula);
  });

  router.put('/perfil', async (req, res) => {
    const nome: unknown = req.body?.nome;
    const nomeLimpo = typeof nome === 'string' ? nome.trim() : '';

    // Conta caracteres, não unidades UTF-16, como nas anotações.
    if (nomeLimpo === '' || [...nomeLimpo].length > LIMITE_DO_NOME) {
      res.status(400).json({
        error: { code: 'nome_invalido', message: 'Informe um nome de 1 a 120 caracteres.' },
      });
      return;
    }

    const { rows } = await pool.query<UserDTO>(
      'UPDATE users SET nome = $1 WHERE id = $2 RETURNING id, email, nome',
      [nomeLimpo, req.session.userId],
    );

    const user: UserDTO = { id: rows[0].id, email: rows[0].email, nome: rows[0].nome };
    res.status(200).json({ user });
  });

  return router;
}
