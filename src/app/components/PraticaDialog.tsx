import { Square } from 'lucide-react';
import type { PraticaGuiada } from '../../../shared/contracts';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface PraticaDialogProps {
  pratica: PraticaGuiada;
  tituloDoModulo: string;
  aberto: boolean;
  onFechar: () => void;
}

export function PraticaDialog({ pratica, tituloDoModulo, aberto, onFechar }: PraticaDialogProps) {
  return (
    <Dialog open={aberto} onOpenChange={(open) => { if (!open) onFechar(); }}>
      <DialogContent className='max-h-[85vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Prática guiada · {tituloDoModulo}</DialogTitle>
          <DialogDescription>
            Exercícios para fazer com as ferramentas de IA antes da avaliação. São opcionais e não valem nota.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 text-sm text-gray-700 leading-relaxed'>
          <p><strong>Objetivo do módulo:</strong> {pratica.objetivo}</p>

          {pratica.exercicios.map((exercicio, indice) => (
            <section key={exercicio.titulo} className='space-y-3'>
              <h3 className='text-base font-semibold text-gray-900'>{indice + 1}. {exercicio.titulo}</h3>
              <p>{exercicio.resumo}</p>
              {exercicio.foco && <p className='text-xs text-[#21a3a3]'>{exercicio.foco}</p>}
              <p className='font-semibold'>Tarefa:</p>
              <ul className='list-disc pl-5 space-y-2'>
                {exercicio.tarefas.map((tarefa) => <li key={tarefa}>{tarefa}</li>)}
              </ul>
            </section>
          ))}

          <section className='space-y-3'>
            <h3 className='text-base font-semibold text-gray-900'>Checklist</h3>
            <ul className='space-y-2'>
              {pratica.checklist.map((item) => (
                <li key={item} className='flex items-start gap-2'>
                  <Square className='h-4 w-4 shrink-0 mt-1' aria-hidden='true' />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className='space-y-3'>
            <h3 className='text-base font-semibold text-gray-900'>Perguntas para reflexão</h3>
            <ol className='list-decimal pl-5 space-y-2'>
              {pratica.reflexao.map((pergunta) => <li key={pergunta}>{pergunta}</li>)}
            </ol>
          </section>
        </div>

        <DialogFooter>
          <Button asChild variant='outline'>
            <a href={pratica.pdf} download>Baixar caderno em PDF</a>
          </Button>
          <Button onClick={onFechar} className='bg-[#177a7a] hover:bg-[#136d6d]'>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
