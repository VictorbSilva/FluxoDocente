# Pasta .claude

Os hooks e scripts são iguais em todo projeto. O que muda de um projeto para outro fica só no `projeto.json`.

| Arquivo | O que faz |
|---|---|
| `settings.json` | Liga os três hooks no Claude Code |
| `hooks/pre-ferramenta.mjs` | Pede aprovação para editar arquivos listados; bloqueia commit e push nas branches protegidas |
| `hooks/pos-edicao.mjs` | Anota o arquivo editado e roda a checagem de tipos |
| `hooks/ao-parar.mjs` | Antes de o Claude encerrar, roda os scripts do npm de `aoParar` |
| `scripts/verificar-achados.mjs` | Fase 2 da auditoria: um modelo do Abacus tenta refutar os achados |
| `scripts/revisar-pr.mjs` | Revisão da branch pelo Abacus antes do merge |
| `lib/projeto.mjs` | Lê o `projeto.json` e preenche os valores padrão |

Os scripts do Abacus precisam da variável `ABACUS_VERIFICADOR` com o nome do modelo (veja `opencode models`).

## Campos do projeto.json

Os campos com lista de padrões usam expressões regulares sobre o caminho relativo à raiz, sempre com `/`.

- **descricao**: uma frase sobre o projeto; vai para o modelo que revisa.
- **branchesProtegidas**: onde commit e push são bloqueados. Padrão: `main` e `master`.
- **aprovarAntesDeEditar**: arquivos cuja edição pede sua aprovação (ex.: `"(^|/)firestore\\.rules$"`).
- **checagemDeTipos.comando**: comando rodado após editar código. Omita o campo para desligar.
- **checagemDeTipos.ignorarErrosEm**: pastas com erros antigos que não são da tarefa. Erros do próprio arquivo editado aparecem mesmo assim.
- **checagemDeTipos.seMudar**: quais arquivos disparam a checagem. Padrão: `\.tsx?$`.
- **aoParar**: lista de `{ "seMudar", "script", "avisoSeFaltar" }`. Se algum arquivo editado casa com `seMudar`, roda `npm run <script>`; se falhar, o Claude não encerra. Sem o script no `package.json`, mostra `avisoSeFaltar` (se houver) ou ignora.
- **revisao.base**: com o que a branch é comparada. Padrão: `origin/main`.
- **revisao.sensiveis**: quais arquivos disparam a revisão. Omita para revisar qualquer arquivo alterado.
- **revisao.ignorar**: arquivos nunca enviados (padrão: lockfiles).
- **revisao.focos**: o que o revisor deve procurar neste projeto.
- **revisao.documentos**: documentos sempre anexados (padrão: `CLAUDE.md`).
- **revisao.armadilhas**: `{ "documento", "arquivos" }`. O documento vai junto quando algum desses arquivos muda.
- **revisao.anexarInteiro**: arquivos enviados inteiros, não só o diff.

## Exemplo de outro perfil (Crediário)

```json
{
  "aprovarAntesDeEditar": ["^firestore\\.rules$"],
  "checagemDeTipos": { "comando": "npx tsc -b" },
  "aoParar": [
    { "seMudar": "\\.[jt]sx?$", "script": "lint" },
    { "seMudar": "\\.[jt]sx?$", "script": "test" },
    { "seMudar": "^firestore\\.rules$", "script": "test:rules",
      "avisoSeFaltar": "firestore.rules mudou e não há script test:rules." }
  ],
  "revisao": {
    "armadilhas": { "documento": "docs/armadilhas.md",
      "arquivos": ["^vite\\.config\\.ts$", "^src/lib/firebase\\.ts$", "^pwa-assets\\.config\\.ts$", "^firestore\\.rules$"] },
    "anexarInteiro": ["^firestore\\.rules$"]
  }
}
```
