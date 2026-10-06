import { lerDatabaseUrl } from '../config.js';
import { criarPool } from '../db/pool.js';
import { aplicarMigracoes } from '../db/migracoes.js';

async function migrar(): Promise<void> {
  const url = lerDatabaseUrl('DATABASE_URL');
  console.log(new URL(url).host);
  const pool = criarPool(url);

  try {
    const aplicadas = await aplicarMigracoes(pool);
    console.log(aplicadas.length > 0 ? aplicadas.join('\n') : 'Nada a aplicar');
  } finally {
    await pool.end();
  }
}

migrar().catch((erro: unknown) => {
  console.error(erro instanceof Error ? erro.message : 'Não foi possível aplicar as migrações.');
  process.exitCode = 1;
});
