import { Fragment, useEffect, useRef, useState } from 'react';
import { modules } from '../../../shared/catalog';
import type { PerguntaDTO } from '../../../shared/contracts';
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
  onAdiar: () => void;
  onEnviar: (respostas: number[]) => Promise<boolean>;
}

export function NivelamentoDialog({
  perguntas,
  aberto,
  onAdiar,
  onEnviar,
}: NivelamentoDialogProps) {
  const [respostas, setRespostas] = useState<(number | null)[]>(
    () => perguntas.map(() => null),
  );
  const [enviando, setEnviando] = useState(false);
  const envioAtual = useRef(0);

  useEffect(() => {
    envioAtual.current += 1;
    setRespostas(perguntas.map(() => null));
    setEnviando(false);
    return () => {
      envioAtual.current += 1;
    };
  }, [perguntas, aberto]);

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

  return (
    <Dialog open={aberto} onOpenChange={(open) => { if (!open) onAdiar(); }}>
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
              <fieldset disabled={enviando} className='space-y-3'>
                <legend className='whitespace-pre-line'>
                  {indice + 1}. {pergunta.enunciado}
                </legend>
                {pergunta.alternativas.map((alternativa, indiceAlternativa) => (
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
                    <span>{String.fromCharCode(65 + indiceAlternativa)}) {alternativa}</span>
                  </label>
                ))}
              </fieldset>
            </Fragment>
          ))}

          <DialogFooter>
            <Button type='button' variant='outline' onClick={onAdiar}>Responder depois</Button>
            <Button type='submit' disabled={!todasRespondidas || enviando} className='bg-[#177a7a] hover:bg-[#136d6d]'>
              {enviando ? 'Enviando...' : 'Enviar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
