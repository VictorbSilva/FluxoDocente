import type { PraticaGuiada } from './contracts.js';

// Texto dos cadernos de exercícios práticos enviados pela equipe (30/10).
export const praticas: PraticaGuiada[] = [
  {
    moduleId: 'modulo-1',
    pdf: '/materiais/pratica-modulo-1.pdf',
    objetivo:
      'transformar o uso intuitivo da IA em um procedimento verificável, responsável e otimizado para o cotidiano acadêmico. Os cinco exercícios a seguir reúnem, de forma integrada, todos os conceitos neste módulo — execute cada um, anote suas observações e, ao final, monte seu kit pessoal de prompts.',
    exercicios: [
      {
        titulo: 'Estrutura e persona: a base do bom prompt',
        resumo: 'A estrutura e o papel atribuído à IA transformam completamente a qualidade da resposta.',
        tarefas: [
          'Escreva um prompt vago ("Crie uma atividade sobre [TEMA]") e reescreva-o com os cinco campos — Persona, Contexto, Tarefa, Formato e Restrições. Compare as respostas.',
          'Repita o pedido pedindo à IA que assuma três personas distintas (ex.: pesquisador, professor do fundamental, jornalista) e registre como muda o tom e a profundidade.',
        ],
      },
      {
        titulo: 'Exemplos e etapas: guiando a IA',
        resumo: 'Mostrar um modelo e dividir a tarefa em partes gera resultados muito mais precisos.',
        tarefas: [
          'Insira no prompt um exemplo de material seu ("no mesmo estilo deste exemplo") e compare com o mesmo pedido feito sem o exemplo.',
          'Peça um plano de aula completo em um único comando; depois solicite etapa por etapa (objetivos → introdução → atividade → avaliação) e compare os resultados.',
        ],
      },
      {
        titulo: 'Diálogo e refinamento com a IA',
        resumo: 'O primeiro resultado raramente é o ideal — refine e deixe a IA perguntar antes de responder.',
        tarefas: [
          'Faça ao menos quatro rodadas de ajuste na mesma conversa (ex.: "mais curto", "menos formal", "acrescente exemplos") e anote o que melhora ou piora a cada rodada.',
          'Instrua a IA a fazer perguntas antes de gerar a resposta final e registre como isso personaliza o material ao seu contexto.',
        ],
      },
      {
        titulo: 'Alucinações e mitos',
        resumo: 'Nunca use conteúdo gerado sem verificar — a IA erra, inventa e nem sempre repete a mesma resposta.',
        tarefas: [
          'Peça um texto com dados factuais e fontes; verifique cada dado em fontes confiáveis e marque erros ou invenções (alucinações).',
          'Teste três mitos: (a) a IA sempre acerta; (b) ela pesquisa em tempo real; (c) a resposta é sempre idêntica para o mesmo prompt. Anote suas conclusões.',
        ],
      },
      {
        titulo: 'Uso ético e seu kit pessoal de prompts',
        resumo: 'Atividade de conclusão: proteja os dados e consolide o que aprendeu em modelos reutilizáveis.',
        tarefas: [
          'Pratique a anonimização de dados sensíveis (nomes de alunos, laudos, nome da escola) e crie um "filtro de segurança" pessoal para revisar pedidos antes de enviá-los.',
          'Selecione seus prompts "campeões" dos exercícios anteriores e transforme-os em modelos reutilizáveis com campos variáveis (ex.: [TEMA], [TURMA], [FORMATO]). Registre ao menos cinco.',
        ],
      },
    ],
    checklist: [
      'A informação foi verificada em fonte confiável?',
      'O conteúdo está livre de vieses e adequado ao público?',
      'Os dados sensíveis foram anonimizados (LGPD)?',
      'O material está alinhado ao seu objetivo pedagógico?',
    ],
    reflexao: [
      'Quando o uso de IA melhora o trabalho do professor e quando ele começa a substituir decisões que deveriam ser pedagógicas?',
      'Até que ponto, como professor, devo confiar em uma resposta que parece convincente?',
    ],
  },
  {
    moduleId: 'modulo-2',
    pdf: '/materiais/pratica-modulo-2.pdf',
    objetivo:
      'transformar um tema real da ementa em um plano de aula e uma apresentação, com fontes verificadas e revisão docente. Os cinco exercícios conectam pesquisa, planejamento e produção visual. Use o mesmo tema em todas as etapas, anote suas observações e registre o tempo de preparação e revisão.',
    exercicios: [
      {
        titulo: 'Tema e fontes: a base de um planejamento confiável',
        resumo: 'Um tema bem delimitado e fontes conferidas dão consistência à aula.',
        foco: 'BUSCA VERIFICADA + CURADORIA DOCENTE',
        tarefas: [
          'Escolha um tópico da sua ementa e indique curso, turma e conhecimentos prévios. Use Perplexity ou outra ferramenta de busca para localizar três fontes relevantes e levantar três afirmações centrais sobre o tema.',
          'Abra cada fonte e confira autoria, data e contexto. Compare as três afirmações com os trechos originais. Registre título, link, trecho de apoio e decisão: manter, corrigir ou descartar. Ajuste o conteúdo ao nível da turma.',
        ],
      },
      {
        titulo: 'Do tema ao plano: objetivos, etapas e tempo',
        resumo: 'O plano precisa ligar o que o aluno fará ao que você pretende ensinar.',
        foco: 'ALINHAMENTO PEDAGÓGICO + SEQUÊNCIA DIDÁTICA',
        tarefas: [
          'Com ChatGPT ou Gemini, crie um plano de 60 minutos a partir do conteúdo verificado. Informe tema, turma, dois objetivos observáveis, recursos disponíveis e restrições. Peça etapas, tempo e atividade de fechamento.',
          'Confira se os tempos somam 60 minutos e se a atividade permite observar os objetivos. Ajuste exemplos e dificuldades previstas. Inclua uma alternativa sem internet e mantenha as referências no plano final.',
        ],
      },
      {
        titulo: 'Do plano aos slides: clareza e sequência',
        resumo: 'A apresentação deve orientar a aula e facilitar a compreensão.',
        foco: 'ROTEIRO VISUAL + DESIGN INSTRUCIONAL',
        tarefas: [
          'Transforme o plano revisado em um roteiro de seis a oito slides: abertura, desenvolvimento, síntese e atividade. Para cada slide, indique título, ideia central, texto curto e função do visual; separe as notas da fala docente.',
          'Leve o roteiro ao Gamma ou a outra ferramenta de apresentação. Revise sequência, contraste, tamanho da fonte e excesso de texto. Confira se os slides preservam os objetivos e as fontes; salve uma versão editável e exporte em PDF.',
        ],
      },
      {
        titulo: 'Imagem com função: explicar, não apenas decorar',
        resumo: 'Um visual útil esclarece um conceito sem criar confusão ou estereótipos.',
        foco: 'PROMPT VISUAL + REVISÃO CRÍTICA',
        tarefas: [
          'Escolha um conceito da aula e escreva um prompt visual com sujeito, contexto, estilo, composição e restrições. Gere duas versões ou selecione imagens de uso permitido; explique qual delas ajuda melhor a ensinar o conceito.',
          'Revise erros, simplificações, estereótipos e condições de uso. Para dados ou diagramas, prefira um visual construído com informações verificadas. Adicione legenda, fonte quando aplicável e uma descrição textual acessível.',
        ],
      },
      {
        titulo: 'Revisão final: qualidade, tempo e reutilização',
        resumo: 'Economizar tempo só faz sentido quando a aula continua adequada à turma.',
        foco: 'TESTE PRÁTICO + MELHORIA DO FLUXO',
        tarefas: [
          'Simule cinco minutos da aula com o plano e os slides. Confira clareza, fontes, atividade final e coerência dos exemplos. Corrija problemas encontrados e registre duas decisões pedagógicas que exigiram sua intervenção.',
          'Registre o tempo de busca, planejamento, slides e revisão; compare o total com seu tempo habitual, indicando se foi estimado. Entregue plano com fontes e apresentação revisada. Salve os prompts úteis com [TEMA], [TURMA] e [DURAÇÃO].',
        ],
      },
    ],
    checklist: [
      'As fontes existem e sustentam as afirmações utilizadas?',
      'Objetivos, atividades e tempo estão alinhados ao nível da turma?',
      'Os slides têm uma ideia central, texto legível e sequência clara?',
      'As imagens ajudam a ensinar e foram revisadas quanto a vieses e uso?',
      'O plano e a apresentação passaram pela revisão final do docente?',
    ],
    reflexao: [
      'Quais decisões sobre objetivos, atividades e adequação à turma devem permanecer sob minha responsabilidade ao usar IA no planejamento?',
      'Como posso verificar se o tempo economizado com IA resultou em uma aula mais clara e coerente, sem comprometer as fontes e a aprendizagem?',
    ],
  },
  {
    moduleId: 'modulo-3',
    pdf: '/materiais/pratica-modulo-3.pdf',
    objetivo:
      'criar uma avaliação alinhada ao conteúdo da disciplina, com questões em diferentes níveis cognitivos, rubrica e feedback revisado. Os cinco exercícios conectam elaboração, revisão e correção assistida. Use o conteúdo verificado do Módulo 2 e respostas fictícias; registre suas decisões e o tempo de trabalho.',
    exercicios: [
      {
        titulo: 'Questões com propósito: variar a exigência cognitiva',
        resumo: 'Cada questão deve exigir uma ação coerente com o objetivo de aprendizagem.',
        foco: 'TAXONOMIA DE BLOOM + ALINHAMENTO AOS OBJETIVOS',
        tarefas: [
          'Selecione um conteúdo já trabalhado com a turma e defina três objetivos. Com ChatGPT ou Claude, gere seis questões: duas para lembrar, duas para aplicar e duas para analisar. Varie entre múltipla escolha, problemas e estudos de caso.',
          'Informe conteúdo-base, nível da turma, formato e restrições. Peça gabarito comentado e critérios para as respostas abertas. Confira se a ação exigida corresponde ao nível proposto; o verbo do enunciado, sozinho, não garante esse nível.',
        ],
      },
      {
        titulo: 'Revisão dos itens: clareza, rigor e acessibilidade',
        resumo: 'Uma questão precisa avaliar o conteúdo sem criar obstáculos desnecessários.',
        foco: 'CURADORIA CRÍTICA + ADAPTAÇÃO INCLUSIVA',
        tarefas: [
          'Revise as seis questões: confira fatos, clareza, viés e gabarito. Nos itens de resposta única, verifique se há apenas uma alternativa correta e se os distratores são plausíveis. Reescreva dois itens e registre o motivo das alterações.',
          'Adapte um item para reduzir barreiras: explique termos, organize as instruções ou descreva um visual. Preserve o objetivo e a exigência cognitiva. Resolva a avaliação como aluno e estime se o tempo previsto é suficiente.',
        ],
      },
      {
        titulo: 'Rubrica: tornar os critérios visíveis',
        resumo: 'A rubrica comunica o que será observado e ajuda a manter a consistência.',
        foco: 'CRITÉRIOS + NÍVEIS + DESCRITORES OBSERVÁVEIS',
        tarefas: [
          'Escolha uma questão discursiva ou um estudo de caso. Parta dos critérios que você já usa e peça à IA uma rubrica em tabela com três critérios, três níveis de desempenho e descritores que indiquem evidências observáveis.',
          'Defina pesos que somem dez pontos e explique como pontuar cada nível. Teste a rubrica em duas respostas fictícias de qualidades diferentes. Corrija descritores vagos e confira se a pontuação representa o objetivo da atividade.',
        ],
      },
      {
        titulo: 'Feedback assistido: evidência e próximo passo',
        resumo: 'Uma devolutiva útil mostra o que melhorar e como avançar.',
        foco: 'PRÉ-PREENCHIMENTO + REVISÃO DOCENTE',
        tarefas: [
          'Use três respostas fictícias e a rubrica revisada. Peça à IA um rascunho para cada resposta com ponto forte, aspecto a melhorar e próximo passo concreto. Exija vínculo com os critérios e trechos da resposta, sem inventar evidências.',
          'Compare os rascunhos com sua leitura. Ajuste precisão, tom e sugestões; retire comentários genéricos ou injustos. Valide a avaliação final e registre uma alteração em cada feedback. Não insira dados pessoais de alunos na ferramenta.',
        ],
      },
      {
        titulo: 'Teste de correção: consistência, tempo e reutilização',
        resumo: 'O ganho de tempo deve preservar a qualidade e a decisão pedagógica.',
        foco: 'LOTE CRONOMETRADO + BANCO DE ITENS E FEEDBACK',
        tarefas: [
          'Prepare dois pequenos lotes de respostas fictícias de dificuldade semelhante. Corrija um sem IA e outro com rascunhos assistidos, usando a mesma rubrica. Cronometre cada lote, incluindo revisão, e registre diferenças de consistência e clareza.',
          'Compare o tempo por resposta; indique limites da comparação e se o tempo habitual foi estimado. Reúna avaliação, gabarito, rubrica e feedbacks revisados. Salve itens e comentários reutilizáveis, adaptando-os a cada nova resposta.',
        ],
      },
    ],
    checklist: [
      'As questões avaliam os objetivos e os níveis cognitivos definidos?',
      'Enunciados, gabaritos e distratores foram conferidos pelo docente?',
      'A rubrica tem critérios, pesos e descritores claros e coerentes?',
      'O feedback é específico, respeitoso e apoiado na resposta?',
      'Os dados foram protegidos e a avaliação final foi validada pelo docente?',
    ],
    reflexao: [
      'Quais decisões sobre critérios, pontuação e feedback devem permanecer sob minha responsabilidade para garantir uma avaliação justa ao usar IA?',
      'Como posso perceber se a correção assistida está apoiando a aprendizagem, em vez de apenas acelerar a produção de comentários?',
    ],
  },
  {
    moduleId: 'modulo-4',
    pdf: '/materiais/pratica-modulo-4.pdf',
    objetivo:
      'integrar prazos, tarefas e materiais em uma rotina simples que continue após o curso. Os cinco exercícios conectam quadro do semestre, textos administrativos, revisão semanal e portfólio. Use demandas reais sem expor dados pessoais; registre evidências de uso, tempo gasto e ajustes necessários.',
    exercicios: [
      {
        titulo: 'Quadro do semestre: reunir tarefas em um só lugar',
        resumo: 'Um quadro simples reduz a necessidade de lembrar de tudo ao mesmo tempo.',
        foco: 'CAPTURA ÚNICA + STATUS E PRIORIDADE',
        tarefas: [
          'Liste ao menos oito demandas reais: aulas, materiais, correções e comunicações. No Notion, Trello ou em um quadro simples, crie quatro colunas: A planejar, Em aula, A corrigir e Entregue. Distribua as demandas conforme a etapa atual.',
          'Crie um cartão por tarefa com turma, prazo, prioridade e próxima ação. Evite nomes de alunos e informações sensíveis. Selecione três prioridades da semana e confira se os prazos e as ações estão claros, sem campos desnecessários.',
        ],
      },
      {
        titulo: 'Textos administrativos: rascunhos com contexto',
        resumo: 'Um bom comando reduz retrabalho em textos recorrentes da rotina docente.',
        foco: 'DESTINATÁRIO + OBJETIVO + TOM + REVISÃO',
        tarefas: [
          'Escolha duas demandas, como um comunicado à turma e um e-mail à coordenação. Com ChatGPT ou Gemini, gere rascunhos informando destinatário, contexto, objetivo, tom, formato e fatos confirmados. Use campos como [DATA] e [TURMA].',
          'Confira datas, instruções e responsabilidades; remova informações inventadas ou dados pessoais. Ajuste a linguagem e salve os textos revisados como modelos. Registre o que precisou alterar antes de considerar cada rascunho pronto para envio.',
        ],
      },
      {
        titulo: 'Rotina semanal: quinze minutos para manter o quadro',
        resumo: 'A organização só ajuda quando cabe na rotina e continua atualizada.',
        foco: 'REVISÃO CURTA + PRÓXIMAS AÇÕES',
        tarefas: [
          'Defina um momento semanal e teste uma revisão de 15 minutos: cinco para conferir prazos, cinco para mover cartões e priorizar, três para preparar um rascunho simples e dois para guardar evidências. Registre o tempo realmente usado.',
          'Durante a semana, registre novas demandas e atualize os cartões. Na revisão seguinte, confira pendências, escolha três próximas ações e identifique o que ficou parado. Se a manutenção exceder o tempo, simplifique campos ou passos.',
        ],
      },
      {
        titulo: 'Portfólio: ligar os quatro módulos à prática',
        resumo: 'O portfólio reúne materiais revisados e mostra como foram usados.',
        foco: 'CONSOLIDAÇÃO + EVIDÊNCIAS DE APLICAÇÃO',
        tarefas: [
          'Organize quatro conjuntos: prompts testados; plano e slides com fontes; avaliação, rubrica e feedback; quadro do semestre. Para cada conjunto, registre objetivo, versão final, revisão realizada e situação: aplicado ou ainda planejado.',
          'Acrescente uma evidência sem dados pessoais, como trecho do material ou imagem do quadro. Anote resultado observado e próximo ajuste, sem inventar resultados de uso. Salve cópias em formatos comuns para acessar sem depender de uma única ferramenta.',
        ],
      },
      {
        titulo: 'Balanço final: tempo, utilidade e continuidade',
        resumo: 'Consolidar significa manter o que ajuda e ajustar o que gera trabalho extra.',
        foco: 'AVALIAÇÃO PÓS-USO + MELHORIA DO SISTEMA',
        tarefas: [
          'Compare o tempo de planejamento, correção e organização antes e depois da trilha. Diferencie medições de estimativas e inclua revisão e manutenção. Registre uma melhoria percebida e uma dificuldade; responda ao questionário pós-uso, se disponível.',
          'Escolha duas práticas para manter no próximo mês e uma para simplificar. Defina quando revisar o quadro e como acessar seus arquivos se a ferramenta mudar. Entregue o sistema em uso, o portfólio e um registro breve dos próximos passos.',
        ],
      },
    ],
    checklist: [
      'O quadro reúne tarefas com prazos, status e próximas ações claras?',
      'A manutenção cabe na rotina e foi testada em uma revisão semanal?',
      'Os textos foram revisados e os dados pessoais estão protegidos?',
      'O portfólio diferencia materiais aplicados dos ainda planejados?',
      'Há cópias dos materiais e um plano simples para continuar o uso?',
    ],
    reflexao: [
      'Como posso saber se meu sistema de organização está reduzindo a sobrecarga, sem transformar a manutenção do quadro em mais uma tarefa?',
      'Quais práticas da trilha pretendo manter e que ajustes preciso fazer para que os ganhos de tempo preservem a qualidade do meu trabalho docente?',
    ],
  },
];
