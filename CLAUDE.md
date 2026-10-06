# CLAUDE.md

Orientação para o Claude Code neste repositório.

## Projeto

**FluxoDocente**: site instrucional do TCC de Victor sobre letramento digital de docentes do ensino superior em ferramentas de IA. A base foi gerada no Figma Make (veja `src/app/Attributions.md`: componentes shadcn/ui e fotos do Unsplash).

- Front-end em `src/`. Backend Node + Express + TypeScript em `server/`, com tipos e catálogo compartilhados em `shared/`, em construção até 09/10. Enquanto o front não estiver ligado à API, o login (`LoginSection`) é só interface.
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
- Nos commits, não adicione link de sessão (`Claude-Session: ...`) nem linha `Co-Authored-By` do assistente.

## Regras de trabalho

- Não invente conteúdo instrucional (textos, categorias, vídeos, instrutores). É conteúdo do TCC e vem do Victor; quando faltar, deixe marcado e pergunte.
- Textos da interface em português do Brasil.

## Decisões travadas

1. Backend em Node + Express + TypeScript, no mesmo repositório e no mesmo `package.json` do front. Motivo: mesma linguagem do front, custo menor e é o que Victor usa no dia a dia. O texto do TCC, que cita Django, será corrigido no texto.
2. Render (web service pago) serve o front compilado e a API `/api` na mesma origem; banco Neon Postgres no plano gratuito. Motivo: uma origem só dispensa CORS e simplifica o cookie.
3. Sessão com `express-session` + `connect-pg-simple` no Postgres; cookie `fd.sid` HttpOnly, SameSite=Lax, Secure em produção, 7 dias, sem renovação automática. Motivo: sessão revogável no logout e no reset de senha.
4. Contas pré-criadas por script; sem cadastro público e sem recuperação de senha por e-mail. O reset é feito por Victor. Motivo: piloto fechado e prazo.
5. Conclusão de aula é autodeclarada pelo botão "Marcar como Concluído". Nenhum evento do player conclui aula e não existe "desmarcar". Motivo: não inventar regra pedagógica.
6. Sem gamificação: pontos, níveis, certificados, metas, sequências, recorde e anotações de exemplo saem da interface. Fica o progresso por aula e por módulo.
7. Vídeos pelo embed do YouTube (iframe de `youtube-nocookie.com`), sem YouTube Data API e sem hospedagem de mídia.
8. Catálogo de módulos e aulas em `shared/catalog.ts`, com conteúdo fornecido pelos autores. O ID da aula é um slug estável, nunca o ID do vídeo. Motivo: trocar o vídeo não pode apagar o progresso.
9. O dono do progresso vem sempre da sessão. Nenhuma rota aceita `userId` no corpo, na query ou no caminho.
