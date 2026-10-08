import connectPgSimple from 'connect-pg-simple';
import session from 'express-session';
import type express from 'express';
import type pg from 'pg';
import { impressaoDaSenha } from './senha.js';

declare module 'express-session' {
  interface SessionData {
    userId: string;
    senhaImpressao: string;
  }
}

export function criarMiddlewareDeSessao(opcoes: {
  pool: pg.Pool;
  secret: string;
  production: boolean;
}): express.RequestHandler {
  const PgStore = connectPgSimple(session);

  return session({
    name: 'fd.sid',
    secret: opcoes.secret,
    // A tabela vem da migração. A limpeza roda uma vez por dia em produção para
    // não manter o Neon acordado, e fica desligada nos testes para o processo encerrar.
    store: new PgStore({
      pool: opcoes.pool,
      tableName: 'session',
      pruneSessionInterval: opcoes.production ? 60 * 60 * 24 : false,
    }),
    resave: false,
    saveUninitialized: false,
    rolling: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: opcoes.production,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  });
}

export function responderNaoAutenticado(res: express.Response): void {
  res.status(401).json({
    error: { code: 'nao_autenticado', message: 'Faça login para continuar.' },
  });
}

// A sessão só vale enquanto a senha for a mesma do login. Isso cobre o login que
// termina depois de um reset de senha ter apagado as sessões existentes.
export function criarExigirLogin(pool: pg.Pool, production: boolean): express.RequestHandler {
  return async (req, res, next) => {
    if (!req.session.userId) {
      responderNaoAutenticado(res);
      return;
    }

    const { rows } = await pool.query<{ password_hash: string }>(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.session.userId],
    );
    const usuario = rows[0];

    if (!usuario || impressaoDaSenha(usuario.password_hash) !== req.session.senhaImpressao) {
      await new Promise<void>((resolve, reject) => {
        req.session.destroy((erro) => (erro ? reject(erro) : resolve()));
      });
      res.clearCookie('fd.sid', { httpOnly: true, sameSite: 'lax', secure: production });
      res.status(401).json({
        error: { code: 'nao_autenticado', message: 'Sua sessão expirou. Entre novamente.' },
      });
      return;
    }

    next();
  };
}
