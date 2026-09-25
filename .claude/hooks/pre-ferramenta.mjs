// PreToolUse: roda ANTES de cada Edit/Write/MultiEdit/Bash.
// 1. Arquivo listado em "aprovarAntesDeEditar" -> pede sua aprovação.
// 2. `git commit` numa branch protegida, ou `git push` para ela -> bloqueia.
import { execSync } from 'node:child_process';
import { carregarConfig, casaAlguma, lerEntrada, raizDoProjeto, relativo } from '../lib/projeto.mjs';

const { tool_name, tool_input = {}, cwd } = await lerEntrada();
const raiz = raizDoProjeto(cwd);
const config = carregarConfig(raiz);

// --- 1. Arquivos que exigem aprovação manual -------------------------------
if (['Edit', 'Write', 'MultiEdit'].includes(tool_name) && tool_input.file_path) {
  const arquivo = relativo(raiz, tool_input.file_path);
  if (casaAlguma(config.aprovarAntesDeEditar, arquivo)) {
    // JSON no stdout com "ask" faz o Claude Code perguntar a você.
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: `Alteração em ${arquivo}: leia o diff antes de aprovar.`,
      },
    }));
  }
  process.exit(0);
}

// --- 2. GitHub Flow: nada direto nas branches protegidas -------------------
if (tool_name !== 'Bash') process.exit(0);

const PROTEGIDAS = config.branchesProtegidas;
const branchAtual = () => {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { cwd, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().trim();
  } catch {
    return ''; // fora de um repositório git
  }
};

// Separa o comando em trechos (&&, ||, ;, |, quebra de linha) e acha o
// subcomando de cada `git`, pulando opções globais como `-C caminho`.
for (const trecho of (tool_input.command ?? '').split(/&&|\|\||;|\||\n/)) {
  const tokens = trecho.trim().split(/\s+/);
  const iGit = tokens.indexOf('git');
  if (iGit === -1) continue;

  let i = iGit + 1;
  while (tokens[i]?.startsWith('-')) i += ['-C', '-c'].includes(tokens[i]) ? 2 : 1;
  const sub = tokens[i];
  const args = tokens.slice(i + 1).filter((t) => !t.startsWith('-'));

  if (sub === 'commit' && PROTEGIDAS.includes(branchAtual())) {
    console.error(`Bloqueado: commit direto na ${branchAtual()}. Crie uma branch e faça o commit nela.`);
    process.exit(2); // exit 2 = bloqueia e mostra a mensagem ao Claude
  }

  if (sub === 'push') {
    // args[0] é o remote; o resto são refspecs. Sem refspec (ou HEAD) = branch atual.
    const refspecs = args.slice(1);
    const destinos = refspecs.length === 0 || refspecs.includes('HEAD')
      ? [branchAtual()]
      : refspecs.map((r) => r.split(':').pop().replace(/^refs\/heads\//, ''));
    const protegido = destinos.find((d) => PROTEGIDAS.includes(d));
    if (protegido) {
      console.error(`Bloqueado: push para a ${protegido}. Faça push da sua branch e abra um PR.`);
      process.exit(2);
    }
  }
}
process.exit(0);
