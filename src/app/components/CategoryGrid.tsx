import { Card, CardHeader, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Play, Clock } from 'lucide-react';
import { modules, lessons } from '../../../shared/catalog';

interface CategoryGridProps {
  onCategorySelect: (categoryId: string) => void;
}

export function CategoryGrid({ onCategorySelect }: CategoryGridProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Iniciante':
        return 'bg-[#e0faf6] text-[#177a7a]';
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
            Escolha sua trilha de aprendizagem
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Explore conteúdos desenvolvidos especialmente para docentes do ensino superior e aprenda a utilizar a Inteligência Artificial de forma ética, estratégica e alinhada às demandas educacionais atuais.
          </p>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {modules.map((module) => {
            const total = lessons.filter((l) => l.moduleId === module.id).length;

            return (
              <Card
                key={module.id}
                className='group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md'
              >
                <div
                  className={`h-2 bg-gradient-to-r ${module.color} rounded-t-lg`}
                ></div>

                <CardHeader className='pb-4'>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='text-3xl'>{module.icon}</div>
                      <div>
                        <h3 className='text-lg text-gray-900 group-hover:text-[#177a7a] transition-colors'>
                          {module.title}
                        </h3>
                        <Badge
                          variant='secondary'
                          className={getDifficultyColor(module.difficulty)}
                        >
                          {module.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className='space-y-4'>
                  <p className='text-sm text-gray-600 leading-relaxed'>
                    {module.description}
                  </p>

                  <div className='flex items-center gap-4 text-xs text-gray-500'>
                    <div className='flex items-center gap-1'>
                      <Play className='h-3 w-3' />
                      {total} {total === 1 ? 'aula' : 'aulas'}
                    </div>
                    <div className='flex items-center gap-1'>
                      <Clock className='h-3 w-3' />
                      {module.duration}
                    </div>
                  </div>

                  <div className='flex flex-wrap gap-1'>
                    {module.tags.map((tag) => (
                      <Badge key={tag} variant='outline' className='text-xs'>
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    onClick={() => onCategorySelect(module.id)}
                    disabled={total === 0}
                    className='w-full mt-4 bg-gradient-to-r bg-[#177a7a] hover:bg-[#136d6d]'
                  >
                    <Play className='h-4 w-4 mr-2' />
                    {total === 0 ? 'Aulas em breve' : 'Começar Curso'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
