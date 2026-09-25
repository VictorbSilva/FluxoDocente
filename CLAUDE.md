# CLAUDE.md

Orientação para o Claude Code neste repositório.

## Projeto

**FluxoDocente**: site instrucional do TCC de Victor sobre letramento digital de docentes do ensino superior em ferramentas de IA. A base foi gerada no Figma Make (veja `src/app/Attributions.md`: componentes shadcn/ui e fotos do Unsplash).

- Só front-end, sem backend. O login (`LoginSection`) é apenas interface: não há autenticação real.
- O estado fica em `useState` no `src/app/App.tsx` (autenticação, seção atual, vídeo selecionado, progresso do usuário). Vídeos e progresso são **dados de exemplo** declarados ali.

## Stack

React 18, Vite 6, TypeScript 5.8 (`strict: false`), Tailwind 4 via `@tailwindcss/vite`, `sonner` para toasts, `lucide-react` para ícones.

## Estrutura

- `src/main.tsx` monta o `App` e importa `src/styles/index.css`.
- `src/app/App.tsx` controla as seções e o estado.
- `src/app/components/*.tsx`: as seções do site (`Header`, `HeroSection`, `LoginSection`, `CategoryGrid`, `VideoPlayer`, `ProgressSection`).
- `src/app/components/ui/`: componentes shadcn/ui gerados em lote. Vários importam pacotes que não estão instalados, por isso a checagem de tipos acusa erros **só nessa pasta**. O build passa porque o Vite só empacota o que é importado. Não corrija esses erros como efeito colateral de outra tarefa; se um desses componentes passar a ser usado, instale o pacote dele.
- `src/styles/fluxodocente-theme.css`: paleta do projeto (variáveis `--fd-*` e os tokens de tema).
- `guidelines/Guidelines.md` é o modelo vazio do Figma Make: não contém regras.

## Comandos

- `npm run dev`: servidor de desenvolvimento
- `npm run build`: build de produção. **Não checa tipos** (é só `vite build`).
- `npm run preview`: serve o build
- Checagem de tipos: `npx tsc --noEmit -p tsconfig.json` (os erros esperados estão todos em `src/app/components/ui/`)
- Não há testes nem lint configurados.

## Fluxo de trabalho

- Toda alteração vai numa branch, nunca direto na `main` (decidido após os conflitos do commit `8e8aa42`).
- Revisão antes do merge: `node .claude/scripts/revisar-pr.mjs`.

## Regras de trabalho

- Não invente conteúdo instrucional (textos, categorias, vídeos, instrutores). É conteúdo do TCC e vem do Victor; quando faltar, deixe marcado e pergunte.
- Textos da interface em português do Brasil.

## Decisões travadas

Nenhuma registrada ainda. Registre aqui cada decisão que não deve ser reaberta, com o motivo.
