import '../config.js';
import { lerDatabaseUrl } from '../config.js';
import { criarPool } from '../db/pool.js';
import { criarUsuario, listarUsuarios, resetarSenha } from '../usuarios.js';

async function usuarios(): Promise<void> {
  const comando = process.argv[2];
  const email = process.argv[3];
  const usoValido = process.argv.length <= 4 && (
    (comando === 'listar' && email === undefined)
    || ((comando === 'criar' || comando === 'resetar') && !!email?.trim())
  );

  if (!usoValido) {
    console.error('Uso:\n  npm run usuarios -- criar <e-mail>\n  npm run usuarios -- resetar <e-mail>\n  npm run usuarios -- listar');
    process.exitCode = 1;
    return;
  }

  const url = lerDatabaseUrl('DATABASE_URL');
  console.log(`Banco: ${new URL(url).host}`);
  const pool = criarPool(url);

  try {
    if (comando === 'listar') {
      console.table(await listarUsuarios(pool));
      return;
    }

    const conta = comando === 'criar'
      ? await criarUsuario(pool, email!)
      : await resetarSenha(pool, email!);
    console.log(`E-mail: ${conta.email}\nSenha: ${conta.senha}\nAnote a senha agora; ela não fica salva em lugar nenhum.`);
  } finally {
    await pool.end();
  }
}

usuarios().catch((erro: unknown) => {
  const mensagem = erro instanceof Error ? erro.message : '';
  const mensagensConhecidas = [
    'Já existe uma conta com esse e-mail.',
    'Conta não encontrada.',
    'Defina DATABASE_URL no .env',
  ];
  console.error(mensagensConhecidas.includes(mensagem) ? mensagem : 'Não foi possível executar o comando de contas.');
  process.exitCode = 1;
});
