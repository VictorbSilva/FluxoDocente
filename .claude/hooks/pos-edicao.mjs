// PostToolUse: roda DEPOIS de cada Edit/Write/MultiEdit.
// 1. Anota o arquivo editado (o hook de Stop usa essa lista).
// 2. Se o projeto tiver "checagemDeTipos", roda o comando e devolve ao Claude
//    só os erros que importam: os do arquivo editado e os de fora das pastas
//    listadas em "ignorarErrosEm" (erros antigos que não são desta tarefa).
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { carregarConfig, casaAlguma, lerEntrada, marcadorDaSessao, raizDoProjeto, relativo } from '../lib/projeto.mjs';

const { session_id, tool_input = {}, cwd } = await lerEntrada();
if (!tool_input.file_path) process.exit(0);

const raiz = raizDoProjeto(cwd);
const config = carregarConfig(raiz);
const editado = relativo(raiz, tool_input.file_path);

// --- 1. Anota a edição desta sessão ---------------------------------------
fs.appendFileSync(marcadorDaSessao(session_id), editado + '\n');

// --- 2. Checagem de tipos --------------------------------------------------
const tipos = config.checagemDeTipos;
if (!tipos?.comando || !new RegExp(tipos.seMudar ?? '\\.tsx?$').test(editado)) process.exit(0);

const r = spawnSync(tipos.comando, { cwd: raiz, shell: true, encoding: 'utf8' });
if (r.status === 0) process.exit(0);

// Formatos do tsc: "src/a.tsx(10,5): error TS..." ou "src/a.tsx:10:5 - error TS..."
const linhas = (r.stdout + r.stderr).split(/\r?\n/);
const erros = linhas
  .map((linha) => ({ linha, arquivo: linha.match(/^(.+?)(?:\(\d+,\d+\)|:\d+:\d+)\s*[:-]\s*error\b/)?.[1] }))
  .filter((e) => e.arquivo)
  .map((e) => ({ ...e, arquivo: relativo(raiz, e.arquivo) }));

if (erros.length === 0) {
  // O comando falhou sem erro reconhecível (ex.: tsc não instalado): avisa você, não o Claude.
  console.log(JSON.stringify({ systemMessage: `A checagem de tipos não rodou: ${(r.stdout + r.stderr).trim().slice(0, 300)}` }));
  process.exit(0);
}

const ignorar = (tipos.ignorarErrosEm ?? []).map((p) => p.replace(/\\/g, '/'));
const relevantes = erros.filter((e) => e.arquivo === editado || !ignorar.some((p) => e.arquivo.startsWith(p)));
if (relevantes.length === 0) process.exit(0);

console.error(`Erros de tipo após editar ${editado}:\n${relevantes.map((e) => e.linha).join('\n').slice(0, 4000)}`);
process.exit(2); // exit 2 = mostra a mensagem ao Claude, que corrige em seguida
