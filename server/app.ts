import express from 'express';
import helmet from 'helmet';
import path from 'node:path';

export function createApp(opcoes: { production: boolean }): express.Express {
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

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

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
