# Como rodar o FluxoDocente

Execute os comandos na raiz do repositório. Os exemplos de ambiente abaixo usam PowerShell.

## 1. Pré-requisitos

- Node.js **22.x**, com npm.
- Acesso ao projeto Postgres no Neon, região `aws-us-east-1`, e às URLs de conexão das branches `main` (produção), `dev` (desenvolvimento) e `test` (testes). A branch de testes deve ser exclusiva para dados descartáveis.

## 2. Configurar o ambiente

Copie `.env.example` para `.env`:

```powershell
Copy-Item .env.example .env
```

Preencha as variáveis:

| Variável | Uso |
| --- | --- |
| `PORT` | Porta da API local; mantenha `3001` para o desenvolvimento. |
| `DATABASE_URL` | URL de conexão da branch `dev`; usada pelo servidor, pelas migrações e pelo script de contas. |
| `TEST_DATABASE_URL` | URL da branch `test`; os testes apagam os dados desse banco. Nunca use a URL de `main` ou `dev` aqui. |
| `SESSION_SECRET` | Segredo que assina o cookie de sessão, com pelo menos 32 caracteres. |

Gere o segredo e copie a saída para `SESSION_SECRET`:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Nas URLs do Neon, usar `sslmode=verify-full` evita o aviso de SSL do `pg`. Não publique o `.env` nem as URLs e os segredos.

Fora de produção, os scripts carregam o `.env`. Com `NODE_ENV=production`, as variáveis precisam ser fornecidas pelo ambiente; o arquivo não é carregado automaticamente.

## 3. Instalar dependências e aplicar migrações

```powershell
npm install
npm run db:migrar
```

A migração imprime o host do banco e aplica somente os arquivos SQL ainda não registrados. Confira que o host corresponde à branch `dev`.

## 4. Criar e administrar contas locais

Não há cadastro público. Para criar uma conta com senha aleatória:

```powershell
npm run usuarios -- criar <email>
```

Substitua `<email>` pelo endereço da conta, sem os sinais de menor e maior. A senha aparece uma vez no terminal: anote-a nesse momento. O banco guarda somente o hash.

Para digitar e confirmar a senha:

```powershell
npm.cmd run usuarios -- criar <email> --escolher-senha
```

A senha escolhida deve ter de 8 a 200 caracteres. No PowerShell, `npm` engole opções como `--escolher-senha`; use `npm.cmd` quando passar essa opção.

Para trocar a senha e encerrar as sessões da conta, use uma das alternativas:

```powershell
npm run usuarios -- resetar <email>
npm.cmd run usuarios -- resetar <email> --escolher-senha
```

Sem a opção, o reset gera e mostra uma nova senha aleatória. Para listar e-mails e datas de criação:

```powershell
npm run usuarios -- listar
```

## 5. Rodar em desenvolvimento

No primeiro terminal, inicie o front:

```powershell
npm run dev
```

No segundo terminal, inicie a API:

```powershell
npm run dev:server
```

Abra o endereço informado pelo Vite, normalmente `http://localhost:5173`. A API usa a porta `3001`. Faça login com uma das contas criadas.

As telas têm endereços próprios: `/`, `/cursos`, `/progresso` e `/aula/<id da aula>`, por exemplo `/aula/m1-a01`.

## 6. Rodar os testes

```powershell
npm test
```

Os testes do servidor usam `TEST_DATABASE_URL`, aplicam as migrações e **apagam contas, sessões e conclusões desse banco**. Confira que a URL aponta para a branch `test` antes de executar. O front não tem testes nem lint.

## 7. Build e execução local em modo produção

```powershell
npm run build
```

O build gera o front em `dist/` e compila o servidor e os arquivos compartilhados em `dist-server/`. Ele checa os tipos do servidor, mas não os do front.

Para executar o build localmente, forneça as variáveis no terminal. Use a branch `dev` neste ensaio e o segredo gerado anteriormente:

```powershell
$env:NODE_ENV="production"
$env:PORT="3001"
$env:DATABASE_URL="<url da branch dev>"
$env:SESSION_SECRET="<segredo gerado>"
npm run db:migrar:prod
npm start
```

