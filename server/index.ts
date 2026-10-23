import { catalogo } from '../shared/catalog.js';
import { createApp } from './app.js';
import { isProduction, lerDatabaseUrl, lerPorta, lerSessionSecret } from './config.js';
import { criarPool } from './db/pool.js';
import { gabaritoDosExercicios } from './exercicios/gabarito.js';
import { gabaritoDoNivelamento } from './nivelamento/gabarito.js';

const porta = lerPorta();
const sessionSecret = lerSessionSecret();
const pool = criarPool(lerDatabaseUrl('DATABASE_URL'));
const gabaritos = { exercicios: gabaritoDosExercicios, nivelamento: gabaritoDoNivelamento };

createApp({ production: isProduction, pool, sessionSecret, catalogo, gabaritos }).listen(porta, () => {
  console.log(`Servidor em http://localhost:${porta}`);
});
