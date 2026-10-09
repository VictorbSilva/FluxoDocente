import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Award, CheckCircle, Clock, Users } from 'lucide-react';
import type { Lesson, Module } from '../../../shared/contracts';

interface VideoPlayerProps {
  lesson: Lesson;
  module: Module;
  moduleLessons: Lesson[];
  onSelectLesson: (id: string) => void;
  concluidas: ReadonlyMap<string, string>;
  onConcluir: (lessonId: string) => Promise<void>;
}

export function VideoPlayer({
  lesson,
  module,
  moduleLessons,
  onSelectLesson,
  concluidas,
  onConcluir,
}: VideoPlayerProps) {
  const [salvando, setSalvando] = useState(false);

  const concluida = concluidas.has(lesson.id);
  const feitas = moduleLessons.filter((l) => concluidas.has(l.id)).length;
  const total = moduleLessons.length;

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
                  disabled={concluida || salvando}
                  className='w-full bg-[#21a3a3] hover:bg-[#13c8b5]'
                >
                  <Award className='h-4 w-4 mr-2' />
                  {concluida
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
            <h3 className='text-lg text-gray-900 mb-2'>Progresso do módulo</h3>
            <p className='text-sm text-gray-600 mb-2'>
              {feitas} de {total} aulas concluídas
            </p>
            <Progress value={total ? (feitas / total) * 100 : 0} />
          </Card>

          <Card className='p-4'>
            <h3 className='text-lg text-gray-900 mb-4'>Aulas do módulo</h3>
            <div className='space-y-3'>
              {moduleLessons.map((l) => (
                <button
                  key={l.id}
                  type='button'
                  onClick={() => onSelectLesson(l.id)}
                  aria-current={l.id === lesson.id ? 'true' : undefined}
                  className={`w-full p-2 rounded-lg text-left ${
                    l.id === lesson.id ? 'bg-[#e0faf6]' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className='flex items-start gap-2'>
                    <span className='flex-1 text-sm text-gray-900'>{l.title}</span>
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
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
