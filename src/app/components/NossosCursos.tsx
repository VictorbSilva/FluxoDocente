import { useState } from 'react';
import { Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { courses, lessons } from '../../../shared/catalog';
import { duracaoDoCursoEmSegundos, formatarDuracao } from '../../../shared/duracao';
import type { MatriculaDTO } from '../../../shared/contracts';

interface NossosCursosProps {
  matriculas: MatriculaDTO[];
  carregado: boolean;
  onMatricular: (courseId: string) => Promise<void>;
  onIrParaMeusCursos: () => void;
}

export function NossosCursos({
  matriculas,
  carregado,
  onMatricular,
  onIrParaMeusCursos,
}: NossosCursosProps) {
  const [matriculando, setMatriculando] = useState<string | null>(null);

  const fazerMatricula = async (courseId: string) => {
    setMatriculando(courseId);
    try {
      await onMatricular(courseId);
    } finally {
      setMatriculando(null);
    }
  };

  return (
    <section className='py-12 md:py-16 bg-white'>
      <div className='max-w-7xl mx-auto px-4'>
        <h2 className='text-2xl md:text-3xl text-gray-900 mb-4'>Mais cursos</h2>
        <p className='text-lg text-gray-600 mb-6'>
          Escolha um curso e faça sua matrícula para acompanhar seu progresso.
        </p>
        <div className='grid md:grid-cols-2 gap-6'>
          {courses.map((curso) => {
            const aulas = lessons.filter((l) => curso.moduleIds.includes(l.moduleId)).length;
            const duracao = formatarDuracao(duracaoDoCursoEmSegundos(curso.id));
            const matriculado = matriculas.some((matricula) => matricula.courseId === curso.id);

            return (
              <Card key={curso.id} className='p-6 items-start'>
                <h3 className='text-xl text-gray-900'>{curso.title}</h3>
                <p className='text-gray-600'>{curso.description}</p>
                <div className='flex flex-wrap items-center gap-4 text-sm text-gray-500'>
                  <span>{curso.moduleIds.length} módulos · {aulas} aulas</span>
                  {duracao && (
                    <span className='flex items-center gap-1'>
                      <Clock className='h-4 w-4' />
                      {duracao}
                    </span>
                  )}
                </div>
                {matriculado ? (
                  <>
                    <Badge>Matriculado</Badge>
                    <Button variant='outline' onClick={onIrParaMeusCursos}>
                      Ir para Meus cursos
                    </Button>
                  </>
                ) : (
                  <Button
                    className='bg-[#177a7a] hover:bg-[#136d6d]'
                    disabled={!carregado || matriculando !== null}
                    onClick={() => fazerMatricula(curso.id)}
                  >
                    {matriculando === curso.id ? 'Matriculando...' : 'Matricular-se'}
                  </Button>
                )}
              </Card>
            );
          })}
          <Card className='p-6 border-dashed'>
            <h3 className='text-xl text-gray-900'>Em breve mais cursos</h3>
            <p className='text-gray-600'>Novos cursos vão aparecer aqui.</p>
          </Card>
        </div>
      </div>
    </section>
  );
}
