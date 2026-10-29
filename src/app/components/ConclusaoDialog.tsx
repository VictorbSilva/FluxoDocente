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
  onBaixarCertificado: () => void;
}

export function ConclusaoDialog({ curso, aberto, onFechar, onBaixarCertificado }: ConclusaoDialogProps) {
  return (
    <Dialog open={aberto} onOpenChange={(open) => { if (!open) onFechar(); }}>
      <DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{'Parabéns! Você concluiu o curso ' + curso.title + '.'}</DialogTitle>
          <DialogDescription>
            Obrigado por participar. Seu certificado já pode ser baixado.
            {curso.formularioUrl && (
              <span className='block mt-2'>
                Antes de sair, responda o formulário de avaliação do curso. Suas respostas fazem parte da pesquisa do TCC.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant='outline' onClick={onFechar}>Fechar</Button>
          {curso.formularioUrl && (
            <Button asChild variant='outline'>
              <a href={curso.formularioUrl} target='_blank' rel='noopener noreferrer'>
                Responder o formulário
              </a>
            </Button>
          )}
          <Button onClick={() => { onFechar(); onBaixarCertificado(); }} className='bg-[#177a7a] hover:bg-[#136d6d]'>Baixar certificado</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
