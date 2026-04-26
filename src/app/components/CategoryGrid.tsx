import { Card, CardHeader, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Play, Clock, Users, Star } from 'lucide-react';

interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  videoCount: number;
  duration: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  color: string;
  tags: string[];
}

interface CategoryGridProps {
  onCategorySelect: (categoryId: string) => void;
}

export function CategoryGrid({ onCategorySelect }: CategoryGridProps) {
  const categories: Category[] = [
    {
      id: 'notion-basics',
      title: 'Notion',
      description:
        'Organização centralizada de planos de aula, ementas e criação de bases de conhecimento colaborativas para alunos.',
      icon: '📓',
      videoCount: 25,
      duration: '2-15 min',
      difficulty: 'Intermediário',
      color: 'from-[#13c8b5] to-[#21a3a3]',
      tags: ['Planejamento', 'Gestão', 'Colaboração'],
    },
    {
      id: 'gamma-slides',
      title: 'Gamma (Slides)',
      description:
        'Geração ágil de apresentações e materiais de apoio visual com auxílio direto de Inteligência Artificial.',
      icon: '⚡',
      videoCount: 18,
      duration: '5-20 min',
      difficulty: 'Iniciante',
      color: 'from-[#21a3a3] to-[#6cf3d5]',
      tags: ['Apresentações', 'IA Visual', 'Agilidade'],
    },
    {
      id: 'notebooklm-research',
      title: 'NotebookLM',
      description:
        'Assistente de pesquisa baseado em IA para analisar artigos científicos, livros e resumir bibliografias complexas.',
      icon: '📚',
      videoCount: 22,
      duration: '10-25 min',
      difficulty: 'Intermediário',
      color: 'from-[#7375a5] to-[#2b364a]',
      tags: ['Pesquisa', 'Resumos', 'Análise de Texto'],
    },
    {
      id: 'perplexity-search',
      title: 'Perplexity',
      description:
        'Motor de busca conversacional para pesquisa rápida, verificação de fatos e curadoria de conteúdo atualizado para aulas.',
      icon: '🕵️',
      videoCount: 30,
      duration: '8-30 min',
      difficulty: 'Intermediário',
      color: 'from-orange-500 to-red-500',
      tags: ['Pesquisa Web', 'Curadoria', 'Fatos'],
    },
    {
      id: 'gen-ai-prompts',
      title: 'IA Generativa (Gemini, Copilot, GPT)',
      description:
        'Fundamentos de Engenharia de Prompts para docentes utilizarem assistentes virtuais na criação de exercícios e rubricas.',
      icon: '🤖',
      videoCount: 20,
      duration: '6-18 min',
      difficulty: 'Avançado',
      color: 'from-[#7375a5] to-[#21a3a3]',
      tags: ['Prompts', 'Avaliação', 'Inovação'],
    },
    {
      id: 'prezi-dynamics',
      title: 'Prezi (Slides)',
      description:
        'Estruturação de apresentações não-lineares focadas em storytelling e retenção da atenção dos estudantes.',
      icon: '🎯',
      videoCount: 35,
      duration: '15-40 min',
      difficulty: 'Intermediário',
      color: 'from-[#6cf3d5] to-[#13c8b5]',
      tags: ['Engajamento', 'Visual', 'Storytelling'],
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Iniciante':
        return 'bg-[#e0faf6] text-[#21a3a3]';
      case 'Intermediário':
        return 'bg-yellow-100 text-yellow-700';
      case 'Avançado':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <section className='py-12 md:py-16 bg-white'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='text-center mb-12'>
          <h2 className='text-2xl md:text-3xl text-gray-900 mb-4'>
            Escolha seu caminho de transformação
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Cada categoria foi pensada para te dar ferramentas práticas e
            inspiração para construir uma nova vida.
          </p>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {categories.map((category) => (
            <Card
              key={category.id}
              className='group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md'
            >
              <div
                className={`h-2 bg-gradient-to-r ${category.color} rounded-t-lg`}
              ></div>

              <CardHeader className='pb-4'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='text-3xl'>{category.icon}</div>
                    <div>
                      <h3 className='text-lg text-gray-900 group-hover:text-[#21a3a3] transition-colors'>
                        {category.title}
                      </h3>
                      <Badge
                        variant='secondary'
                        className={getDifficultyColor(category.difficulty)}
                      >
                        {category.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className='space-y-4'>
                <p className='text-sm text-gray-600 leading-relaxed'>
                  {category.description}
                </p>

                <div className='flex items-center gap-4 text-xs text-gray-500'>
                  <div className='flex items-center gap-1'>
                    <Play className='h-3 w-3' />
                    {category.videoCount} vídeos
                  </div>
                  <div className='flex items-center gap-1'>
                    <Clock className='h-3 w-3' />
                    {category.duration}
                  </div>
                </div>

                <div className='flex flex-wrap gap-1'>
                  {category.tags.map((tag) => (
                    <Badge key={tag} variant='outline' className='text-xs'>
                      {tag}
                    </Badge>
                  ))}
                </div>

                <Button
                  onClick={() => onCategorySelect(category.id)}
                  className='w-full mt-4 bg-gradient-to-r bg-[#21a3a3] hover:bg-[#13c8b5]'
                >
                  <Play className='h-4 w-4 mr-2' />
                  Começar Curso
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
