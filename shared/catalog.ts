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
export const lessons: Lesson[] = [];

export const lessonIds: ReadonlySet<string> = new Set(lessons.map((l) => l.id));
