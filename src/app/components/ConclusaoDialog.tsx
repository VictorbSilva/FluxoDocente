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
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant='outline' onClick={onFechar}>Fechar</Button>
          <Button onClick={() => { onFechar(); onBaixarCertificado(); }} className='bg-[#177a7a] hover:bg-[#136d6d]'>Baixar certificado</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
