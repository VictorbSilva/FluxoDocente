import express from 'express';
import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import { randomBytes } from 'node:crypto';
import type pg from 'pg';
import type { UserDTO } from '../../shared/contracts.js';
import { VERSAO_DO_TERMO } from '../../shared/termo.js';
import { LIMITE_DO_NOME } from '../cursos/rotas.js';
import { hashSenha, impressaoDaSenha, verificarSenha } from './senha.js';
import { criarExigirLogin, responderNaoAutenticado } from './sessao.js';

// Usado quando o e-mail não existe: a verificação roda do mesmo jeito para que
// o tempo de resposta não revele se a conta existe.
const hashDeEmailInexistente = hashSenha(randomBytes(32).toString('hex'));

export const FORMATO_DO_EMAIL =/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function responderCredenciaisInvalidas(res: express.Response): void {
  res.status(401).json({
    error: { code: 'credenciais_invalidas', message: 'E-mail ou senha inválidos.' },
  });
}

function responderDadoInvalido(res: express.Response, code: string, message: string): void {
  res.status(400).json({ error: { code, message } });
}

function responderMuitasTentativasNoLogin(_req: express.Request, res: express.Response): void {
  res.status(429).json({
    error: { code: 'muitas_tentativas', message: 'Muitas tentativas. Aguarde 15 minutos.' },
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
  const exigirLogin = criarExigirLogin(pool, production);

  // Docentes da mesma universidade podem sair pelo mesmo IP: o limite apertado
  // conta por IP e e-mail juntos, e o teto só por IP é mais alto.
  const limitarLoginPorIp = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: responderMuitasTentativasNoLogin,
  });

  const limitarLoginPorEmail = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: (req) => {
      const email: unknown = req.body?.email;
      const emailLimpo = typeof email === 'string' ? email.trim().toLowerCase() : '';
      return `${ipKeyGenerator(req.ip ?? '')}:${emailLimpo}`;
    },
    handler: responderMuitasTentativasNoLogin,
  });

  const limitarCadastro = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        error: { code: 'muitas_tentativas', message: 'Muitas tentativas. Aguarde uma hora.' },
      });
    },
  });

  router.post('/login', limitarLoginPorIp, limitarLoginPorEmail, async (req, res) => {
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

    const { rows } = await pool.query<{ id: string; email: string; nome: string | null; password_hash: string }>(
      'SELECT id, email, nome, password_hash FROM users WHERE email = $1',
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
    // Impressão do mesmo hash que acabou de ser verificado, não de uma nova leitura.
    req.session.senhaImpressao = impressaoDaSenha(usuario.password_hash);
    await salvarSessao(req);

    const user: UserDTO = { id: usuario.id, email: usuario.email, nome: usuario.nome };
    res.status(200).json({ user });
  });

  router.post('/cadastro', limitarCadastro, async (req, res) => {
    const { nome, email, password, aceitouTermo } = req.body ?? {};
    const nomeLimpo = typeof nome === 'string' ? nome.trim() : '';
    const emailLimpo = typeof email === 'string' ? email.trim().toLowerCase() : '';

    // Conta caracteres, não unidades UTF-16, como no PUT /api/me/perfil.
    if (nomeLimpo === '' || [...nomeLimpo].length > LIMITE_DO_NOME) {
      responderDadoInvalido(res, 'nome_invalido', `Informe um nome de 1 a ${LIMITE_DO_NOME} caracteres.`);
      return;
    }

    if (emailLimpo.length > 254 || !FORMATO_DO_EMAIL.test(emailLimpo)) {
      responderDadoInvalido(res, 'email_invalido', 'Informe um e-mail válido.');
      return;
    }

    if (typeof password !== 'string' || password.length < 8 || password.length > 200) {
      responderDadoInvalido(res, 'senha_invalida', 'A senha precisa ter de 8 a 200 caracteres.');
      return;
    }

    if (aceitouTermo !== true) {
      responderDadoInvalido(res, 'termo_obrigatorio', 'Aceite o termo de consentimento para criar a conta.');
      return;
    }

    let usuario: { id: string; email: string; nome: string | null; password_hash: string };
    try {
      const { rows } = await pool.query<typeof usuario>(
        `INSERT INTO users (email, password_hash, nome, termo_aceito_em, termo_versao)
         VALUES ($1, $2, $3, now(), $4)
         RETURNING id, email, nome, password_hash`,
        [emailLimpo, await hashSenha(password), nomeLimpo, VERSAO_DO_TERMO],
      );
      usuario = rows[0];
    } catch (erro) {
      if ((erro as { code?: string }).code === '23505') {
        res.status(409).json({
          error: { code: 'email_em_uso', message: 'Já existe uma conta com esse e-mail.' },
        });
        return;
      }
      throw erro;
    }

    await regenerarSessao(req);
    req.session.userId = usuario.id;
    req.session.senhaImpressao = impressaoDaSenha(usuario.password_hash);
    await salvarSessao(req);

    const user: UserDTO = { id: usuario.id, email: usuario.email, nome: usuario.nome };
    res.status(201).json({ user });
  });

  router.get('/me', exigirLogin, async (req, res) => {
    const { rows } = await pool.query<UserDTO>(
      'SELECT id, email, nome FROM users WHERE id = $1',
      [req.session.userId],
    );
    const usuario = rows[0];

    if (!usuario) {
      await destruirSessao(req);
      responderNaoAutenticado(res);
      return;
    }

    const user: UserDTO = { id: usuario.id, email: usuario.email, nome: usuario.nome };
    res.status(200).json({ user });
  });

  router.post('/logout', async (req, res) => {
    await destruirSessao(req);
    res.clearCookie('fd.sid', { httpOnly: true, sameSite: 'lax', secure: production });
    res.status(204).end();
  });

  return router;
}
