import '../config.js';
import { createInterface } from 'node:readline/promises';
import { lerDatabaseUrl } from '../config.js';
import { criarPool } from '../db/pool.js';
import { criarUsuario, listarUsuarios, resetarSenha } from '../usuarios.js';

async function usuarios(): Promise<void> {
  const comando = process.argv[2];
  const email = process.argv[3];
  const opcao = process.argv[4];
  const escolherSenha = opcao === '--escolher-senha';
  const usoValido = process.argv.length <= 5 && (
    (comando === 'listar' && email === undefined && opcao === undefined)
    || ((comando === 'criar' || comando === 'resetar') && !!email?.trim() && (opcao === undefined || escolherSenha))
  );

  if (!usoValido) {
    console.error('Uso:\n  npm run usuarios -- criar <e-mail> [--escolher-senha]\n  npm run usuarios -- resetar <e-mail> [--escolher-senha]\n  npm run usuarios -- listar');
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

    let senha: string | undefined;
    if (escolherSenha) {
      const terminal = createInterface({ input: process.stdin, output: process.stdout });
      try {
        senha = await terminal.question('Senha:');
        const repetida = await terminal.question('Repita a senha:');
        if (senha !== repetida) {
          console.error('As senhas não conferem.');
          process.exitCode = 1;
          return;
        }
      } finally {
        terminal.close();
      }
    }

    const conta = comando === 'criar'
      ? await criarUsuario(pool, email!, senha)
      : await resetarSenha(pool, email!, senha);
    if (escolherSenha) {
      console.log(`Senha definida para ${conta.email}.`);
    } else {
      console.log(`E-mail: ${conta.email}\nSenha: ${conta.senha}\nAnote a senha agora; ela não fica salva em lugar nenhum.`);
    }
  } finally {
    await pool.end();
  }
}

usuarios().catch((erro: unknown) => {
  const mensagem = erro instanceof Error ? erro.message : '';
  const mensagensConhecidas = [
    'A senha precisa ter de 8 a 200 caracteres.',
    'Já existe uma conta com esse e-mail.',
    'Conta não encontrada.',
    'Defina DATABASE_URL no .env',
  ];
  console.error(mensagensConhecidas.includes(mensagem) ? mensagem : 'Não foi possível executar o comando de contas.');
  process.exitCode = 1;
});
