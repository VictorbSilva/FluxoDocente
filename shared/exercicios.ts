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
];
