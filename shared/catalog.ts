import type { Module, Lesson } from './contracts.js';

export const modules: Module[] = [
  {
    id: 'modulo-1',
    title: 'Módulo 1: Pesquisa e Fundamentação',
    description:
      'Capacitação em Engenharia de Prompts para validação de informações essenciais.',
    icon: '📓',
    duration: '2-15 min',
    difficulty: 'Intermediário',
    color: 'from-[#13c8b5] to-[#21a3a3]',
    tags: ['Gemini', 'ChatGPT', 'Claude', 'Perplexity', 'Consensus'],
  },
  {
    id: 'modulo-2',
    title: 'Módulo 2: Design de Atividades e Inclusão',
    description: 'Geração ágil de exercícios, provas e feedbacks.',
    icon: '⚡',
    duration: '5-20 min',
    difficulty: 'Iniciante',
    color: 'from-[#21a3a3] to-[#6cf3d5]',
    tags: ['NotebookLM', 'ChatGPT', 'Claude'],
  },
  {
    id: 'modulo-3',
    title: 'Módulo 3: Produção de Materiais Visuais',
    description:
      'Criação acelerada de objetos visuais de aprendizagem para aulas práticas e teóricas.',
    icon: '📚',
    duration: '10-25 min',
    difficulty: 'Intermediário',
    color: 'from-[#7375a5] to-[#2b364a]',
    tags: ['Gamma', 'Gemini', 'ChatGPT'],
  },
  {
    id: 'modulo-4',
    title: 'Módulo 4: Gestão de Rotina e Burocracia',
    description:
      'Automação do atendimento ao aluno, controle e organização automatizada de notas.',
    icon: '🕵️',
    duration: '8-30 min',
    difficulty: 'Intermediário',
    color: 'from-orange-500 to-red-500',
    tags: ['Notion', 'Trello', 'ClickUp'],
  },
];

// Preenchido com o conteúdo aprovado pelos autores. A ordem do array é a ordem de exibição dentro do módulo.
export const lessons: Lesson[] = [
  {
    id: 'm1-a01',
    moduleId: 'modulo-1',
    youtubeId: 'AkH9RGYHoLs',
    title: 'Introdução da plataforma',
  },
  {
    id: 'm1-a02',
    moduleId: 'modulo-1',
    youtubeId: 'Njs9-ITchU8',
    title: 'Introdução ao módulo 1',
  },
  {
    id: 'm1-a03',
    moduleId: 'modulo-1',
    youtubeId: 'uR8MO0ySQj0',
    title: 'Engenharia de Prompt Slide 4',
  },
  {
    id: 'm1-a04',
    moduleId: 'modulo-1',
    youtubeId: 'CJdKvN0nxGE',
    title: 'Engenharia de Prompt Slide 5',
  },
  {
    id: 'm1-a05',
    moduleId: 'modulo-1',
    youtubeId: 'k-fBpUce0R8',
    title: 'Engenharia de Prompt Slide 6',
  },
  {
    id: 'm1-a06',
    moduleId: 'modulo-1',
    youtubeId: 'FdTopAJeSqA',
    title: 'Engenharia de Prompt Slide 7',
  },
  {
    id: 'm1-a07',
    moduleId: 'modulo-1',
    youtubeId: '6MyJHfgFwgY',
    title: 'Engenharia de Prompt Slide 8',
  },
  {
    id: 'm1-a08',
    moduleId: 'modulo-1',
    youtubeId: 'VVyaTYAFoFY',
    title: 'Engenharia de Prompt Slide 9',
  },
  {
    id: 'm1-a09',
    moduleId: 'modulo-1',
    youtubeId: '9LeMWp5DLk0',
    title: 'Engenharia de Prompt Slide 10 Exercícios 1 ao 3',
  },
  {
    id: 'm1-a10',
    moduleId: 'modulo-1',
    youtubeId: 'bFMqQ4X6Shg',
    title: 'Engenharia de Prompt Slide 10 Exercícios 4 e 5',
  },
  {
    id: 'm1-a11',
    moduleId: 'modulo-1',
    youtubeId: 'r--tNRNDA5A',
    title: 'Engenharia de Prompt Slide 11',
  },
  {
    id: 'm1-a12',
    moduleId: 'modulo-1',
    youtubeId: 'RKUr59bibFM',
    title: 'Engenharia de Prompt Slide 12 - Finalização',
  },
];

export const lessonIds: ReadonlySet<string> = new Set(lessons.map((l) => l.id));
