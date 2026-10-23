import type { Catalogo, Course, Module, Lesson } from './contracts.js';
import { exercicios } from './exercicios.js';
import { perguntasDoNivelamento } from './nivelamento.js';

export const courses: Course[] = [
  {
    id: 'ia-docencia',
    title: 'Fluxo Docente',
    description:
      'Curso on-line para docentes do ensino superior aprenderem a usar ferramentas de Inteligência Artificial de forma ética e prática, do planejamento das aulas à produção de materiais e à organização da rotina acadêmica.',
    moduleIds: ['modulo-1', 'modulo-2', 'modulo-3', 'modulo-4', 'modulo-5'],
    closingYoutubeId: 'Q-9P8p9psng',
  },
];

export const modules: Module[] = [
  {
    id: 'modulo-1',
    title: 'Módulo 1: Engenharia de Prompt',
    description:
      'Capacitação em Engenharia de Prompts para validação de informações essenciais.',
    color: 'from-[#13c8b5] to-[#21a3a3]',
    tags: ['Gemini', 'ChatGPT', 'Claude', 'Perplexity', 'Consensus'],
  },
  {
    id: 'modulo-2',
    title: 'Módulo 2: Otimização do Planejamento',
    description: 'Uso de ferramentas de Inteligência Artificial para otimizar o planejamento das aulas.',
    color: 'from-[#21a3a3] to-[#6cf3d5]',
    tags: ['NotebookLM', 'ChatGPT', 'Claude'],
  },
  {
    id: 'modulo-3',
    title: 'Módulo 3: Avaliação e Feedback',
    description: 'Geração ágil de exercícios, provas e feedbacks.',
    color: 'from-[#177a7a] to-[#21a3a3]',
    tags: [],
  },
  {
    id: 'modulo-4',
    title: 'Módulo 4: Produção de Materiais Visuais',
    description:
      'Criação acelerada de objetos visuais de aprendizagem para aulas práticas e teóricas.',
    color: 'from-[#7375a5] to-[#2b364a]',
    tags: ['Gamma', 'Gemini', 'ChatGPT'],
  },
  {
    id: 'modulo-5',
    title: 'Módulo 5: Gestão de Rotina e Burocracia',
    description:
      'Automação do atendimento ao aluno, controle e organização automatizada de notas.',
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
    durationSeconds: 86,
  },
  {
    id: 'm1-a02',
    moduleId: 'modulo-1',
    youtubeId: 'Njs9-ITchU8',
    title: 'Introdução ao módulo 1',
    durationSeconds: 84,
  },
  {
    id: 'm1-a03',
    moduleId: 'modulo-1',
    youtubeId: 'uR8MO0ySQj0',
    title: 'Engenharia de Prompt Slide 4',
    durationSeconds: 105,
  },
  {
    id: 'm1-a04',
    moduleId: 'modulo-1',
    youtubeId: 'CJdKvN0nxGE',
    title: 'Engenharia de Prompt Slide 5',
    durationSeconds: 146,
  },
  {
    id: 'm1-a05',
    moduleId: 'modulo-1',
    youtubeId: 'k-fBpUce0R8',
    title: 'Engenharia de Prompt Slide 6',
    durationSeconds: 111,
  },
  {
    id: 'm1-a06',
    moduleId: 'modulo-1',
    youtubeId: 'FdTopAJeSqA',
    title: 'Engenharia de Prompt Slide 7',
    durationSeconds: 212,
  },
  {
    id: 'm1-a07',
    moduleId: 'modulo-1',
    youtubeId: '6MyJHfgFwgY',
    title: 'Engenharia de Prompt Slide 8',
    durationSeconds: 261,
  },
  {
    id: 'm1-a08',
    moduleId: 'modulo-1',
    youtubeId: 'VVyaTYAFoFY',
    title: 'Engenharia de Prompt Slide 9',
    durationSeconds: 201,
  },
  {
    id: 'm1-a09',
    moduleId: 'modulo-1',
    youtubeId: '9LeMWp5DLk0',
    title: 'Engenharia de Prompt Slide 10 Exercícios 1 ao 3',
    durationSeconds: 275,
  },
  {
    id: 'm1-a10',
    moduleId: 'modulo-1',
    youtubeId: 'bFMqQ4X6Shg',
    title: 'Engenharia de Prompt Slide 10 Exercícios 4 e 5',
    durationSeconds: 243,
  },
  {
    id: 'm1-a11',
    moduleId: 'modulo-1',
    youtubeId: 'r--tNRNDA5A',
    title: 'Engenharia de Prompt Slide 11',
    durationSeconds: 164,
  },
  {
    id: 'm1-a12',
    moduleId: 'modulo-1',
    youtubeId: 'RKUr59bibFM',
    title: 'Engenharia de Prompt Slide 12 - Finalização',
    durationSeconds: 78,
  },
  {
    id: 'm2-a01',
    moduleId: 'modulo-2',
    youtubeId: 'cokz3ZjpzlI',
    title: 'Introdução do módulo 2 Otimização do Planejamento',
    durationSeconds: 108,
  },
  {
    id: 'm2-a02',
    moduleId: 'modulo-2',
    youtubeId: 'ghEZLwvpcjs',
    title: 'Aula 3 Otimização do Planejamento',
    durationSeconds: 319,
  },
  {
    id: 'm2-a03',
    moduleId: 'modulo-2',
    youtubeId: 'nDYk6VB1KlE',
    title: 'Aula 4 Otimização do Planejamento',
    durationSeconds: 571,
  },
  {
    id: 'm3-a01',
    moduleId: 'modulo-3',
    youtubeId: 'zIZb-b4aphI',
    title: 'Introdução do módulo 3 Avaliação e Feedback',
    durationSeconds: 111,
  },
  {
    id: 'm3-a02',
    moduleId: 'modulo-3',
    youtubeId: 'SNvIB83J3rE',
    title: 'Aula 5 Avaliação e Feedback',
    durationSeconds: 468,
  },
];

export const lessonIds: ReadonlySet<string> = new Set(lessons.map((l) => l.id));
export const courseIds: ReadonlySet<string> = new Set(courses.map((c) => c.id));

export const catalogo: Catalogo = { courses, modules, lessons, exercicios, nivelamento: perguntasDoNivelamento };
