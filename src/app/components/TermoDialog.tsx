import { TEXTO_DO_TERMO } from '../../../shared/termo';
import { Button } from './ui/button';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from './ui/dialog';

interface TermoDialogProps {
  aberto: boolean;
  onFechar: () => void;
}

export function TermoDialog({ aberto, onFechar }: TermoDialogProps) {
  return (
    <Dialog open={aberto} onOpenChange={(open) => { if (!open) onFechar(); }}>
      <DialogContent className='max-h-[85vh] overflow-y-auto' aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Termo de consentimento</DialogTitle>
        </DialogHeader>
        <div className='space-y-4 text-sm text-gray-700 leading-relaxed'>
          {TEXTO_DO_TERMO.split('\n\n').map((paragrafo, indice) => (
            <p key={indice}>{paragrafo}</p>
          ))}
        </div>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={onFechar}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
