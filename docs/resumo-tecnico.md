# Resumo técnico do FluxoDocente

Este resumo descreve a implementação atual para apoiar a revisão do texto do TCC, substituindo as referências a Python, Django e Django REST Framework pela tecnologia efetivamente utilizada.

## Arquitetura

O front-end foi desenvolvido com React, TypeScript e Vite. A API utiliza Node.js 22, Express 5 e TypeScript, no mesmo repositório e pacote do front. Contas, sessões e conclusões de aulas são armazenadas em Postgres no Neon. Em produção, um serviço no Render entrega o front compilado e a API `/api` na mesma origem.

## Autenticação

As contas são pré-criadas pelo responsável pelo piloto, por script, sem cadastro público. As senhas são armazenadas como hashes derivados com scrypt e salt aleatório. A autenticação usa `express-session` e `connect-pg-simple`, com a sessão guardada no Postgres e o identificador no cookie `fd.sid`, HttpOnly, SameSite=Lax e Secure em produção. A sessão dura sete dias, sem renovação automática, e é invalidada no logout ou quando a senha muda.

## Progresso

A conclusão é autodeclarada pelo botão “Marcar como Concluído”; eventos do player não concluem aulas e não há opção de desmarcar. O banco mantém uma conclusão por aula e por usuário, preservando a primeira data quando a requisição é repetida. A porcentagem é calculada como (aulas concluídas / aulas publicadas no catálogo) × 100, tanto no total quanto em cada módulo. Esse indicador registra conclusão declarada e não mede domínio do conteúdo. Não há gamificação.

## Vídeos e catálogo

Os vídeos são apresentados por embed do YouTube, usando iframe de `youtube-nocookie.com`, sem hospedagem própria de mídia ou YouTube Data API. Módulos e aulas são definidos em `shared/catalog.ts`, com conteúdo fornecido pelos autores. O ID estável da aula é independente do identificador do vídeo, permitindo substituir o vídeo sem perder o progresso associado.

## Navegação

Cada tela e aula possui endereço próprio: `/`, `/cursos`, `/progresso` e `/aula/<id da aula>`. A navegação do front interpreta esses caminhos. Em produção, o Express serve os arquivos estáticos e devolve `index.html` como fallback para GETs fora de `/api`, permitindo acesso direto e recarregamento dessas páginas.

## Segurança

O dono do progresso é determinado pela sessão autenticada; nenhuma rota aceita um ID de usuário fornecido pelo cliente para escolher de quem consultar ou alterar o progresso. A proteção contra CSRF combina SameSite=Lax com a exigência do cabeçalho `X-FluxoDocente: 1` nas requisições que alteram estado. O `express-rate-limit` limita o login a dez tentativas por IP em quinze minutos, e o `helmet` configura cabeçalhos de segurança, incluindo a política de segurança de conteúdo.

## Acessibilidade

As combinações de cores do tema foram ajustadas para contraste AA. As barras de progresso expõem valores e descrições legíveis por leitores de tela.

## Limitações conhecidas

Não há recuperação de senha pelo próprio usuário: o responsável pelo piloto realiza o reset por script. O catálogo é editado no código, sem painel administrativo. Ainda não há anotações nem materiais em PDF. O deploy atual usa o plano gratuito do Render, que suspende o serviço após cerca de quinze minutos sem acesso e torna o primeiro acesso seguinte lento; a mudança para o plano pago está prevista antes da liberação aos docentes.
