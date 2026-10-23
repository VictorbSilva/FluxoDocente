import type { Course } from '../../../shared/contracts';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface ConclusaoDialogProps {
  curso: Course;
  aberto: boolean;
  onFechar: () => void;
}

export function ConclusaoDialog({ curso, aberto, onFechar }: ConclusaoDialogProps) {
  return (
    <Dialog open={aberto} onOpenChange={(open) => { if (!open) onFechar(); }}>
      <DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{'Parabéns! Você concluiu o curso ' + curso.title + '.'}</DialogTitle>
          <DialogDescription>
            Obrigado por participar. Assista à mensagem de encerramento da equipe.
          </DialogDescription>
        </DialogHeader>

        {curso.closingYoutubeId && (
          <div className='relative bg-black aspect-video'>
            <iframe
              className='absolute inset-0 h-full w-full'
              src={'https://www.youtube-nocookie.com/embed/' + curso.closingYoutubeId}
              title='Vídeo: mensagem de encerramento'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
              referrerPolicy='strict-origin-when-cross-origin'
              allowFullScreen
            />
          </div>
        )}

        <DialogFooter>
          <Button onClick={onFechar} className='bg-[#177a7a] hover:bg-[#136d6d]'>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
