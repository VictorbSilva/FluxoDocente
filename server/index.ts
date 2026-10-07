import { createApp } from './app.js';
import { isProduction, lerDatabaseUrl, lerPorta, lerSessionSecret } from './config.js';
import { criarPool } from './db/pool.js';

const porta = lerPorta();
const sessionSecret = lerSessionSecret();
const pool = criarPool(lerDatabaseUrl('DATABASE_URL'));

createApp({ production: isProduction, pool, sessionSecret }).listen(porta, () => {
  console.log(`Servidor em http://localhost:${porta}`);
});
