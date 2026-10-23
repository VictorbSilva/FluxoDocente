import type { PerguntaDTO } from './contracts.js';

// Sem gabarito: ele fica em server/ e nunca é importado por src/.
export const perguntasDoNivelamento: PerguntaDTO[] = [
  {
    id: 'niv-q01',
    moduleId: 'modulo-1',
    enunciado: 'Qual afirmação descreve melhor como uma IA generativa de texto produz suas respostas?',
    alternativas: [
      'Consulta uma base de fatos verificados e copia a resposta correta.',
      'Entende o assunto como uma pessoa e confere se está certo antes de responder.',
      'Gera o texto palavra por palavra, escolhendo as mais prováveis com base em padrões aprendidos.',
      'Pesquisa na internet em tempo real a cada pergunta, sempre.',
    ],
  },
  {
    id: 'niv-q02',
    moduleId: 'modulo-1',
    enunciado: 'O que é uma “alucinação” em IA generativa?',
    alternativas: [
      'Uma falha técnica em que a ferramenta trava e não responde.',
      'Informação falsa apresentada com aparência de verdadeira, como uma citação ou fonte que não existe.',
      'Uma resposta muito longa para o que foi pedido.',
      'A recusa da ferramenta em responder a uma pergunta.',
    ],
  },
  {
    id: 'niv-q03',
    moduleId: 'modulo-1',
    enunciado: 'Veja este prompt: “Você é professor de História. Estou falando com calouros de graduação. Explique a Revolução Francesa. Evite termos técnicos.” Qual elemento de um prompt bem estruturado ainda falta?',
    alternativas: [
      'Persona.',
      'Contexto.',
      'Tarefa.',
      'Formato (como a resposta deve ser entregue, por exemplo em 5 linhas ou em tópicos).',
    ],
  },
  {
    id: 'niv-q04',
    moduleId: 'modulo-1',
    enunciado: 'A IA entregou um texto longo e formal demais. Qual é a melhor próxima ação?',
    alternativas: [
      'Responder na mesma conversa pedindo o ajuste, como: “Reduza para 5 linhas, com um exemplo do cotidiano e tom menos formal”.',
      'Abandonar a ferramenta, pois ela não entendeu o pedido.',
      'Repetir exatamente o mesmo pedido até sair um texto melhor.',
      'Aceitar o texto como está, pois a primeira resposta costuma ser a melhor.',
    ],
  },
  {
    id: 'niv-q05',
    moduleId: 'modulo-1',
    enunciado: 'Um docente quer ajuda da IA para escrever um retorno a um estudante com dificuldade de interpretação de texto. Qual conduta é mais adequada?',
    alternativas: [
      'Colar o nome completo, a matrícula e o relatório do estudante, para o comentário ficar personalizado.',
      'Descrever a situação sem identificar ninguém, por exemplo: “um estudante do 2º semestre com dificuldade de interpretação de texto”.',
      'Colar apenas o primeiro nome do estudante, porque isso não o identifica.',
      'Colar os dados completos, se a ferramenta usada for paga.',
    ],
  },
  {
    id: 'niv-q06',
    moduleId: 'modulo-2',
    enunciado: 'A IA citou um artigo com autor, ano e revista para apoiar o conteúdo da sua aula. Qual é o primeiro passo antes de usá-lo?',
    alternativas: [
      'Usar, pois uma referência completa indica que o artigo é real.',
      'Pedir à própria IA que confirme se o artigo existe e aceitar a resposta.',
      'Procurar o artigo em uma fonte confiável e conferir se ele existe e se o conteúdo corresponde ao que foi dito.',
      'Usar apenas se o texto da resposta estiver bem escrito.',
    ],
  },
  {
    id: 'niv-q07',
    moduleId: 'modulo-2',
    enunciado: 'Qual pedido tende a gerar o plano de aula mais útil?',
    alternativas: [
      '“Faça uma aula sobre estatística.”',
      '“Monte um plano de 100 minutos sobre média e desvio padrão para calouros, com objetivo de aprendizagem, etapas com tempo e uma atividade final.”',
      '“Crie o melhor plano de aula possível sobre estatística.”',
      '“Me dê ideias para uma aula de estatística.”',
    ],
  },
  {
    id: 'niv-q08',
    moduleId: 'modulo-2',
    enunciado: 'Qual prática é mais coerente com um bom design de slides didáticos?',
    alternativas: [
      'Uma ideia principal por slide, com texto curto e um apoio visual que ajude a explicar.',
      'Concentrar a aula em poucos slides com blocos de texto completos, para o estudante ler depois.',
      'Colocar imagens decorativas em todos os slides para deixar a apresentação atraente.',
      'Copiar o plano de aula inteiro para os slides, sem cortar nada.',
    ],
  },
  {
    id: 'niv-q09',
    moduleId: 'modulo-2',
    enunciado: 'Para pedir uma imagem que ajude a aula, qual conjunto de informações torna o pedido mais preciso?',
    alternativas: [
      'O nome da disciplina e a cor preferida.',
      'O tamanho da imagem e o número de pessoas.',
      'Apenas a palavra “bonita” e o tema da aula.',
      'O que deve aparecer, o contexto de uso, o estilo, a composição (com espaço para texto) e o que evitar, como estereótipos.',
    ],
  },
  {
    id: 'niv-q10',
    moduleId: 'modulo-2',
    enunciado: 'Ao abrir o link citado pela IA para apoiar uma afirmação, você vê que a página diz algo diferente do que a IA afirmou. O que isso indica?',
    alternativas: [
      'Que a página está errada e a IA, certa.',
      'Que o link provavelmente está quebrado e isso não tem importância.',
      'Que a IA pode ter distorcido a fonte, e a afirmação não deve ser usada sem correção.',
      'Que isso é normal, pois a IA sempre resume com palavras diferentes.',
    ],
  },
  {
    id: 'niv-q11',
    moduleId: 'modulo-3',
    enunciado: 'Qual questão avalia o nível “aplicar” da Taxonomia de Bloom?',
    alternativas: [
      '“Defina desvio padrão.”',
      '“Calcule o desvio padrão destes dados e diga o que ele indica sobre a turma.”',
      '“Cite a fórmula do desvio padrão.”',
      '“Liste três medidas de dispersão.”',
    ],
  },
  {
    id: 'niv-q12',
    moduleId: 'modulo-3',
    enunciado: 'O que é uma rubrica de avaliação?',
    alternativas: [
      'Um instrumento que descreve critérios e níveis de desempenho, com descritores do que caracteriza cada nível.',
      'Uma lista com as notas finais de cada estudante.',
      'O conjunto das respostas corretas de uma prova.',
      'Um modelo de prova pronto para aplicar.',
    ],
  },
  {
    id: 'niv-q13',
    moduleId: 'modulo-3',
    enunciado: 'Qual descritor é mais objetivo para o critério “interpretação do resultado”?',
    alternativas: [
      '“Interpretação boa.”',
      '“Demonstra esforço na interpretação.”',
      '“Interpretação satisfatória na maioria das vezes.”',
      '“Interpreta o resultado e o relaciona ao contexto do problema.”',
    ],
  },
  {
    id: 'niv-q14',
    moduleId: 'modulo-3',
    enunciado: 'Ao usar IA para rascunhar o feedback de um trabalho, qual conduta é mais adequada?',
    alternativas: [
      'Colar o trabalho com nome e matrícula, para o comentário ficar personalizado.',
      'Pedir à IA que atribua a nota e enviar o resultado ao estudante.',
      'Retirar os dados que identifiquem o estudante, usar a rubrica como base, revisar o comentário e manter a nota como decisão do docente.',
      'Enviar o comentário gerado diretamente, pois a IA segue a rubrica.',
    ],
  },
  {
    id: 'niv-q15',
    moduleId: 'modulo-3',
    enunciado: 'Uma IA gerou esta questão de múltipla escolha: “Qual é o melhor método para analisar dados?” As quatro alternativas são métodos reais, usados na prática. Qual é o principal problema da questão?',
    alternativas: [
      'O enunciado é ambíguo: mais de uma alternativa pode ser defendida como correta, dependendo do contexto.',
      'A questão é fácil demais para qualquer nível.',
      'As alternativas são curtas demais.',
      'A questão não tem problema, pois todas as alternativas são plausíveis.',
    ],
  },
  {
    id: 'niv-q16',
    moduleId: 'modulo-4',
    enunciado: 'Qual é a principal vantagem de reunir prazos, correções e entregas em um único quadro?',
    alternativas: [
      'Aumentar a quantidade de tarefas registradas.',
      'Substituir o calendário e os sistemas oficiais da instituição.',
      'Mostrar aos colegas que o docente é organizado.',
      'Reduzir o esforço de lembrar tudo de cabeça e dar uma visão geral do que está pendente.',
    ],
  },
  {
    id: 'niv-q17',
    moduleId: 'modulo-4',
    enunciado: 'Qual estrutura de quadro tende a continuar em uso ao longo do semestre?',
    alternativas: [
      'Poucas colunas simples, como: a planejar, em aula, a corrigir e entregue.',
      'Uma coluna para cada dia do mês.',
      'Dez colunas por disciplina, com cores e etiquetas para cada tipo de tarefa.',
      'Uma única coluna, chamada “feito”.',
    ],
  },
  {
    id: 'niv-q18',
    moduleId: 'modulo-4',
    enunciado: 'Qual pedido gera o melhor rascunho de e-mail para a coordenação?',
    alternativas: [
      '“Escreva um e-mail.”',
      '“Escreva um e-mail curto e formal à coordenação, informando que a prova da turma X passará de 10/11 para 17/11, e pedindo confirmação.”',
      '“Escreva um e-mail bonito e profissional.”',
      '“Me ajude com um assunto da coordenação.”',
    ],
  },
  {
    id: 'niv-q19',
    moduleId: 'modulo-4',
    enunciado: 'Qual rotina semanal de manutenção tende a ser sustentável?',
    alternativas: [
      'Reorganizar todo o sistema por duas horas, aos domingos.',
      'Atualizar o quadro só quando um prazo vencer.',
      'Uma sessão curta e fixa: abrir o quadro, atualizar os status, gerar os rascunhos necessários e guardar as evidências.',
      'Reconstruir o quadro do zero a cada semestre.',
    ],
  },
  {
    id: 'niv-q20',
    moduleId: 'modulo-4',
    enunciado: 'Depois do curso, uma ferramenta gratuita que você usa muda seus limites ou seu plano. Qual atitude, desde o início, deixa o sistema mais seguro?',
    alternativas: [
      'Guardar tudo apenas dentro dela e confiar que não vai mudar.',
      'Pagar o plano mais caro para evitar qualquer mudança.',
      'Abandonar o quadro sempre que a ferramenta mudar.',
      'Manter o sistema simples e guardar cópia dos dados importantes, para poder migrar para outra ferramenta.',
    ],
  },
];
