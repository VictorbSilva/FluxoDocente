import connectPgSimple from 'connect-pg-simple';
import session from 'express-session';
import type express from 'express';
import type pg from 'pg';

declare module 'express-session' {
  interface SessionData {
    userId: string;
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

export const exigirLogin: express.RequestHandler = (req, res, next) => {
  if (!req.session.userId) {
    responderNaoAutenticado(res);
    return;
  }

  next();
};
