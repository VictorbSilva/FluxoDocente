import { Award, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { CategoryGrid } from './CategoryGrid';
import { courses, lessons, modules } from '../../../shared/catalog';
import { duracaoDoCursoEmSegundos, formatarDuracao } from '../../../shared/duracao';
import type { MatriculaDTO, NivelamentoDTO, ResultadoExercicioDTO } from '../../../shared/contracts';

interface MeusCursosProps {
  matriculas: MatriculaDTO[];
  carregado: boolean;
  concluidas: ReadonlyMap<string, string>;
  concluido: (courseId: string) => boolean;
  onVerMensagem: (courseId: string) => void;
  onCategorySelect: (categoryId: string) => void;
  onVerNossosCursos: () => void;
  liberado: (moduleId: string) => boolean;
  resultados: ReadonlyMap<string, ResultadoExercicioDTO>;
  onExercicio: (moduleId: string) => void;
  nivelamento: NivelamentoDTO | null;
  onResponderNivelamento: () => void;
  dispensavel: (moduleId: string) => boolean;
  dispensados: ReadonlySet<string>;
  onDispensar: (moduleId: string) => Promise<void>;
}

export function MeusCursos({
  matriculas,
  carregado,
  concluidas,
  concluido,
  onVerMensagem,
  onCategorySelect,
  onVerNossosCursos,
  liberado,
  resultados,
  onExercicio,
  nivelamento,
  onResponderNivelamento,
  dispensavel,
  dispensados,
  onDispensar,
}: MeusCursosProps) {
  const cursos = courses.filter((curso) =>
    matriculas.some((matricula) => matricula.courseId === curso.id),
  );

  return (
    <section className='py-12 md:py-16 bg-white'>
      <div className='max-w-7xl mx-auto px-4'>
        <h2 className='text-2xl md:text-3xl text-gray-900 mb-6'>Meus cursos</h2>
        {!carregado ? (
          <p className='text-gray-600'>Carregando seus cursos...</p>
        ) : cursos.length === 0 ? (
          <Card className='p-6 items-start'>
            <p className='text-gray-600'>Você ainda não está matriculado em nenhum curso.</p>
            <Button onClick={onVerNossosCursos} className='bg-[#177a7a] hover:bg-[#136d6d]'>
              Ver nossos cursos
            </Button>
          </Card>
        ) : (
          cursos.map((curso) => {
            const aulas = lessons.filter((l) => curso.moduleIds.includes(l.moduleId));
            const total = aulas.length;
            const feitas = aulas.filter((l) => concluidas.has(l.id)).length;
            const duracao = formatarDuracao(duracaoDoCursoEmSegundos(curso.id));
            const finalizado = concluido(curso.id);
            const modulosDispensaveis = modules.filter((modulo) =>
              curso.moduleIds.includes(modulo.id)
              && nivelamento?.dispensaveis.includes(modulo.id)
              && !dispensados.has(modulo.id),
            );

            return (
              <div key={curso.id}>
                <Card className='p-6'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <h3 className='text-xl text-gray-900'>{curso.title}</h3>
                    {finalizado && (
                      <Badge className='bg-[#e0faf6] text-[#177a7a]'>
                        <Award className='h-4 w-4' />
                        Concluído
                      </Badge>
                    )}
                  </div>
                  <p className='text-gray-600'>{curso.description}</p>
                  <div className='flex flex-wrap items-center gap-4 text-sm text-gray-500'>
                    <span>{feitas} de {total} aulas concluídas</span>
                    {duracao && (
                      <span className='flex items-center gap-1'>
                        <Clock className='h-4 w-4' />
                        {duracao}
                      </span>
                    )}
                  </div>
                  <Progress
                    aria-label={'Progresso no curso ' + curso.title}
                    value={total ? (feitas / total) * 100 : 0}
                  />
                  {finalizado && (
                    <Button variant='outline' onClick={() => onVerMensagem(curso.id)} className='self-start'>
                      Ver mensagem de encerramento
                    </Button>
                  )}
                </Card>
                {nivelamento?.disponivel && (
                  <Card className='p-6 mt-6 items-start'>
                    <h3 className='text-xl text-gray-900'>Módulo 0: Questionário diagnóstico</h3>
                    {nivelamento.respondido ? (
                      <>
                        <Badge className='bg-[#e0faf6] text-[#177a7a]'>Respondido</Badge>
                        {modulosDispensaveis.length > 0 && (
                          <p className='text-gray-600'>
                            Você pode pular: {modulosDispensaveis.map((modulo) => modulo.title).join(', ')}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className='text-gray-600'>Responda para saber se pode pular algum módulo.</p>
                        <Button onClick={onResponderNivelamento} className='bg-[#177a7a] hover:bg-[#136d6d]'>
                          Responder agora
                        </Button>
                      </>
                    )}
                  </Card>
                )}
                <CategoryGrid
                  moduleIds={curso.moduleIds}
                  mostrarTitulo={false}
                  onCategorySelect={onCategorySelect}
                  liberado={liberado}
                  resultados={resultados}
                  onExercicio={onExercicio}
                  dispensavel={dispensavel}
                  dispensados={dispensados}
                  onDispensar={onDispensar}
                />
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
