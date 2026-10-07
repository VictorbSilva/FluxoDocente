import express from 'express';
import helmet from 'helmet';
import path from 'node:path';
import type pg from 'pg';
import { criarRotasDeAuth } from './auth/rotas.js';
import { criarMiddlewareDeSessao } from './auth/sessao.js';

const METODOS_SEGUROS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function createApp(opcoes: {
  production: boolean;
  pool: pg.Pool;
  sessionSecret: string;
}): express.Express {
  const app = express();

  if (opcoes.production) {
    app.set('trust proxy', 1);
  }

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        'img-src': ["'self'", 'data:', 'https://images.pexels.com', 'https://i.ytimg.com'],
        'frame-src': ['https://www.youtube-nocookie.com', 'https://www.youtube.com'],
      },
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }));

  app.use('/api', express.json({ limit: '10kb' }));

  // Além do SameSite=Lax, toda requisição que altera estado exige um cabeçalho
  // próprio, que um formulário de outro site não consegue enviar.
  app.use('/api', (req, res, next) => {
    if (!METODOS_SEGUROS.has(req.method) && req.get('X-FluxoDocente') !== '1') {
      res.status(403).json({
        error: { code: 'origem_invalida', message: 'Requisição recusada.' },
      });
      return;
    }

    next();
  });

  app.use('/api', criarMiddlewareDeSessao({
    pool: opcoes.pool,
    secret: opcoes.sessionSecret,
    production: opcoes.production,
  }));

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/auth', criarRotasDeAuth(opcoes.pool, opcoes.production));

  app.use('/api', (_req, res) => {
    res.status(404).json({
      error: { code: 'rota_inexistente', message: 'Rota não encontrada.' },
    });
  });

  if (opcoes.production) {
    app.use(express.static(path.resolve('dist')));
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api')) {
        res.sendFile(path.resolve('dist', 'index.html'));
        return;
      }

      next();
    });
  }

  const handlerErro: express.ErrorRequestHandler = (err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') {
      res.status(400).json({
        error: { code: 'json_invalido', message: 'Requisição inválida.' },
      });
      return;
    }

    if (err.type === 'entity.too.large') {
      res.status(413).json({
        error: { code: 'corpo_grande', message: 'Requisição inválida.' },
      });
      return;
    }

    console.error(err);
    res.status(500).json({
      error: { code: 'erro_interno', message: 'Erro interno. Tente novamente.' },
    });
  };

  app.use(handlerErro);

  return app;
}
