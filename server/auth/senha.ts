import { createHash, randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto';

// Parâmetros recomendados pela OWASP. Com N=32768 e r=8 o scrypt usa 32 MiB,
// exatamente o limite padrão do Node, por isso o maxmem maior.
const N = 32768;
const R = 8;
const P = 3;
const TAMANHO_SALT = 16;
const TAMANHO_CHAVE = 64;
const MAXMEM = 64 * 1024 * 1024;

function derivarChave(senha: string, salt: Buffer, tamanho: number, opcoes: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(senha, salt, tamanho, opcoes, (erro, chave) => {
      if (erro) {
        reject(erro);
        return;
      }

      resolve(chave);
    });
  });
}

// Formato: scrypt$N$r$p$<salt base64>$<hash base64>
export async function hashSenha(senha: string): Promise<string> {
  const salt = randomBytes(TAMANHO_SALT);
  const chave = await derivarChave(senha, salt, TAMANHO_CHAVE, { N, r: R, p: P, maxmem: MAXMEM });

  return ['scrypt', N, R, P, salt.toString('base64'), chave.toString('base64')].join('$');
}

export async function verificarSenha(senha: string, armazenado: string): Promise<boolean> {
  const partes = armazenado.split('$');

  if (partes.length !== 6 || partes[0] !== 'scrypt') {
    return false;
  }

  const [, n, r, p, saltBase64, chaveBase64] = partes;
  const parametros = [Number(n), Number(r), Number(p)];

  if (!parametros.every((valor) => Number.isSafeInteger(valor) && valor > 0)) {
    return false;
  }

  const salt = Buffer.from(saltBase64, 'base64');
  const esperado = Buffer.from(chaveBase64, 'base64');

  if (esperado.length === 0) {
    return false;
  }

  const [custo, blocos, paralelismo] = parametros;
  const obtido = await derivarChave(senha, salt, esperado.length, {
    N: custo,
    r: blocos,
    p: paralelismo,
    maxmem: MAXMEM,
  });

  return timingSafeEqual(obtido, esperado);
}

// Guardada na sessão no lugar do hash: se a senha mudar, a impressão muda e a sessão cai.
export function impressaoDaSenha(passwordHash: string): string {
  return createHash('sha256').update(passwordHash).digest('hex');
}
