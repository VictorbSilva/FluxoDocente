import express from 'express';
import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import { createHash, randomBytes } from 'node:crypto';
import type pg from 'pg';
import type { EnviarEmail } from '../email/enviar.js';
import { FORMATO_DO_EMAIL } from './rotas.js';
import { hashSenha } from './senha.js';

const ASSUNTO = 'Redefinição de senha do Fluxo Docente';

function responderMuitasTentativas(_req: express.Request, res: express.Response): void {
  res.status(429).json({
    error: { code: 'muitas_tentativas', message: 'Muitas tentativas. Aguarde 15 minutos.' },
  });
}

function responderTokenInvalido(res: express.Response): void {
  res.status(400).json({
    error: { code: 'token_invalido', message: 'Este link expirou ou já foi usado. Peça um novo.' },
  });
}

// O banco guarda só o hash: quem lê a tabela não consegue usar o link.
function hashDoToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function montarEmail(nome: string, link: string): { texto: string; html: string } {
  const abertura = `Olá, ${nome}.`;
  const pedido = 'Recebemos um pedido para redefinir a senha da sua conta no Fluxo Docente. Para criar uma senha nova, abra o link abaixo. Ele vale por 1 hora e só pode ser usado uma vez.';
  const aviso = 'Se você não fez esse pedido, ignore este e-mail. Sua senha continua a mesma.';
  const assinatura = 'Equipe Fluxo Docente';
  const linkHtml = escaparHtml(link);

  const texto = [abertura, pedido, link, aviso, assinatura].join('\n\n');
  const html = `<!doctype html>
<html lang="pt-BR">
<body style="margin:0;padding:24px;background:#ffffff;color:#1f2933;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;">
<p>${escaparHtml(abertura)}</p>
<p>${escaparHtml(pedido)}</p>
<p><a href="${linkHtml}" style="display:inline-block;padding:12px 24px;background:#177a7a;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">Criar senha nova</a></p>
<p style="word-break:break-all;"><a href="${linkHtml}" style="color:#177a7a;">${linkHtml}</a></p>
<p>${escaparHtml(aviso)}</p>
<p>${escaparHtml(assinatura)}</p>
</body>
</html>`;

  return { texto, html };
}

