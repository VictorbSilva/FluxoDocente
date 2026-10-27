import type { Exercicio } from './contracts.js';

// Sem gabarito: ele fica em server/ e nunca é importado por src/.
export const exercicios: Exercicio[] = [
  {
    moduleId: 'modulo-1',
    instrucoes: 'Leia cada questão e marque apenas uma alternativa.',
    perguntas: [
      {
        id: 'm1-q01',
        enunciado: 'Qual é o principal objetivo da engenharia de prompt no trabalho docente?',
        alternativas: [
          'Automatizar todas as decisões pedagógicas do professor.',
          'Escrever instruções claras para obter respostas úteis, verificáveis e adequadas ao público.',
          'Garantir que a IA produza sempre a mesma resposta.',
          'Eliminar a necessidade de conferir os materiais gerados.',
        ],
      },
      {
        id: 'm1-q02',
        enunciado:
          'Um professor escreveu o seguinte prompt:\n“Atue como professor de Ciências. Para uma turma do 6º ano que está estudando o ciclo da água, crie uma atividade de revisão. Utilize linguagem simples e evite termos técnicos sem explicação.”\nQual campo precisa ser acrescentado para completar explicitamente a estrutura de cinco campos apresentada no módulo?',
        alternativas: [
          'Persona, indicando o papel da IA.',
          'Contexto, identificando o tema e a turma.',
          'Restrições, estabelecendo cuidados com a linguagem.',
          'Formato, definindo a estrutura esperada da resposta.',
        ],
      },
      {
        id: 'm1-q03',
        enunciado:
          'Uma IA apresenta uma referência bibliográfica que parece verdadeira, mas o professor descobre que a publicação não existe. Essa situação é um exemplo de:',
        alternativas: [
          'Alucinação, pois a IA gerou uma informação falsa com aparência de verdade.',
          'Iteração, pois a IA aprimorou uma resposta anterior.',
          'Anonimização, pois a IA ocultou a identidade do autor.',
          'Contextualização, pois a IA adaptou a referência ao tema.',
        ],
      },
      {
        id: 'm1-q04',
        enunciado:
          'Um docente quer produzir materiais sobre o mesmo tema para estudantes iniciantes e para uma turma avançada. Qual estratégia é mais adequada?',
        alternativas: [
          'Alterar apenas o tamanho dos textos, mantendo o vocabulário e os exemplos.',
          'Solicitar uma única explicação e utilizá-la integralmente com as duas turmas.',
          'Informar o nível de cada turma e ajustar a linguagem, os exemplos e a profundidade do conteúdo.',
          'Mudar apenas a persona da IA, sem informar as características dos estudantes.',
        ],
      },
      {
        id: 'm1-q05',
        enunciado:
          'Uma professora testa o mesmo prompt duas vezes e recebe respostas diferentes. Em uma delas, aparecem dados recentes e uma referência que ela ainda não verificou. Analise as afirmações:\nI. A diferença entre as respostas, por si só, não permite concluir qual delas está correta.\nII. A presença de dados recentes comprova que a ferramenta pesquisou na internet em tempo real.\nIII. Os dados e a referência devem ser conferidos em fontes confiáveis antes do uso em aula.\nIV. Um prompt bem estruturado elimina a possibilidade de informações inventadas.\nQuais afirmações estão corretas?',
        alternativas: [
          'I e II.',
          'I e III.',
          'II e IV.',
          'III e IV.',
        ],
      },
      {
        id: 'm1-q06',
        enunciado:
          'Um professor fornece à IA uma atividade de sua autoria e pede novas questões “no mesmo estilo”. Depois, solicita a construção de um plano de aula por etapas: objetivos, introdução, atividade e avaliação. Quais técnicas ele está utilizando, respectivamente?',
        alternativas: [
          'Definição de persona e anonimização.',
          'Verificação de fontes e adaptação de público.',
          'Iteração e identificação de vieses.',
          'Uso de exemplos e divisão da tarefa em etapas.',
        ],
      },
      {
        id: 'm1-q07',
        enunciado:
          'Após receber um texto muito longo e formal, a professora solicita: “Reduza o texto, use linguagem mais simples e acrescente um exemplo do cotidiano”. Essa ação caracteriza:',
        alternativas: [
          'Uma verificação da existência das fontes citadas.',
          'Uma substituição do objetivo pedagógico pela escolha da IA.',
          'Uma iteração para refinar a resposta recebida.',
          'Uma garantia de que o conteúdo ficou correto.',
        ],
      },
      {
        id: 'm1-q08',
        enunciado:
          'Um docente pretende pedir à IA sugestões de atividades adaptadas. Seu rascunho inclui nomes de estudantes, laudos e detalhes que permitem identificá-los. Qual revisão do pedido está mais alinhada aos cuidados apresentados no módulo?',
        alternativas: [
          'Retirar dados pessoais e detalhes identificáveis, descrever somente as necessidades pedagógicas relevantes e revisar as sugestões recebidas.',
          'Substituir os nomes por iniciais, mantendo os laudos completos e os demais detalhes individuais.',
          'Manter os dados e acrescentar ao prompt a instrução “não divulgue estas informações”.',
          'Enviar os documentos completos e solicitar que a IA faça a anonimização após analisá-los.',
        ],
      },
      {
        id: 'm1-q09',
        enunciado:
          'Ao finalizar o módulo, um professor deseja montar seu kit pessoal de prompts. Qual procedimento atende melhor à proposta da apostila?',
        alternativas: [
          'Armazenar todos os comandos utilizados, sem distinguir quais produziram bons resultados.',
          'Selecionar pelo menos cinco prompts testados e refinados, transformando-os em modelos com campos como [TEMA], [TURMA] e [FORMATO].',
          'Guardar somente as respostas finais, descartando as instruções que as produziram.',
          'Escolher os comandos que geraram os textos mais longos, independentemente da utilidade.',
        ],
      },
      {
        id: 'm1-q10',
        enunciado:
          'Uma professora pede à IA uma atividade para sua disciplina. A resposta apresenta boa organização, mas pressupõe conhecimentos que a turma ainda não possui, inclui uma generalização sobre um grupo social e cita uma fonte não localizada. Qual sequência de ações é mais adequada?',
        alternativas: [
          'Ajustar a diagramação, manter o conteúdo e esclarecer eventuais problemas durante a aplicação.',
          'Solicitar uma nova versão e utilizá-la caso a IA declare que corrigiu todos os problemas.',
          'Excluir a referência não localizada e manter os exemplos e o nível de dificuldade.',
          'Esclarecer os conhecimentos prévios da turma, solicitar ajustes, verificar as informações e revisar vieses e alinhamento pedagógico antes do uso.',
        ],
      },
    ],
  },
  {
    moduleId: 'modulo-2',
    instrucoes: 'Leia cada questão e marque apenas uma alternativa.',
    perguntas: [
      {
        id: 'm2-q01',
        enunciado:
          'Qual sequência representa o fluxo de planejamento apresentado no módulo?',
        alternativas: [
          'Tema da ementa → busca verificada → plano de aula → apresentação.',
          'Apresentação → escolha de imagens → definição dos objetivos → pesquisa.',
          'Busca de imagens → apresentação → escolha da turma → plano de aula.',
          'Plano de aula → apresentação → definição do tema → verificação opcional.',
        ],
      },
      {
        id: 'm2-q02',
        enunciado:
          'Uma ferramenta de IA apresenta uma afirmação acompanhada de um link. Qual procedimento permite verificar adequadamente essa informação?',
        alternativas: [
          'Conferir se o título da página contém as mesmas palavras da afirmação.',
          'Verificar se outras respostas da mesma ferramenta repetem a informação.',
          'Abrir a fonte, conferir autoria, data e contexto e comparar a afirmação com o trecho original.',
          'Confirmar que o link funciona e manter a afirmação sem examinar o conteúdo.',
        ],
      },
      {
        id: 'm2-q03',
        enunciado:
          'Segundo as orientações de design instrucional, um slide deve:',
        alternativas: [
          'Reunir todo o conteúdo que o professor pretende falar.',
          'Apresentar uma ideia central, texto enxuto e elementos visuais coerentes.',
          'Priorizar imagens decorativas, mesmo sem relação com o tema.',
          'Utilizar textos extensos para dispensar explicações durante a aula.',
        ],
      },
      {
        id: 'm2-q04',
        enunciado:
          'Um plano de aula apresenta o objetivo “comparar duas formas de geração de energia”. Entretanto, a atividade final solicita apenas que os estudantes copiem as definições. Qual ajuste melhora o alinhamento pedagógico?',
        alternativas: [
          'Aumentar o tempo destinado à cópia das definições.',
          'Acrescentar mais slides com os conceitos apresentados.',
          'Trocar o título da atividade por “Comparando fontes de energia”.',
          'Solicitar que os estudantes identifiquem semelhanças e diferenças entre as duas formas de geração.',
        ],
      },
      {
        id: 'm2-q05',
        enunciado:
          'Uma docente encontra uma fonte verdadeira, mas percebe que a IA transformou um resultado limitado a determinado contexto em uma conclusão geral. Como deve proceder?',
        alternativas: [
          'Manter a conclusão, pois a existência da fonte confirma a interpretação da IA.',
          'Corrigir a afirmação conforme os limites da fonte e verificar sua adequação à aula.',
          'Substituir a referência por outra mais recente, sem alterar a conclusão.',
          'Retirar a referência e apresentar a conclusão como uma explicação simplificada.',
        ],
      },
      {
        id: 'm2-q06',
        enunciado:
          'Um professor escreve o seguinte prompt visual: “Crie uma ilustração de uma professora em um laboratório universitário, com estilo minimalista, personagem à esquerda e espaço livre à direita. Evite marcas comerciais e estereótipos.” Qual trecho corresponde ao campo “composição”?',
        alternativas: [
          '“Personagem à esquerda e espaço livre à direita.”',
          '“Uma professora.”',
          '“Em um laboratório universitário.”',
          '“Evite marcas comerciais e estereótipos.”',
        ],
      },
      {
        id: 'm2-q07',
        enunciado:
          'Qual é a função principal de uma imagem em uma apresentação didática?',
        alternativas: [
          'Preencher os espaços vazios dos slides.',
          'Substituir a necessidade de conferir o conteúdo.',
          'Tornar a apresentação mais elaborada, independentemente do tema.',
          'Explicar, exemplificar ou orientar a compreensão de um conceito.',
        ],
      },
      {
        id: 'm2-q08',
        enunciado:
          'Um professor precisa apresentar um gráfico com dados numéricos e um diagrama de um processo técnico. Qual escolha está mais alinhada às orientações da apostila?',
        alternativas: [
          'Gerar ambos como imagens e avaliar a precisão pela aparência visual.',
          'Utilizar imagens prontas semelhantes, mesmo que representem outros dados.',
          'Construir os visuais com informações verificadas, revisar sua precisão e acrescentar descrições acessíveis.',
          'Substituir os valores por estimativas para facilitar a produção das imagens.',
        ],
      },
      {
        id: 'm2-q09',
        enunciado:
          'Ao revisar um plano de 60 minutos, a professora percebe que as etapas somam 75 minutos e que a atividade principal depende de internet. Qual é a melhor revisão?',
        alternativas: [
          'Manter as etapas e decidir durante a aula quais serão interrompidas.',
          'Reorganizar o tempo para totalizar 60 minutos e preparar uma alternativa sem internet.',
          'Retirar a atividade de fechamento e manter as demais etapas sem recalcular o tempo.',
          'Preservar o plano e solicitar que os alunos concluam a aula em seus dispositivos pessoais.',
        ],
      },
      {
        id: 'm2-q10',
        enunciado:
          'Uma docente costumava gastar 120 minutos para preparar uma aula. Com IA, registrou 20 minutos de busca, 25 de planejamento, 30 de produção dos slides e 35 de revisão. O material final manteve a qualidade pedagógica. Qual conclusão é adequada?',
        alternativas: [
          'Houve economia de 10 minutos, considerando todas as etapas, inclusive a revisão.',
          'Houve economia de 45 minutos, pois a revisão não integra o tempo de preparação.',
          'Houve economia de 65 minutos, considerando apenas planejamento e slides.',
          'Não houve economia, pois o uso de IA ainda exigiu intervenção docente.',
        ],
      },
    ],
  },
  {
    moduleId: 'modulo-3',
    instrucoes: 'Leia cada questão e marque apenas uma alternativa.',
    perguntas: [
      {
        id: 'm3-q01',
        enunciado:
          'Qual é o papel da IA na correção assistida apresentada no módulo?',
        alternativas: [
          'Definir os critérios de avaliação independentemente do professor.',
          'Atribuir notas finais sem necessidade de conferência.',
          'Produzir rascunhos de comentários para revisão e validação docente.',
          'Substituir a leitura das respostas pelo professor.',
        ],
      },
      {
        id: 'm3-q02',
        enunciado:
          'Após estudar um procedimento de sua área, o estudante recebe uma situação profissional nova e precisa utilizar esse procedimento para resolvê-la. Qual nível cognitivo predomina nessa tarefa?',
        alternativas: [
          'Lembrar, pois basta reproduzir uma definição.',
          'Aplicar, pois é necessário utilizar o conhecimento em uma situação.',
          'Analisar, pois toda situação profissional exige comparação entre argumentos.',
          'Lembrar, pois o procedimento já foi apresentado anteriormente.',
        ],
      },
      {
        id: 'm3-q03',
        enunciado:
          'Quais elementos compõem a estrutura básica de uma rubrica?',
        alternativas: [
          'Tema, duração e quantidade de questões.',
          'Nome do estudante, nota e comentário geral.',
          'Enunciado, alternativas e gabarito.',
          'Critérios, níveis de desempenho e descritores observáveis.',
        ],
      },
      {
        id: 'm3-q04',
        enunciado:
          'Ao revisar uma questão de múltipla escolha com resposta única, o professor identifica duas alternativas defensáveis e duas claramente absurdas. Qual é a melhor ação?',
        alternativas: [
          'Reformular o item para haver uma única resposta correta e distratores plausíveis.',
          'Manter o item e considerar correta somente a alternativa indicada pela IA.',
          'Alterar apenas a ordem das alternativas para reduzir a ambiguidade.',
          'Acrescentar ao enunciado a expressão “marque a alternativa mais correta”.',
        ],
      },
      {
        id: 'm3-q05',
        enunciado:
          'Uma questão começa com “Analise o conceito de avaliação formativa”, mas solicita apenas que o estudante reproduza a definição apresentada em aula. Sobre o nível cognitivo desse item, é correto afirmar que:',
        alternativas: [
          'É de análise, pois o verbo inicial determina o nível cognitivo.',
          'É de aplicação, pois o conceito pertence à prática profissional.',
          'Predomina a lembrança, pois a tarefa efetiva exige recuperar uma definição.',
          'É de análise, desde que a resposta tenha mais de um parágrafo.',
        ],
      },
      {
        id: 'm3-q06',
        enunciado:
          'Uma professora deseja tornar uma questão mais acessível sem alterar o objetivo de aprendizagem nem a exigência cognitiva. Qual adaptação é adequada?',
        alternativas: [
          'Substituir o problema por uma pergunta de memorização mais simples.',
          'Explicar termos, organizar as instruções e descrever o visual necessário à resolução.',
          'Indicar no enunciado qual alternativa deve ser marcada.',
          'Retirar a etapa de justificativa, embora ela seja parte do objetivo avaliado.',
        ],
      },
      {
        id: 'm3-q07',
        enunciado:
          'Qual conjunto de elementos caracteriza um feedback útil à aprendizagem?',
        alternativas: [
          'Elogio geral, nota final e recomendação para estudar mais.',
          'Comparação com colegas, classificação e indicação dos erros.',
          'Resumo do conteúdo e repetição do enunciado da atividade.',
          'Ponto forte, aspecto a melhorar e próximo passo concreto.',
        ],
      },
      {
        id: 'm3-q08',
        enunciado:
          'Uma rubrica avalia “qualidade da argumentação”, mas utiliza apenas os descritores “excelente”, “regular” e “fraco”. Dois avaliadores atribuem notas muito diferentes à mesma resposta. Qual revisão enfrenta melhor o problema?',
        alternativas: [
          'Descrever evidências de cada nível, como uso de argumentos e relação com as evidências, e testar a rubrica em respostas fictícias.',
          'Manter os descritores e aumentar o número de níveis de desempenho.',
          'Substituir os descritores por notas numéricas, sem explicações adicionais.',
          'Solicitar à IA que escolha qual avaliador está correto, mantendo a rubrica.',
        ],
      },
      {
        id: 'm3-q09',
        enunciado:
          'Ao revisar um feedback gerado pela IA, o professor encontra a frase “Você utilizou bons exemplos”, mas a resposta do estudante não apresenta nenhum exemplo. O que deve fazer?',
        alternativas: [
          'Manter o comentário para incentivar o estudante.',
          'Acrescentar um exemplo ao feedback como se estivesse na resposta original.',
          'Retirar a afirmação e fundamentar a devolutiva em evidências realmente presentes na resposta.',
          'Trocar a frase por “Excelente trabalho”, dispensando a análise dos critérios.',
        ],
      },
      {
        id: 'm3-q10',
        enunciado:
          'Um professor compara dois lotes de respostas fictícias de dificuldade semelhante, usando a mesma rubrica. Corrige 6 respostas sem IA em 36 minutos e 8 respostas com IA em 40 minutos, incluindo a revisão. Qual interpretação é adequada?',
        alternativas: [
          'A IA aumentou o tempo de correção, porque 40 minutos é mais que 36 minutos.',
          'O tempo por resposta caiu de 6 para 5 minutos, mas é preciso examinar também a qualidade e os limites da comparação.',
          'A IA reduziu o tempo por resposta pela metade, comprovando maior qualidade da correção.',
          'Os tempos totais são suficientes para concluir que os dois métodos têm a mesma eficiência.',
        ],
      },
    ],
  },
  {
    moduleId: 'modulo-4',
    instrucoes: 'Leia cada questão e marque apenas uma alternativa.',
    perguntas: [
      {
        id: 'm4-q01',
        enunciado:
          'Qual é o principal objetivo de reunir as demandas docentes em um único quadro?',
        alternativas: [
          'Registrar o maior número possível de informações sobre cada estudante.',
          'Substituir o planejamento das aulas pela organização de cartões.',
          'Criar um sistema detalhado, mesmo que exija manutenção diária extensa.',
          'Reduzir a sobrecarga de memória e facilitar o acompanhamento das tarefas.',
        ],
      },
      {
        id: 'm4-q02',
        enunciado:
          'Uma turma já entregou os trabalhos, mas o professor ainda precisa avaliá-los e preparar as devolutivas. Em qual coluna essa tarefa deve ficar?',
        alternativas: [
          'A planejar.',
          'Em aula.',
          'A corrigir.',
          'Entregue.',
        ],
      },
      {
        id: 'm4-q03',
        enunciado:
          'Quais informações são essenciais em um cartão de tarefa, conforme a apostila?',
        alternativas: [
          'Turma, prazo, prioridade e próxima ação.',
          'Nome dos estudantes, notas individuais e histórico familiar.',
          'Nome da ferramenta, senha de acesso e tempo de assinatura.',
          'Texto completo da aula, todas as referências e currículo do professor.',
        ],
      },
      {
        id: 'm4-q04',
        enunciado:
          'Um professor deseja que a IA prepare um comunicado sobre uma atividade, mas a data ainda não foi confirmada. Qual orientação é mais adequada?',
        alternativas: [
          'Pedir que a IA escolha uma data provável e escreva o comunicado como definitivo.',
          'Informar destinatário, contexto, objetivo e tom, usar [DATA] e preencher o campo após confirmação.',
          'Utilizar a data de uma atividade anterior, sem verificar se ela se aplica à nova situação.',
          'Pedir um comunicado sem contexto e ajustar apenas a formatação antes do envio.',
        ],
      },
      {
        id: 'm4-q05',
        enunciado:
          'Uma professora criou um quadro com muitos campos e classificações. A manutenção consome 50 minutos semanais, vários cartões estão desatualizados e ela continua esquecendo prazos. Qual decisão está mais alinhada ao módulo?',
        alternativas: [
          'Acrescentar mais campos para registrar os motivos de cada atraso.',
          'Manter o sistema e ampliar o tempo reservado à atualização.',
          'Transferir o mesmo quadro para outra ferramenta sem alterar sua estrutura.',
          'Simplificar campos e etapas, preservar as informações essenciais e testar novamente a rotina.',
        ],
      },
      {
        id: 'm4-q06',
        enunciado:
          'Qual organização corresponde à revisão semanal de 15 minutos proposta na apostila?',
        alternativas: [
          '10 minutos para escolher imagens e 5 para alterar as cores dos cartões.',
          '5 minutos para criar novas colunas e 10 para detalhar todas as tarefas do semestre.',
          '5 minutos para conferir prazos, 5 para mover cartões e priorizar, 3 para um rascunho simples e 2 para guardar evidências.',
          '15 minutos para gerar comunicados, deixando prazos e pendências para o fim do semestre.',
        ],
      },
      {
        id: 'm4-q07',
        enunciado:
          'Quais conjuntos de materiais devem integrar o portfólio da trilha?',
        alternativas: [
          'Prompts testados; plano e slides com fontes; avaliação, rubrica e feedback; quadro do semestre.',
          'Certificados; lista de ferramentas; imagens decorativas; histórico de acessos.',
          'Textos gerados sem revisão; notas pessoais; senhas; dados individuais dos estudantes.',
          'Slides de apresentação do curso; lista de participantes; capturas de tela; calendário de feriados.',
        ],
      },
      {
        id: 'm4-q08',
        enunciado:
          'Um docente concluiu e revisou um plano de aula, mas ainda não o aplicou. Ao organizar o portfólio, qual registro é adequado?',
        alternativas: [
          'Classificá-lo como aplicado, pois o material já está pronto para uso.',
          'Indicar que está planejado, registrar a revisão realizada e deixar os resultados de aplicação para depois do uso.',
          'Descrever resultados esperados como resultados observados para completar o registro.',
          'Retirar o plano do portfólio até que todos os materiais tenham sido aplicados.',
        ],
      },
      {
        id: 'm4-q09',
        enunciado:
          'Uma ferramenta utilizada pelo professor pode alterar suas condições de acesso. Qual prática favorece a continuidade do trabalho?',
        alternativas: [
          'Manter todos os arquivos apenas dentro da ferramenta para evitar versões duplicadas.',
          'Salvar somente imagens dos materiais, mesmo quando precisar editá-los depois.',
          'Refazer todos os materiais sempre que houver uma mudança na plataforma.',
          'Guardar cópias em formatos comuns e prever uma alternativa para acessar e continuar o trabalho.',
        ],
      },
      {
        id: 'm4-q10',
        enunciado:
          'Antes da trilha, uma professora estimava gastar 4 horas semanais com planejamento, correção e organização. Após a trilha, mediu 3 horas e 30 minutos nessas mesmas tarefas, incluindo revisão e manutenção. A qualidade foi preservada. Qual registro é mais adequado?',
        alternativas: [
          '“Economizei exatamente 30 minutos por semana, pois os dois valores foram medidos.”',
          '“Economizei 3 horas e 30 minutos, equivalentes ao tempo registrado após a trilha.”',
          '“A comparação sugere redução de 30 minutos, mas o valor anterior era uma estimativa e novas medições podem confirmar o ganho.”',
          '“Não é possível registrar nenhuma percepção de melhoria, porque o tempo anterior foi estimado.”',
        ],
      },
    ],
  },
];
