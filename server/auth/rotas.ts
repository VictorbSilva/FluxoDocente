import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { randomBytes } from 'node:crypto';
import type pg from 'pg';
import type { UserDTO } from '../../shared/contracts.js';
import { hashSenha, verificarSenha } from './senha.js';
import { exigirLogin, responderNaoAutenticado } from './sessao.js';

// Usado quando o e-mail não existe: a verificação roda do mesmo jeito para que
// o tempo de resposta não revele se a conta existe.
const hashDeEmailInexistente = hashSenha(randomBytes(32).toString('hex'));

function responderCredenciaisInvalidas(res: express.Response): void {
  res.status(401).json({
    error: { code: 'credenciais_invalidas', message: 'E-mail ou senha inválidos.' },
  });
}

function regenerarSessao(req: express.Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.regenerate((erro) => (erro ? reject(erro) : resolve()));
  });
}

function salvarSessao(req: express.Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.save((erro) => (erro ? reject(erro) : resolve()));
  });
}

function destruirSessao(req: express.Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.destroy((erro) => (erro ? reject(erro) : resolve()));
  });
}

export function criarRotasDeAuth(pool: pg.Pool, production: boolean): express.Router {
  const router = express.Router();

  const limitarLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        error: { code: 'muitas_tentativas', message: 'Muitas tentativas. Aguarde 15 minutos.' },
      });
    },
  });

  router.post('/login', limitarLogin, async (req, res) => {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== 'string'
      || typeof password !== 'string'
      || email.trim().length === 0
      || email.trim().length > 254
      || password.length < 1
      || password.length > 200
    ) {
      res.status(400).json({
        error: { code: 'dados_invalidos', message: 'Preencha e-mail e senha.' },
      });
      return;
    }

    const { rows } = await pool.query<{ id: string; email: string; password_hash: string }>(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email.trim().toLowerCase()],
    );
    const usuario = rows[0];

    if (!usuario) {
      await verificarSenha(password, await hashDeEmailInexistente);
      responderCredenciaisInvalidas(res);
      return;
    }

    if (!(await verificarSenha(password, usuario.password_hash))) {
      responderCredenciaisInvalidas(res);
      return;
    }

    await regenerarSessao(req);
    req.session.userId = usuario.id;
    await salvarSessao(req);

    const user: UserDTO = { id: usuario.id, email: usuario.email };
    res.status(200).json({ user });
  });

  router.get('/me', exigirLogin, async (req, res) => {
    const { rows } = await pool.query<UserDTO>(
      'SELECT id, email FROM users WHERE id = $1',
      [req.session.userId],
    );
    const usuario = rows[0];

    if (!usuario) {
      await destruirSessao(req);
      responderNaoAutenticado(res);
      return;
    }

    const user: UserDTO = { id: usuario.id, email: usuario.email };
    res.status(200).json({ user });
  });

  router.post('/logout', async (req, res) => {
    await destruirSessao(req);
    res.clearCookie('fd.sid', { httpOnly: true, sameSite: 'lax', secure: production });
    res.status(204).end();
  });

  return router;
}
