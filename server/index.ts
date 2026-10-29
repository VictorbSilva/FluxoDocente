import { catalogo } from '../shared/catalog.js';
import { createApp } from './app.js';
import { isProduction, lerConfigDeEmail, lerDatabaseUrl, lerPorta, lerSessionSecret } from './config.js';
import { criarPool } from './db/pool.js';
import { criarEnvioPeloConsole, criarEnvioPeloGmail, type EnviarEmail } from './email/enviar.js';
import { gabaritoDosExercicios } from './exercicios/gabarito.js';
import { gabaritoDoNivelamento } from './nivelamento/gabarito.js';

const porta = lerPorta();
const sessionSecret = lerSessionSecret();
const pool = criarPool(lerDatabaseUrl('DATABASE_URL'));
const gabaritos = { exercicios: gabaritoDosExercicios, nivelamento: gabaritoDoNivelamento };
const configDeEmail = lerConfigDeEmail();
let email: { enviar: EnviarEmail; appUrl: string } | null = null;

if (configDeEmail) {
  email = {
    enviar: criarEnvioPeloGmail({ usuario: configDeEmail.usuario, senhaDeApp: configDeEmail.senhaDeApp }),
    appUrl: configDeEmail.appUrl,
  };
} else if (!isProduction) {
  email = { enviar: criarEnvioPeloConsole(), appUrl: 'http://localhost:5173' };
} else {
  console.warn('Recuperação de senha desligada: defina GMAIL_USUARIO, GMAIL_SENHA_DE_APP e APP_URL.');
}

createApp({ production: isProduction, pool, sessionSecret, catalogo, gabaritos, email }).listen(porta, () => {
  console.log(`Servidor em http://localhost:${porta}`);
});