Abra `http://localhost:3001`. O Express serve o front e `/api` na mesma origem; para GETs fora de `/api`, serve os arquivos estáticos e devolve `index.html` como fallback, permitindo abrir diretamente as telas e aulas. O cookie de sessão usa `Secure` em produção; o acesso publicado no Render é por HTTPS.

Depois de encerrar com `Ctrl+C`, limpe as variáveis deste ensaio para voltar ao ambiente do `.env`:

```powershell
Remove-Item Env:NODE_ENV, Env:PORT, Env:DATABASE_URL, Env:SESSION_SECRET
```

## 8. Acrescentar aulas

Edite o array `lessons` em `shared/catalog.ts`, usando o conteúdo aprovado pelos autores. Cada aula tem `id`, `moduleId`, `youtubeId` e `title`; os demais campos definidos em `shared/contracts.ts` são opcionais.

- Use o ID `m<módulo>-a<ordem com dois dígitos>`, como `m1-a01`. Depois de publicado, ele nunca deve ser renumerado: o progresso é ligado a esse ID, não ao vídeo.
- `moduleId` deve corresponder a um módulo do array `modules`.
- Em `youtubeId`, copie os **11 caracteres** do identificador do vídeo no link, sem a URL completa.
- A ordem do array é a ordem de exibição das aulas dentro do módulo. Reordenar o array não exige mudar os IDs.

Depois de editar, confira o catálogo e o servidor:

```powershell
npm test
```

Para publicar a alteração, gere um novo build e deploy. Os vídeos usam embed do YouTube; não há hospedagem própria de mídia.

## 9. Deploy no Render

O deploy atual é um **Web Service no plano gratuito**, região **Virginia**, com front e API na mesma origem. Configure:

| Campo | Valor |
| --- | --- |
| Build Command | `npm ci --include=dev && npm run build` |
| Start Command | `npm run db:migrar:prod && npm start` |
| Health Check Path | `/api/health` |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | URL **pooled** da branch `main` do Neon |
| `SESSION_SECRET` | Segredo gerado para produção, com pelo menos 32 caracteres |

O Render fornece a porta por `PORT`. Não configure `TEST_DATABASE_URL` para servir o site.

O plano gratuito não tem Pre-Deploy Command, por isso as migrações ficam no Start Command. O serviço dorme depois de cerca de 15 minutos sem acesso e o primeiro acesso seguinte demora.

**Antes de liberar o site aos docentes**, troque para o plano pago em **Settings → Instance Type**. Depois da troca, a migração pode ir para o Pre-Deploy Command (`npm run db:migrar:prod`), deixando o Start Command como `npm start`.

## 10. Criar e resetar contas em produção

Na sua máquina, com as dependências instaladas, sobrescreva temporariamente `DATABASE_URL` no PowerShell. Substitua a URL pela conexão pooled da branch `main`:

```powershell
$env:DATABASE_URL="<url da branch main>"
npm run usuarios -- listar
```

Confira o host impresso em `Banco:` e compare-o com o endpoint da branch `main` no Neon. Para criar ou resetar uma conta, escolha o comando correspondente:

```powershell
npm run usuarios -- criar <email>
npm.cmd run usuarios -- criar <email> --escolher-senha
npm run usuarios -- resetar <email>
npm.cmd run usuarios -- resetar <email> --escolher-senha
```

Cada execução imprime o host; confira que continua sendo o da produção. O reset encerra as sessões da conta. Ao terminar, inclusive se o comando falhar, remova a variável temporária para voltar à URL do `.env`:

```powershell
Remove-Item Env:DATABASE_URL
```

## 11. Backup e retorno de versão

Antes de uma alteração de banco, crie uma branch no Neon **a partir da `main`** para guardar uma cópia do estado naquele momento.

Para voltar o código à versão anterior, abra **Render → Events → Rollback** no deploy anterior. O rollback do deploy não desfaz alterações no banco; a branch de backup é a cópia separada dos dados.
