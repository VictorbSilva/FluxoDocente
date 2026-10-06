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
