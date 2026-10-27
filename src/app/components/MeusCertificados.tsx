import { Card } from './ui/card';
import { Button } from './ui/button';
import type { Course } from '../../../shared/contracts';
import { cargaHorariaEmHoras } from '../../../shared/duracao';

interface MeusCertificadosProps {
  cursosConcluidos: Course[];
  onBaixarCertificado: (courseId: string) => void;
}

export function MeusCertificados({ cursosConcluidos, onBaixarCertificado }: MeusCertificadosProps) {
  return (
    <section className='py-12 md:py-16 bg-white'>
      <div className='max-w-7xl mx-auto px-4'>
        <h2 className='text-2xl md:text-3xl text-gray-900 mb-6'>Meus certificados</h2>
        {cursosConcluidos.length === 0 ? <Card className='p-6'>
          <p className='text-gray-600'>
            Você ainda não tem certificados. Quando concluir um curso, o certificado aparece aqui.
          </p>
        </Card> : (
          <div className='grid gap-4 md:grid-cols-2'>
            {cursosConcluidos.map((curso) => {
              const horas = cargaHorariaEmHoras(curso.id);
              return (
                <Card key={curso.id} className='p-6 items-start'>
                  <h3 className='text-xl text-gray-900'>{curso.title}</h3>
                  <p className='text-gray-600'>Carga horária: {horas} {horas === 1 ? 'hora' : 'horas'}</p>
                  <Button onClick={() => onBaixarCertificado(curso.id)} className='bg-[#177a7a] hover:bg-[#136d6d]'>
                    Baixar certificado
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
