import { useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Play, Clock, Lock } from 'lucide-react';
import { modules, lessons } from '../../../shared/catalog';
import { exercicios } from '../../../shared/exercicios';
import type { ResultadoExercicioDTO } from '../../../shared/contracts';
import { duracaoDoModuloEmSegundos, formatarDuracao } from '../../../shared/duracao';

interface CategoryGridProps {
  onCategorySelect: (categoryId: string) => void;
  moduleIds?: string[];
  mostrarTitulo?: boolean;
  liberado?: (moduleId: string) => boolean;
  resultados?: ReadonlyMap<string, ResultadoExercicioDTO>;
  onExercicio?: (moduleId: string) => void;
  dispensavel?: (moduleId: string) => boolean;
  dispensados?: ReadonlySet<string>;
  onDispensar?: (moduleId: string) => Promise<void>;
}

export function CategoryGrid({
  onCategorySelect,
  moduleIds,
  mostrarTitulo = true,
  liberado,
  resultados,
  onExercicio,
  dispensavel,
  dispensados,
  onDispensar,
}: CategoryGridProps) {
  const [confirmandoDispensa, setConfirmandoDispensa] = useState<string | null>(null);
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
            const bloqueado = liberado ? !liberado(module.id) : false;
            const temExercicio = exercicios.some((exercicio) => exercicio.moduleId === module.id && exercicio.perguntas.length > 0);
            const resultado = resultados?.get(module.id);

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

                  {dispensados?.has(module.id) && (
                    <Badge className='bg-[#e0faf6] text-[#177a7a]'>Dispensado pelo diagnóstico</Badge>
                  )}

                  {dispensavel?.(module.id) && onDispensar && (
                    <div className='space-y-2'>
                      <p className='text-sm text-gray-600'>
                        Você acertou 4 ou mais questões deste módulo no diagnóstico.
                      </p>
                      {confirmandoDispensa === module.id ? (
                        <>
                          <p className='text-sm text-gray-600'>Pular não se desfaz. As aulas continuam abertas.</p>
                          <div className='flex flex-wrap gap-2'>
                            <Button onClick={() => {
                              void onDispensar(module.id);
                              setConfirmandoDispensa(null);
                            }}>
                              Confirmar
                            </Button>
                            <Button variant='ghost' onClick={() => setConfirmandoDispensa(null)}>
                              Cancelar
                            </Button>
                          </div>
                        </>
                      ) : (
                        <Button variant='outline' className='w-full' onClick={() => setConfirmandoDispensa(module.id)}>
                          Pular este módulo
                        </Button>
                      )}
                    </div>
                  )}

                  {bloqueado && (
                    <p className='flex items-center gap-2 text-sm text-gray-600'>
                      <Lock className='h-4 w-4 shrink-0' aria-hidden='true' />
                      Conclua o módulo anterior para liberar.
                    </p>
                  )}

                  <Button
                    onClick={() => onCategorySelect(module.id)}
                    disabled={bloqueado || total === 0}
                    className='w-full mt-4 bg-gradient-to-r bg-[#177a7a] hover:bg-[#136d6d]'
                  >
                    <Play className='h-4 w-4 mr-2' />
                    {bloqueado ? 'Bloqueado' : total === 0 ? 'Aulas em breve' : 'Começar módulo'}
                  </Button>
                  {!bloqueado && temExercicio && onExercicio && (
                    <div className='space-y-2'>
                      <Button variant='outline' className='w-full' onClick={() => onExercicio(module.id)}>
                        {resultado ? 'Refazer avaliação' : 'Fazer avaliação'}
                      </Button>
                      {resultado?.aprovado && (
                        <Badge className='bg-[#e0faf6] text-[#177a7a]'>Avaliação aprovada</Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
