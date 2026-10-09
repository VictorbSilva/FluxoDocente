import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Award, CheckCircle, ChevronDown, Clock, Users } from 'lucide-react';
import { modules, lessons } from '../../../shared/catalog';
import type { Lesson, Module } from '../../../shared/contracts';

interface VideoPlayerProps {
  lesson: Lesson;
  module: Module;
  onSelectLesson: (id: string) => void;
  concluidas: ReadonlyMap<string, string>;
  carregado: boolean;
  onConcluir: (lessonId: string) => Promise<void>;
}

export function VideoPlayer({
  lesson,
  module,
  onSelectLesson,
  concluidas,
  carregado,
  onConcluir,
}: VideoPlayerProps) {
  const [salvando, setSalvando] = useState(false);
  const [abertos, setAbertos] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setSalvando(false);
  }, [lesson.id]);

  const concluida = concluidas.has(lesson.id);

  const ordemGlobal = modules.flatMap((m) =>
    lessons.filter((l) => l.moduleId === m.id),
  );
  const indiceAtual = ordemGlobal.findIndex((l) => l.id === lesson.id);
  const anterior = indiceAtual > 0 ? ordemGlobal[indiceAtual - 1] : undefined;
  const proxima =
    indiceAtual >= 0 && indiceAtual < ordemGlobal.length - 1
      ? ordemGlobal[indiceAtual + 1]
      : undefined;

  const alternarModulo = (moduleId: string) => {
    setAbertos((anteriores) => {
      const novos = new Set(anteriores);
      if (novos.has(moduleId)) {
        novos.delete(moduleId);
      } else {
        novos.add(moduleId);
      }
      return novos;
    });
  };

  const marcarConcluida = async () => {
    setSalvando(true);
    try {
      await onConcluir(lesson.id);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className='max-w-4xl mx-auto px-4 py-6'>
      <div className='grid lg:grid-cols-3 gap-6'>
        {/* Main Video Section */}
        <div className='lg:col-span-2 space-y-4'>
          {/* Video Player */}
          <Card className='overflow-hidden shadow-lg'>
            <div className='relative bg-black aspect-video'>
              <iframe
                className='absolute inset-0 h-full w-full'
                src={'https://www.youtube-nocookie.com/embed/' + lesson.youtubeId}
                title={'Vídeo: ' + lesson.title}
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                referrerPolicy='strict-origin-when-cross-origin'
                allowFullScreen
              />
            </div>
          </Card>

          <div className='flex gap-2'>
            <Button
              variant='outline'
              className='flex-1'
              onClick={() => onSelectLesson(anterior.id)}
              disabled={!anterior}
            >
              Aula anterior
            </Button>
            <Button
              variant='outline'
              className='flex-1'
              onClick={() => onSelectLesson(proxima.id)}
              disabled={!proxima}
            >
              Próxima aula
            </Button>
          </div>

          {/* Video Info */}
          <Card className='p-6'>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex flex-wrap items-center gap-2'>
                  <h2 className='text-xl text-gray-900'>{lesson.title}</h2>
                  {concluida && (
                    <Badge className='bg-[#e0faf6] text-[#177a7a]'>
                      <Award className='h-3 w-3' />
                      Concluído
                    </Badge>
                  )}
                </div>
                <p className='text-sm text-gray-600'>{module.title}</p>
                {(lesson.instructor || lesson.duration) && (
                  <div className='flex items-center gap-4 text-sm text-gray-600'>
                    {lesson.instructor && (
                      <div className='flex items-center gap-1'>
                        <Users className='h-4 w-4' />
                        {lesson.instructor}
                      </div>
                    )}
                    {lesson.duration && (
                      <div className='flex items-center gap-1'>
                        <Clock className='h-4 w-4' />
                        {lesson.duration}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {lesson.description && (
                <p className='text-gray-700 leading-relaxed'>{lesson.description}</p>
              )}

              {lesson.tags?.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {lesson.tags.map((tag) => (
                    <Badge key={tag} variant='outline' className='text-xs'>
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className='pt-4 border-t border-gray-200'>
                <Button
                  onClick={marcarConcluida}
                  disabled={!carregado || concluida || salvando}
                  className='w-full bg-[#177a7a] hover:bg-[#136d6d]'
                >
                  <Award className='h-4 w-4 mr-2' />
                  {!carregado
                    ? 'Carregando...'
                    : concluida
                      ? 'Aula concluída'
                      : salvando
                        ? 'Salvando...'
                        : 'Marcar como Concluído'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          <Card className='p-4'>
            <h3 className='text-lg text-gray-900 mb-4'>Conteúdo do curso</h3>
            <div className='space-y-3'>
              {modules.map((m) => {
                const aulas = lessons.filter((l) => l.moduleId === m.id);
                const feitas = aulas.filter((l) => concluidas.has(l.id)).length;
                const aberto = abertos.has(m.id);
                const listaId = 'aulas-' + m.id;
                const visiveis = aberto
                  ? aulas
                  : aulas.filter((l) => l.id === lesson.id);

                return (
                  <div key={m.id}>
                    <button
                      type='button'
                      onClick={() => alternarModulo(m.id)}
                      disabled={aulas.length === 0}
                      aria-expanded={aberto}
                      aria-controls={listaId}
                      className='w-full flex items-start gap-2 p-2 rounded-lg text-left hover:bg-gray-50 disabled:cursor-not-allowed disabled:hover:bg-transparent'
                    >
                      <span className='flex-1'>
                        <span className='block text-sm text-gray-900'>
                          {m.title}
                        </span>
                        {aulas.length === 0 ? (
                          <span className='block text-xs text-gray-500 mt-1'>
                            Aulas em breve
                          </span>
                        ) : (
                          carregado && (
                            <span className='block text-xs text-[#177a7a] mt-1'>
                              {feitas} de {aulas.length} concluídas
                            </span>
                          )
                        )}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 mt-0.5 text-gray-500 transition-transform ${
                          aberto ? 'rotate-180' : ''
                        }`}
                        aria-hidden='true'
                      />
                    </button>

                    <ul
                      id={listaId}
                      hidden={visiveis.length === 0}
                      className='mt-1 pl-3 space-y-1'
                    >
                      {visiveis.map((l) => (
                        <li key={l.id}>
                          <button
                            type='button'
                            onClick={() => onSelectLesson(l.id)}
                            aria-current={l.id === lesson.id ? 'true' : undefined}
                            className={`w-full p-2 rounded-lg text-left ${
                              l.id === lesson.id
                                ? 'bg-[#e0faf6]'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <span className='flex items-start gap-2'>
                              <span className='flex-1 text-sm text-gray-900'>
                                {l.title}
                              </span>
                              {concluidas.has(l.id) && (
                                <>
                                  <CheckCircle
                                    className='h-4 w-4 shrink-0 text-[#177a7a]'
                                    aria-hidden='true'
                                  />
                                  <span className='sr-only'>concluída</span>
                                </>
                              )}
                            </span>
                            {l.duration && (
                              <span className='block text-xs text-gray-500 mt-1'>
                                {l.duration}
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