export function criarRotasDeRecuperacao(
  pool: pg.Pool,
  email: { enviar: EnviarEmail; appUrl: string } | null,
): express.Router {
  const router = express.Router();

  // Como no login, o teto por IP acomoda docentes na mesma rede do campus.
  const limitarPedidosPorIp = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: responderMuitasTentativas,
  });

  const limitarPedidosPorEmail = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: (req) => {
      const email: unknown = req.body?.email;
      const emailLimpo = typeof email === 'string' ? email.trim().toLowerCase() : '';
      return `${ipKeyGenerator(req.ip ?? '')}:${emailLimpo}`;
    },
    handler: responderMuitasTentativas,
  });

  const limitarRedefinicoes = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: responderMuitasTentativas,
  });

  // Roda depois da resposta. Grava o token e manda o link, salvo se a conta não
  // existe ou já tem um pedido registrado nos últimos 2 minutos.
  async function enviarLink(configuracao: { enviar: EnviarEmail; appUrl: string }, emailLimpo: string): Promise<void> {
    const token = randomBytes(32).toString('base64url');
    const tokenHash = hashDoToken(token);
    const client = await pool.connect();
    let usuario: { id: string; email: string; nome: string | null } | undefined;

    try {
      await client.query('BEGIN');
      // O FOR UPDATE enfileira pedidos simultâneos da mesma conta, para a janela
      // de 2 minutos valer também entre eles.
      const { rows } = await client.query<{ id: string; email: string; nome: string | null }>(
        'SELECT id, email, nome FROM users WHERE email = $1 FOR UPDATE',
        [emailLimpo],
      );
      usuario = rows[0];

      if (!usuario) {
        await client.query('ROLLBACK');
        return;
      }

      const recente = await client.query(
        "SELECT 1 FROM password_resets WHERE user_id = $1 AND criado_em > now() - interval '2 minutes'",
        [usuario.id],
      );

      if (recente.rows.length > 0) {
        await client.query('ROLLBACK');
        return;
      }

      // Reserva a janela de 2 minutos sem invalidar o link anterior.
      await client.query(
        "INSERT INTO password_resets (token_hash, user_id, expira_em) VALUES ($1, $2, now() + interval '1 hour')",
        [tokenHash, usuario.id],
      );
      await client.query('COMMIT');
    } catch (erro) {
      await client.query('ROLLBACK');
      throw erro;
    } finally {
      client.release();
    }

    // O SMTP espera sem manter conexão ou trava no banco. O token já está
    // confirmado, então o link entregue funciona mesmo se a limpeza falhar.
    const link = `${configuracao.appUrl}/redefinir-senha#token=${token}`;
    const { texto, html } = montarEmail(usuario.nome ?? 'docente', link);
    try {
      await configuracao.enviar({
        para: usuario.email,
        nomeDoDestinatario: usuario.nome,
        assunto: ASSUNTO,
        html,
        texto,
      });
    } catch (erro) {
      // Libera uma nova tentativa e preserva todos os links anteriores.
      await pool.query('DELETE FROM password_resets WHERE token_hash = $1', [tokenHash]);
      throw erro;
    }

    // Apaga só links anteriores ainda não usados. Se outro pedido mais novo
    // terminar primeiro, esta limpeza não pode apagar o link dele.
    await pool.query(
      `DELETE FROM password_resets AS antigo USING password_resets AS novo
       WHERE novo.token_hash = $1 AND antigo.user_id = novo.user_id
         AND antigo.token_hash <> novo.token_hash AND antigo.usado_em IS NULL
         AND antigo.criado_em <= novo.criado_em`,
      [tokenHash],
    );
  }

  router.post('/senha/esqueci', limitarPedidosPorIp, limitarPedidosPorEmail, (req, res) => {
    const enviado: unknown = req.body?.email;
    const emailLimpo = typeof enviado === 'string' ? enviado.trim().toLowerCase() : '';

    if (emailLimpo.length > 254 || !FORMATO_DO_EMAIL.test(emailLimpo)) {
      res.status(400).json({ error: { code: 'email_invalido', message: 'Informe um e-mail válido.' } });
      return;
    }

    if (!email) {
      res.status(503).json({
        error: {
          code: 'email_indisponivel',
          message: 'A recuperação de senha está indisponível. Fale com a equipe do projeto.',
        },
      });
      return;
    }

    // A resposta sai antes de buscar a conta, para que nem o conteúdo nem o
    // tempo dela revelem se o e-mail tem cadastro.
    res.status(202).json({ ok: true });

    enviarLink(email, emailLimpo).catch((erro: unknown) => {
      console.error('Falha no pedido de recuperação de senha:', erro);
    });
  });

  router.post('/senha/redefinir', limitarRedefinicoes, async (req, res) => {
    const { token, password } = req.body ?? {};

    // Validada antes de tocar no token, para a senha inválida não gastar o link.
    if (typeof password !== 'string' || password.length < 8 || password.length > 200) {
      res.status(400).json({
        error: { code: 'senha_invalida', message: 'A senha precisa ter de 8 a 200 caracteres.' },
      });
      return;
    }

    if (typeof token !== 'string') {
      responderTokenInvalido(res);
      return;
    }

    const passwordHash = await hashSenha(password);
    const client = await pool.connect();
    let redefinida = false;

    try {
      await client.query('BEGIN');
      const { rows } = await client.query<{ user_id: string }>(
        `UPDATE password_resets SET usado_em = now()
         WHERE token_hash = $1 AND usado_em IS NULL AND expira_em > now()
         RETURNING user_id`,
        [hashDoToken(token)],
      );

      if (rows.length > 0) {
        // A impressão da senha muda e derruba as sessões em criarExigirLogin;
        // apagar as sessões, como no resetarSenha, encerra todas de uma vez.
        await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, rows[0].user_id]);
        await client.query("DELETE FROM session WHERE sess->>'userId' = $1", [rows[0].user_id]);
        redefinida = true;
      }

      await client.query('COMMIT');
    } catch (erro) {
      await client.query('ROLLBACK');
      throw erro;
    } finally {
      client.release();
    }

    if (!redefinida) {
      responderTokenInvalido(res);
      return;
    }

    res.status(200).json({ ok: true });
  });

  return router;
}
