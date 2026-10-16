import { Card, CardHeader, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Play, Clock } from 'lucide-react';
import { modules, lessons } from '../../../shared/catalog';
import { duracaoDoModuloEmSegundos, formatarDuracao } from '../../../shared/duracao';

interface CategoryGridProps {
  onCategorySelect: (categoryId: string) => void;
  moduleIds?: string[];
  mostrarTitulo?: boolean;
}

export function CategoryGrid({
  onCategorySelect,
  moduleIds,
  mostrarTitulo = true,
}: CategoryGridProps) {
  const modulos = moduleIds
    ? moduleIds.map((id) => modules.find((module) => module.id === id)).filter(Boolean)
    : modules;

  return (
    <section className='py-12 md:py-16 bg-white'>
      <div className='max-w-7xl mx-auto px-4'>
        {mostrarTitulo && (
          <div className='text-center mb-12'>
            <h2 className='text-2xl md:text-3xl text-gray-900 mb-4'>
              Escolha sua trilha de aprendizagem
            </h2>
            <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
              Explore conteúdos desenvolvidos especialmente para docentes do ensino superior e aprenda a utilizar a Inteligência Artificial de forma ética, estratégica e alinhada às demandas educacionais atuais.
            </p>
          </div>
        )}

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {modulos.map((module) => {
            const total = lessons.filter((l) => l.moduleId === module.id).length;
            const duracao = formatarDuracao(duracaoDoModuloEmSegundos(module.id));

            return (
              <Card
                key={module.id}
                className='group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md'
              >
                <div
                  className={`h-2 bg-gradient-to-r ${module.color} rounded-t-lg`}
                ></div>

                <CardHeader className='pb-4'>
                  <h3 className='text-lg text-gray-900 group-hover:text-[#177a7a] transition-colors'>
                    {module.title}
                  </h3>
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
                    {duracao && (
                      <div className='flex items-center gap-1'>
                        <Clock className='h-3 w-3' />
                        {duracao}
                      </div>
                    )}
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
                    {total === 0 ? 'Aulas em breve' : 'Começar módulo'}
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
