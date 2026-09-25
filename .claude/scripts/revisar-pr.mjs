// Revisão da branch pelo Abacus, só quando ela mexe em arquivo sensível.
// Uso: node .claude/scripts/revisar-pr.mjs          (compara com a base do projeto.json)
//      node .claude/scripts/revisar-pr.mjs main     (compara com outra base)
// O resultado fica guardado por commit e por modelo: repetir não gasta crédito.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { casaAlguma } from '../lib/projeto.mjs';
import {
  carregarConfig, chamarOpencode, documentosDeContexto, nomeDoModelo, raizDoRepositorio, salvarTemporario,
} from './abacus.mjs';

const git = (cmd) => execSync(`git ${cmd}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const raiz = raizDoRepositorio();
const config = carregarConfig(raiz);
const { revisao } = config;
const base = process.argv[2] ?? revisao.base;

let inicio;
try {
  inicio = git(`merge-base ${base} HEAD`);
} catch {
  console.error(`Base "${base}" não encontrada. Rode \`git fetch\` ou passe outra base: node .claude/scripts/revisar-pr.mjs main`);
  process.exit(1);
}

// "sensiveis" ausente (null) = qualquer arquivo alterado conta.
const alterados = git(`diff --name-only ${inicio} HEAD`).split('\n').filter(Boolean);
const sensiveis = alterados.filter((a) =>
  !casaAlguma(revisao.ignorar, a) && (revisao.sensiveis === null || casaAlguma(revisao.sensiveis, a)));

if (!sensiveis.length) {
  console.log('Nenhum arquivo sensível alterado. Revisão pelo Abacus não é necessária.');
  process.exit(0);
}

const commit = git('rev-parse --short HEAD');
const modelo = (nomeDoModelo() || 'sem-modelo').replace(/[^\w.-]/g, '_');
const cache = path.join(git('rev-parse --absolute-git-dir'), `revisao-abacus-${commit}-${modelo}.md`);
if (fs.existsSync(cache)) {
  console.log(`(revisão já feita para ${commit} com ${modelo}, sem novo gasto)\n`);
  console.log(fs.readFileSync(cache, 'utf8'));
  process.exit(0);
}

const diff = git(`diff ${inicio} HEAD -- ${sensiveis.map((a) => `"${a}"`).join(' ')}`);
const anexos = [
  salvarTemporario('diff.patch', diff),
  ...documentosDeContexto(raiz, config, sensiveis),
  // Alguns arquivos precisam ir inteiros: o diff sozinho esconde o contexto (ex.: funções auxiliares).
  ...sensiveis.filter((a) => casaAlguma(revisao.anexarInteiro, a)).map((a) => path.join(raiz, a)),
];

const focos = revisao.focos.length
  ? `Procure principalmente: ${revisao.focos.join('; ')}.`
  : 'Procure bugs, regressões e violações das decisões registradas nos documentos do projeto.';

const instrucao = [
  `Revise este diff. ${config.descricao ? `Projeto: ${config.descricao}` : ''}`,
  'Os documentos anexos registram decisões já tomadas; não as trate como problema, mas aponte quando o diff as viola.',
  'Use SOMENTE os anexos. Não explore o repositório e não edite nada.',
  focos,
  'Para cada problema: arquivo e linha do diff, severidade (Crítica/Alta/Média/Baixa) e por que é um problema.',
  'Se não encontrar nada relevante, responda apenas: SEM PROBLEMAS RELEVANTES.',
].join(' '); // uma linha só: no Windows, quebra de linha corta o argumento no cmd

console.log(`Arquivos revisados: ${sensiveis.join(', ')}\n`);
const saida = chamarOpencode(instrucao, anexos);
fs.writeFileSync(cache, saida);
console.log(saida);
