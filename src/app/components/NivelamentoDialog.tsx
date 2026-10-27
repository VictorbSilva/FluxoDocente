import { Fragment, useEffect, useRef, useState } from 'react';
import { modules } from '../../../shared/catalog';
import type { PerguntaDTO } from '../../../shared/contracts';
import { ordemEmbaralhada } from '../lib/embaralhar';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface NivelamentoDialogProps {
  perguntas: PerguntaDTO[];
  aberto: boolean;
  onPular: () => Promise<boolean>;
  onEnviar: (respostas: number[]) => Promise<boolean>;
}

export function NivelamentoDialog({
  perguntas,
  aberto,
  onPular,
  onEnviar,
}: NivelamentoDialogProps) {
  const [respostas, setRespostas] = useState<(number | null)[]>(
    () => perguntas.map(() => null),
  );
  const [ordens, setOrdens] = useState<number[][]>(
    () => perguntas.map((pergunta) => ordemEmbaralhada(pergunta.alternativas.length)),
  );
  const [enviando, setEnviando] = useState(false);
  const [confirmandoPulo, setConfirmandoPulo] = useState(false);
  const [pulando, setPulando] = useState(false);
  const envioAtual = useRef(0);
  const confirmacaoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    envioAtual.current += 1;
    setRespostas(perguntas.map(() => null));
    setOrdens(perguntas.map((pergunta) => ordemEmbaralhada(pergunta.alternativas.length)));
    setEnviando(false);
    setConfirmandoPulo(false);
    setPulando(false);
    return () => {
      envioAtual.current += 1;
    };
  }, [perguntas, aberto]);

  // O X fica no topo e o rodapé, no fim da rolagem: leva a confirmação para a vista.
  useEffect(() => {
    if (!confirmandoPulo) return;
    confirmacaoRef.current?.scrollIntoView({ block: 'nearest' });
    confirmacaoRef.current?.querySelector('button')?.focus({ preventScroll: true });
  }, [confirmandoPulo]);

  const todasRespondidas = respostas.every((resposta) => resposta !== null);

  const enviar = async () => {
    if (!todasRespondidas || enviando) return;
    const envio = ++envioAtual.current;
    setEnviando(true);
    try {
      await onEnviar(respostas as number[]);
    } finally {
      if (envioAtual.current === envio) setEnviando(false);
    }
  };

  const pular = async () => {
    if (pulando || enviando) return;
    const envio = ++envioAtual.current;
    setPulando(true);
    try {
      await onPular();
    } finally {
      if (envioAtual.current === envio) setPulando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={(open) => { if (!open && !enviando) setConfirmandoPulo(true); }}>
      <DialogContent className='max-h-[85vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Módulo 0 · Questionário diagnóstico</DialogTitle>
          <DialogDescription>
            Este diagnóstico não vale nota. Ele serve para indicarmos o melhor caminho para você. Responda sem consultar nenhum material e escolha a alternativa que você considera mais adequada. As respostas fazem parte da pesquisa do TCC. Se acertar 4 ou 5 questões de um módulo, você poderá pular esse módulo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => { event.preventDefault(); void enviar(); }} className='space-y-6'>
          {perguntas.map((pergunta, indice) => (
            <Fragment key={pergunta.id}>
              {pergunta.moduleId && perguntas.findIndex((item) => item.moduleId === pergunta.moduleId) === indice && (
                <h3 className='text-base text-gray-900 pt-2'>
                  {modules.find((modulo) => modulo.id === pergunta.moduleId)?.title}
                </h3>
              )}
              <fieldset disabled={enviando || pulando} className='space-y-3'>
                <legend className='whitespace-pre-line'>
                  {indice + 1}. {pergunta.enunciado}
                </legend>
                {ordens[indice].map((indiceAlternativa, posicao) => (
                  <label key={indiceAlternativa} className='flex items-start gap-2 text-sm text-gray-700'>
                    <input
                      type='radio'
                      name={pergunta.id}
                      value={indiceAlternativa}
                      checked={respostas[indice] === indiceAlternativa}
                      onChange={() => setRespostas((anteriores) =>
                        anteriores.map((resposta, i) => i === indice ? indiceAlternativa : resposta),
                      )}
                      className='mt-1 shrink-0 accent-[#177a7a]'
                    />
                    <span>{String.fromCharCode(65 + posicao)}) {pergunta.alternativas[indiceAlternativa]}</span>
                  </label>
                ))}
              </fieldset>
            </Fragment>
          ))}

          {confirmandoPulo ? (
            <div ref={confirmacaoRef} className='space-y-3'>
              <p id='confirmacao-pulo' className='text-sm text-gray-700'>
                Tem certeza? O questionário só pode ser feito uma vez. Se pular, ele não aparece de novo e nenhum módulo poderá ser pulado pelo diagnóstico.
              </p>
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  aria-describedby='confirmacao-pulo'
                  disabled={pulando}
                  onClick={() => setConfirmandoPulo(false)}
                >
                  Voltar ao questionário
                </Button>
                <Button type='button' disabled={pulando} onClick={() => void pular()} className='bg-[#177a7a] hover:bg-[#136d6d]'>
                  {pulando ? 'Pulando...' : 'Sim, pular'}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <DialogFooter>
              <Button type='button' variant='outline' disabled={enviando} onClick={() => setConfirmandoPulo(true)}>
                Pular questionário
              </Button>
              <Button type='submit' disabled={!todasRespondidas || enviando} className='bg-[#177a7a] hover:bg-[#136d6d]'>
                {enviando ? 'Enviando...' : 'Enviar'}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
