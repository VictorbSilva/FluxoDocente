if (process.env.NODE_ENV !== 'production') {
  try {
    process.loadEnvFile();
  } catch {
    // O arquivo .env é opcional em desenvolvimento.
  }
}

export const isProduction = process.env.NODE_ENV === 'production';

export function lerPorta(): number {
  const porta = Number(process.env.PORT ?? 3001);

  if (!Number.isInteger(porta) || porta <= 0) {
    throw new Error('PORT deve ser um número inteiro positivo.');
  }

  return porta;
}

export function lerDatabaseUrl(nome: 'DATABASE_URL' | 'TEST_DATABASE_URL'): string {
  const url = process.env[nome];

  if (!url?.trim()) {
    throw new Error(`Defina ${nome} no .env`);
  }

  return url;
}

// Sem as três variáveis, a recuperação de senha não envia pelo Gmail.
export function lerConfigDeEmail(): { usuario: string; senhaDeApp: string; appUrl: string } | null {
  const usuario = process.env.GMAIL_USUARIO?.trim();
  // O Google mostra a senha de app em grupos de 4 separados por espaço.
  const senhaDeApp = process.env.GMAIL_SENHA_DE_APP?.replace(/\s/g, '');
  const appUrl = process.env.APP_URL?.trim().replace(/\/+$/, '');

  if (!usuario || !senhaDeApp || !appUrl) {
    return null;
  }

  return { usuario, senhaDeApp, appUrl };
}

export function lerSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error('Defina SESSION_SECRET no .env com pelo menos 32 caracteres');
  }

  return secret;
}
