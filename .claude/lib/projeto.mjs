// Peças comuns a todos os hooks e scripts: ler a entrada do Claude Code,
// achar a raiz do projeto e carregar o .claude/projeto.json.
// Tudo o que muda de um projeto para outro fica no projeto.json, não aqui.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Valores usados quando o projeto.json não define o campo.
const PADRAO = {
  descricao: '',
  branchesProtegidas: ['main', 'master'],
  aprovarAntesDeEditar: [],
  checagemDeTipos: null,
  aoParar: [],
  revisao: {
    base: 'origin/main',
    sensiveis: null, // null = qualquer arquivo alterado (menos os de "ignorar")
    ignorar: ['(^|/)package-lock\\.json$', '(^|/)pnpm-lock\\.yaml$', '(^|/)yarn\\.lock$'],
    focos: [],
    documentos: ['CLAUDE.md'],
    armadilhas: null,
    anexarInteiro: [],
  },
};

export async function lerEntrada() {
  let bruto = '';
  for await (const pedaco of process.stdin) bruto += pedaco;
  return bruto.trim() ? JSON.parse(bruto) : {};
}

export function raizDoProjeto(cwd) {
  return process.env.CLAUDE_PROJECT_DIR ?? cwd ?? process.cwd();
}

export function carregarConfig(raiz) {
  const arquivo = path.join(raiz, '.claude', 'projeto.json');
  const lido = fs.existsSync(arquivo) ? JSON.parse(fs.readFileSync(arquivo, 'utf8')) : {};
  return { ...PADRAO, ...lido, revisao: { ...PADRAO.revisao, ...(lido.revisao ?? {}) } };
}

// Caminho relativo à raiz, sempre com "/" (no Windows o Claude Code manda "\").
export function relativo(raiz, arquivo) {
  return path.relative(raiz, path.resolve(raiz, arquivo)).split(path.sep).join('/');
}

// As listas do projeto.json são expressões regulares escritas como texto.
export const casaAlguma = (padroes, texto) => padroes.some((p) => new RegExp(p).test(texto));

// Onde o pos-edicao.mjs anota os arquivos editados, para o ao-parar.mjs ler.
export function marcadorDaSessao(sessionId) {
  const id = String(sessionId).replace(/[^\w-]/g, '');
  return path.join(os.tmpdir(), `claude-editados-${id}.txt`);
}
