// Chamada comum ao opencode, usada pelos dois scripts de verificação.
// O modelo vem da variável ABACUS_VERIFICADOR, no formato provider/model
// (rode `opencode models` para ver o nome exato no seu setup).
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { carregarConfig, casaAlguma } from '../lib/projeto.mjs';

// Teto de arquivos anexados por chamada: é o que mais pesa nos créditos.
const MAX_ARQUIVOS = 12;

export { carregarConfig };

export const raizDoRepositorio = () =>
  spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).stdout.trim() || process.cwd();

export const nomeDoModelo = () => process.env.ABACUS_VERIFICADOR ?? '';

// Documentos de contexto a anexar: os de "revisao.documentos" que existirem e,
// se algum arquivo envolvido estiver na lista de "armadilhas", o documento de armadilhas.
export function documentosDeContexto(raiz, config, arquivosEnvolvidos) {
  const docs = [...config.revisao.documentos];
  const armadilhas = config.revisao.armadilhas;
  if (armadilhas?.documento && arquivosEnvolvidos.some((a) => casaAlguma(armadilhas.arquivos ?? [], a))) {
    docs.push(armadilhas.documento);
  }
  return docs.map((d) => path.join(raiz, d)).filter((d) => fs.existsSync(d));
}

export function salvarTemporario(nome, conteudo) {
  const caminho = path.join(os.tmpdir(), `claude-${Date.now()}-${nome}`);
  fs.writeFileSync(caminho, conteudo);
  return caminho;
}

export function chamarOpencode(instrucao, arquivos) {
  const modelo = nomeDoModelo();
  if (!modelo) {
    console.error('Defina ABACUS_VERIFICADOR com o modelo (rode `opencode models` e copie o provider/model).');
    process.exit(1);
  }
  if (arquivos.length > MAX_ARQUIVOS) {
    console.error(`Recusado: ${arquivos.length} arquivos anexados (máximo ${MAX_ARQUIVOS}). Divida a verificação.`);
    process.exit(1);
  }

  // A mensagem vem antes dos -f para o opencode não confundi-la com um arquivo.
  const args = ['run', instrucao, '-m', modelo, '--title', 'verificacao'];
  for (const a of arquivos) args.push('-f', a);

  // No Windows o opencode é um .cmd e precisa de shell: cada argumento vai entre
  // aspas duplas, então aspas duplas dentro do texto viram simples.
  const noWindows = process.platform === 'win32';
  const r = spawnSync('opencode', noWindows ? args.map((a) => `"${a.replace(/"/g, "'")}"`) : args, {
    encoding: 'utf8', shell: noWindows, maxBuffer: 20 * 1024 * 1024,
  });

  if (r.error || r.status !== 0) {
    console.error(`Falha ao chamar o opencode: ${r.error?.message ?? r.stderr}`);
    process.exit(3); // 3 = a skill cai no plano B (subagente)
  }
  return r.stdout;
}
