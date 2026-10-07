import { createApp } from './app.js';
import { isProduction, lerPorta } from './config.js';

const porta = lerPorta();

createApp({ production: isProduction }).listen(porta, () => {
  console.log(`Servidor em http://localhost:${porta}`);
});
