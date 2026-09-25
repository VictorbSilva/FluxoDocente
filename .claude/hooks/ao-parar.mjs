// Stop: roda quando o Claude vai encerrar a resposta.
// Só age se a sessão editou arquivos (lista anotada pelo pos-edicao.mjs).
// Para cada item de "aoParar" no projeto.json cujo padrão casa com um arquivo
// editado, roda o script do npm. Se algum falhar, o Claude não pode encerrar.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { carregarConfig, lerEntrada, marcadorDaSessao, raizDoProjeto } from '../lib/projeto.mjs';

const { session_id, stop_hook_active, cwd } = await lerEntrada();

// Se o Claude já está continuando por causa deste hook, deixa encerrar.
// Evita loop infinito quando ele não consegue resolver a falha.
if (stop_hook_active) process.exit(0);

const marcador = marcadorDaSessao(session_id);
if (!fs.existsSync(marcador)) process.exit(0); // nada editado: pergunta/resposta pura

const editados = [...new Set(fs.readFileSync(marcador, 'utf8').split('\n').filter(Boolean))];
const raiz = raizDoProjeto(cwd);
const config = carregarConfig(raiz);
const pacote = path.join(raiz, 'package.json');
const { scripts = {} } = fs.existsSync(pacote) ? JSON.parse(fs.readFileSync(pacote, 'utf8')) : {};

const falhas = [];
const avisos = [];
const jaRodados = new Set();

for (const { seMudar, script, avisoSeFaltar } of config.aoParar) {
  if (jaRodados.has(script) || !editados.some((a) => new RegExp(seMudar).test(a))) continue;
  jaRodados.add(script);

  // Script ausente, ou o "test" padrão do npm que só imprime erro.
  if (!scripts[script] || scripts[script].includes('no test specified')) {
    if (avisoSeFaltar) avisos.push(avisoSeFaltar);
    continue;
  }

  const r = spawnSync(`npm run ${script} --silent`, {
    // Sem cores no terminal: códigos ANSI só atrapalham a leitura da mensagem pelo Claude.
    cwd: raiz, shell: true, encoding: 'utf8', env: { ...process.env, CI: 'true', NO_COLOR: '1', FORCE_COLOR: '0' },
  });
  if (r.status !== 0) falhas.push(`npm run ${script} falhou:\n${(r.stdout + r.stderr).trim().slice(-3000)}`);
}

if (falhas.length) {
  // Mantém o marcador: na próxima vez que parar, verifica de novo.
  console.error(falhas.join('\n\n'));
  process.exit(2); // exit 2 = o Claude continua trabalhando com essa mensagem
}

fs.rmSync(marcador);
if (avisos.length) console.log(JSON.stringify({ systemMessage: avisos.join('\n') }));
process.exit(0);
