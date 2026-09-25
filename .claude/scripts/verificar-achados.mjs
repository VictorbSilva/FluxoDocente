// Fase 2 da auditoria: manda os achados para um modelo do Abacus tentar refutá-los.
// Uso: node .claude/scripts/verificar-achados.mjs < achados.md
// Anexa só os arquivos citados nas evidências e os documentos de contexto do projeto.
import fs from 'node:fs';
import path from 'node:path';
import { carregarConfig, chamarOpencode, documentosDeContexto, raizDoRepositorio, salvarTemporario } from './abacus.mjs';

let achados = '';
for await (const pedaco of process.stdin) achados += pedaco;
if (!achados.trim()) {
  console.error('Nenhum achado recebido no stdin.');
  process.exit(1);
}

const raiz = raizDoRepositorio();
const config = carregarConfig(raiz);

// Evidências no formato `caminho/arquivo.ext:linha`
const citados = [...new Set([...achados.matchAll(/`([^`\s]+\.\w+):\d+/g)].map((m) => m[1]))];
const existentes = citados.filter((c) => fs.existsSync(path.join(raiz, c)));
const ausentes = citados.filter((c) => !existentes.includes(c));

const anexos = [
  salvarTemporario('achados.md', achados),
  ...existentes.map((c) => path.join(raiz, c)),
  ...documentosDeContexto(raiz, config, existentes),
];

const instrucao = [
  'Você é o verificador independente de uma auditoria de código.',
  config.descricao ? `Projeto: ${config.descricao}` : '',
  'O arquivo achados.md lista problemas apontados por outro modelo. Os demais anexos são o código citado e os documentos do projeto (decisões já tomadas).',
  'Use SOMENTE os anexos. Não explore o repositório e não edite nada.',
  'Para cada achado, confira a evidência no código e tente refutá-lo. Uma decisão registrada nos documentos do projeto não é bug.',
  'Responda uma linha por ID: [A01] CONFIRMADO | REFUTADO: motivo | INCERTO: o que falta para decidir.',
  'Não proponha correções.',
].filter(Boolean).join(' '); // uma linha só: no Windows, quebra de linha corta o argumento no cmd

const saida = chamarOpencode(instrucao, anexos);

if (ausentes.length) console.log(`Arquivos citados que não existem (trate esses achados como REFUTADOS): ${ausentes.join(', ')}\n`);
console.log(saida);
