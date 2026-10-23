import { useEffect, useRef, useState } from 'react';
import type { CorrecaoDTO, Exercicio, ResultadoExercicioDTO } from '../../../shared/contracts';
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

interface ExercicioDialogProps {
  exercicio: Exercicio;
  tituloDoModulo: string;
  resultado?: ResultadoExercicioDTO;
  aberto: boolean;
  onFechar: () => void;
  onEnviar: (respostas: number[]) => Promise<CorrecaoDTO | null>;
}

export function ExercicioDialog({
  exercicio,
  tituloDoModulo,
  resultado,
  aberto,
  onFechar,
  onEnviar,
}: ExercicioDialogProps) {
  const [respostas, setRespostas] = useState<(number | null)[]>(
    () => exercicio.perguntas.map(() => null),
  );
  const [ordens, setOrdens] = useState<number[][]>(
    () => exercicio.perguntas.map((pergunta) => ordemEmbaralhada(pergunta.alternativas.length)),
  );
  const [correcao, setCorrecao] = useState<CorrecaoDTO | null>(null);
  const [enviando, setEnviando] = useState(false);
  const envioAtual = useRef(0);

  const limpar = () => {
    setRespostas(exercicio.perguntas.map(() => null));
    setOrdens(exercicio.perguntas.map((pergunta) => ordemEmbaralhada(pergunta.alternativas.length)));
    setCorrecao(null);
    setEnviando(false);
  };

  useEffect(() => {
    envioAtual.current += 1;
    limpar();
    return () => {
      envioAtual.current += 1;
    };
  }, [exercicio.moduleId, aberto]);

  const todasRespondidas = respostas.every((resposta) => resposta !== null);

  const enviar = async () => {
    if (!todasRespondidas || enviando || correcao) return;
    const envio = ++envioAtual.current;
    setEnviando(true);
    try {
      const novaCorrecao = await onEnviar(respostas as number[]);
      if (envioAtual.current === envio && novaCorrecao) setCorrecao(novaCorrecao);
    } finally {
      if (envioAtual.current === envio) setEnviando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={(open) => { if (!open) onFechar(); }}>
      <DialogContent className='max-h-[85vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Avaliação — {tituloDoModulo}</DialogTitle>
          <DialogDescription>
            {exercicio.instrucoes && (
              <span className='block mb-2 whitespace-pre-line'>{exercicio.instrucoes}</span>
            )}
            Para ser aprovado, acerte pelo menos 70%. Você pode refazer quando quiser.
            {resultado && (
              <span className='block mt-2'>
                Sua melhor nota: {resultado.melhorAcertos} de {resultado.total}.
                {resultado.aprovado && ' Aprovado.'}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => { event.preventDefault(); void enviar(); }} className='space-y-6'>
          {exercicio.perguntas.map((pergunta, indice) => (
            <fieldset key={pergunta.id} disabled={enviando || correcao !== null} className='space-y-3'>
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
              {correcao && (
                <p className={correcao.corretas[indice] ? 'text-sm text-[#177a7a]' : 'text-sm text-red-700'}>
                  {correcao.corretas[indice] ? 'Correta' : 'Incorreta'}
                </p>
              )}
            </fieldset>
          ))}

          {correcao && (
            <div role='status' className='space-y-1 text-gray-900'>
              <p>Você acertou {correcao.acertos} de {correcao.total}.</p>
              <p>{correcao.aprovadoNestaTentativa ? 'Avaliação aprovada.' : 'Ainda não foi desta vez.'}</p>
            </div>
          )}

          <DialogFooter>
            {correcao ? (
              <>
                <Button type='button' variant='outline' onClick={limpar}>Refazer</Button>
                <Button type='button' onClick={onFechar} className='bg-[#177a7a] hover:bg-[#136d6d]'>Fechar</Button>
              </>
            ) : (
              <Button type='submit' disabled={!todasRespondidas || enviando} className='bg-[#177a7a] hover:bg-[#136d6d]'>
                {enviando ? 'Enviando...' : 'Enviar respostas'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
