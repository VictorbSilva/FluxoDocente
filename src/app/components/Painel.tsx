import { useState } from 'react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { modules, lessons } from '../../../shared/catalog';
import type { UserDTO } from '../../../shared/contracts';

interface PainelProps {
  usuario: UserDTO;
  concluidas: ReadonlyMap<string, string>;
  carregado: boolean;
  onSalvarNome: (nome: string) => Promise<void>;
}

export function Painel({ usuario, concluidas, carregado, onSalvarNome }: PainelProps) {
  const [nome, setNome] = useState(usuario.nome ?? '');
  const [salvando, setSalvando] = useState(false);
  const total = lessons.length;
  const feitas = lessons.filter((l) => concluidas.has(l.id)).length;

  const salvarNome = async (event) => {
    event.preventDefault();
    setSalvando(true);
    try {
      await onSalvarNome(nome.trim());
    } finally {
      setSalvando(false);
    }
  };

  return (
    <section className='py-12 md:py-16 bg-gradient-to-br from-[#e0faf6] to-[#f0fafa]'>
      <div className='max-w-4xl mx-auto px-4 space-y-6'>
        <div>
          <h2 className='text-2xl md:text-3xl text-gray-900 mb-4'>
            {usuario.nome ? 'Olá, ' + usuario.nome.split(' ')[0] : 'Olá!'}
          </h2>
          <p className='text-lg text-gray-600'>Acompanhe seu perfil e seu progresso.</p>
        </div>

        <Card className='p-6'>
          <h3 className='text-lg text-gray-900'>Seu perfil</h3>
          <form onSubmit={salvarNome} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='nome-perfil'>Nome</Label>
              <Input
                id='nome-perfil'
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                maxLength={120}
              />
              <p className='text-xs text-gray-500'>
                É o nome que vai aparecer no certificado.
              </p>
            </div>
            <p className='text-sm text-gray-600 break-words'>E-mail: {usuario.email}</p>
            <Button
              type='submit'
              className='bg-[#177a7a] hover:bg-[#136d6d]'
              disabled={salvando || nome.trim() === '' || nome.trim() === (usuario.nome ?? '')}
            >
              {salvando ? 'Salvando...' : 'Salvar nome'}
            </Button>
          </form>
        </Card>

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
                aria-label='Aulas concluídas no curso'
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
                        aria-label={'Progresso em ' + m.title}
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
    </section>
  );
}
