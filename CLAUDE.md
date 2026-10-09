# CLAUDE.md

Orientação para o Claude Code neste repositório.

## Projeto

**FluxoDocente**: site instrucional do TCC de Victor sobre letramento digital de docentes do ensino superior em ferramentas de IA. A base foi gerada no Figma Make (veja `src/app/Attributions.md`: componentes shadcn/ui e fotos do Unsplash).

- Front-end em `src/`, ligado à API Node + Express + TypeScript em `server/`. O login é real, com sessão no Postgres, e o progresso por aula é salvo no banco para o usuário autenticado. Tipos e catálogo de módulos e aulas ficam em `shared/`.
- `src/app/App.tsx` controla a interface, a autenticação e o progresso recebido da API. As telas e aulas têm endereços próprios: `/`, `/cursos`, `/progresso` e `/aula/<id da aula>`. Não há anotações nem materiais em PDF.
- O Render serve o front compilado e a API `/api` na mesma origem. O deploy atual usa o plano gratuito, região Virginia; a troca para o plano pago está prevista antes da liberação aos docentes. O banco é Postgres no Neon (`aws-us-east-1`), com branches `main`, `dev` e `test`.

## Stack

React 18, Vite 6, TypeScript 5.8 (`strict: false` no front), Tailwind 4 via `@tailwindcss/vite`, `sonner` para toasts, `lucide-react` para ícones. Backend em Node 22 + Express 5, Postgres (Neon), `express-session` + `connect-pg-simple` para sessões, `helmet` para cabeçalhos de segurança e `express-rate-limit` para limitar tentativas de login.

## Estrutura

- `src/main.tsx` monta o `App` e importa `src/styles/index.css`.
- `src/app/App.tsx` controla as seções e o estado.
- `src/app/lib/api.ts`: requisições à API, login, sessão atual, logout e progresso, com tratamento de erros e cabeçalho de proteção contra CSRF.
- `src/app/lib/rotas.ts`: converte os endereços das telas e aulas para o estado de navegação e vice-versa.
- `shared/contracts.ts`: tipos de módulos, aulas e contratos de usuário, progresso e erros da API.
- `shared/catalog.ts`: catálogo de módulos e aulas, com IDs de aula estáveis e identificadores de vídeos do YouTube.
- `server/app.ts`: monta o Express, os cabeçalhos de segurança, a proteção contra CSRF, as sessões, as rotas `/api` e o front estático com fallback para `index.html` em produção.
- `server/config.ts`: carrega o `.env` fora de produção e lê porta, URL do banco e segredo de sessão.
- `server/index.ts`: inicia o servidor com o pool do banco e o catálogo.
- `server/auth/`: login, sessão atual, logout, hash de senha com scrypt e verificação de sessão.
- `server/progresso/`: consulta e conclusão de aulas para o dono da sessão.
- `server/db/`: pool do Postgres e aplicação das migrações.
- `server/migrations/`: migrações SQL de contas, sessões e conclusões de aulas.
- `server/usuarios.ts`: criação e listagem de contas, geração de senha e reset com revogação das sessões.
- `server/scripts/`: comandos de migração e administração de contas.
- `server/tests/`: testes do servidor e do catálogo; usam `TEST_DATABASE_URL` e apagam os dados desse banco.
- `src/app/components/*.tsx`: as seções do site (`Header`, `HeroSection`, `LoginSection`, `CategoryGrid`, `VideoPlayer`, `ProgressSection`).
- `src/app/components/ui/`: componentes shadcn/ui gerados em lote. Vários importam pacotes que não estão instalados, por isso a checagem de tipos acusa erros **só nessa pasta**. O build passa porque o Vite só empacota o que é importado. Não corrija esses erros como efeito colateral de outra tarefa; se um desses componentes passar a ser usado, instale o pacote dele.
- `src/styles/fluxodocente-theme.css`: paleta do projeto (variáveis `--fd-*` e os tokens de tema).
- `guidelines/Guidelines.md` é o modelo vazio do Figma Make: não contém regras.

## Comandos

- `npm run dev`: servidor Vite de desenvolvimento do front.
- `npm run dev:server`: API em desenvolvimento, com recarga via `tsx watch`.
- `npm run build`: gera o front em `dist/` e compila o servidor em `dist-server/`. Checa tipos do servidor, mas não os do front.
- `npm run preview`: serve o build do front pelo Vite.
- `npm start`: inicia o servidor compilado; em produção, serve também o front.
- `npm run typecheck:server`: checa os tipos do servidor sem gerar arquivos.
- `npm run db:migrar`: aplica migrações usando `DATABASE_URL`, via TypeScript.
- `npm run db:migrar:prod`: aplica migrações com o script compilado.
- `npm run usuarios -- criar <email>`: cria conta e mostra uma senha aleatória uma vez.
- `npm.cmd run usuarios -- criar <email> --escolher-senha`: cria conta com senha digitada e confirmada.
- `npm run usuarios -- resetar <email>`: troca a senha e encerra as sessões da conta; aceita `--escolher-senha` com `npm.cmd`.
- `npm run usuarios -- listar`: lista e-mails e datas de criação.
- `npm test`: testes do servidor e do catálogo.
- Checagem de tipos do front: `npx tsc --noEmit -p tsconfig.json` (os erros esperados estão todos em `src/app/components/ui/`).

No PowerShell, o `npm` engole opções como `--escolher-senha`; use `npm.cmd` ao passá-las. Para os passos de ambiente, contas e deploy, consulte `README-RODAR.md`.

Testes do servidor: `npm test` (precisa de `TEST_DATABASE_URL`). O front não tem testes nem lint.

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
