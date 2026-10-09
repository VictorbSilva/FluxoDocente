import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Trophy } from 'lucide-react';
import type { Lesson, Module } from '../../../shared/contracts';

interface ProgressSectionProps {
  modules: Module[];
  lessons: Lesson[];
  concluidas: ReadonlyMap<string, string>;
  carregado: boolean;
}

export function ProgressSection({
  modules,
  lessons,
  concluidas,
  carregado,
}: ProgressSectionProps) {
  const total = lessons.length;
  const feitas = lessons.filter((l) => concluidas.has(l.id)).length;

  return (
    <section className='py-12 md:py-16 bg-gradient-to-br from-[#e0faf6] to-[#f0fafa]'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='text-center mb-12'>
          <div className='flex items-center justify-center gap-2 mb-4'>
            <Trophy className='h-6 w-6 text-yellow-500' />
            <h2 className='text-2xl md:text-3xl text-gray-900'>
              Seu progresso
            </h2>
          </div>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Cada passo conta na sua jornada de transformação. Veja o quanto você
            já evoluiu!
          </p>
        </div>

        <div className='max-w-4xl mx-auto'>
          {!carregado ? (
            <p className='text-center text-gray-600'>
              Carregando seu progresso...
            </p>
          ) : (
            <div className='space-y-6'>
              <Card className='p-6'>
                <h3 className='text-lg text-gray-900 mb-2'>Aulas concluídas</h3>
                {total === 0 ? (
                  <p className='text-sm text-gray-600 mb-2'>
                    Nenhuma aula publicada ainda.
                  </p>
                ) : (
                  <p className='text-2xl text-[#177a7a] mb-2'>
                    {feitas} de {total}
                  </p>
                )}
                <Progress
                  value={total ? (feitas / total) * 100 : 0}
                  className='h-3'
                />
              </Card>

              <Card className='p-6'>
                <h3 className='text-lg text-gray-900 mb-4'>Por módulo</h3>
                <div className='space-y-4'>
                  {modules.map((m) => {
                    const aulas = lessons.filter((l) => l.moduleId === m.id);
                    const feitasModulo = aulas.filter((l) =>
                      concluidas.has(l.id),
                    ).length;

                    return (
                      <div key={m.id} className='space-y-2'>
                        <div className='flex justify-between items-center gap-4'>
                          <span className='text-sm text-gray-700'>{m.title}</span>
                          <span className='shrink-0 text-sm text-gray-600'>
                            {aulas.length
                              ? `${feitasModulo} de ${aulas.length}`
                              : 'Aulas em breve'}
                          </span>
                        </div>
                        <Progress
                          value={
                            aulas.length ? (feitasModulo / aulas.length) * 100 : 0
                          }
                          className='h-2'
                        />
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
