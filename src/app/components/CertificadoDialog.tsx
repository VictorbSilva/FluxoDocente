import { useEffect, useRef, useState } from 'react';
import type { CertificadoDTO, Course } from '../../../shared/contracts';
import { ApiError, emitirCertificado } from '../lib/api';
import { baixarCertificadoPdf } from '../lib/certificadoPdf';
import { cpfValido, formatarCpf } from '../lib/cpf';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from './ui/dialog';

interface CertificadoDialogProps {
  curso: Course;
  aberto: boolean;
  onFechar: () => void;
  onIrParaPainel: () => void;
  onErro: (erro: unknown) => void;
}

export function CertificadoDialog({
  curso, aberto, onFechar, onIrParaPainel, onErro,
}: CertificadoDialogProps) {
  const [certificado, setCertificado] = useState<CertificadoDTO | null>(null);
  const [cpf, setCpf] = useState('');
  const [nomeObrigatorio, setNomeObrigatorio] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [baixando, setBaixando] = useState(false);
  const erroRef = useRef(onErro);
  erroRef.current = onErro;

  useEffect(() => {
    setCpf('');
    setCertificado(null);
    setNomeObrigatorio(false);
    setCarregando(aberto);
    if (!aberto) return;
    let cancelado = false;
    emitirCertificado(curso.id)
      .then((dados) => { if (!cancelado) setCertificado(dados); })
      .catch((erro) => {
        if (cancelado) return;
        if (erro instanceof ApiError && erro.status === 409 && erro.code === 'nome_obrigatorio') {
          setNomeObrigatorio(true);
        } else {
          erroRef.current(erro);
        }
      })
      .finally(() => { if (!cancelado) setCarregando(false); });
    return () => { cancelado = true; };
  }, [curso.id, aberto]);

  const fechar = () => {
    setCpf('');
    onFechar();
  };

  const baixar = async () => {
    if (!certificado || !cpfValido(cpf) || baixando) return;
    setBaixando(true);
    try {
      await baixarCertificadoPdf({ ...certificado, cpf, curso: curso.title });
    } catch {
      onErro(new Error('Não foi possível gerar o PDF. Tente novamente.'));
    } finally {
      setBaixando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={(open) => { if (!open) fechar(); }}>
      <DialogContent className='max-h-[85vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Baixar certificado</DialogTitle>
          <DialogDescription>{curso.title}</DialogDescription>
        </DialogHeader>
        {carregando ? (
          <p role='status'>Carregando certificado...</p>
        ) : nomeObrigatorio ? (
          <p>Cadastre seu nome no Painel para emitir o certificado.</p>
        ) : certificado ? (
          <form id='baixar-certificado' onSubmit={(event) => { event.preventDefault(); void baixar(); }} className='space-y-4'>
            <dl className='space-y-2 text-sm text-gray-700'>
              <div><dt className='font-medium'>Nome</dt><dd>{certificado.nome}</dd></div>
              <div><dt className='font-medium'>Curso</dt><dd>{curso.title}</dd></div>
              <div><dt className='font-medium'>Carga horária</dt><dd>{certificado.cargaHorariaHoras} {certificado.cargaHorariaHoras === 1 ? 'hora' : 'horas'}</dd></div>
            </dl>
            <div className='space-y-2'>
              <label htmlFor='certificado-cpf'>CPF</label>
              <Input
                id='certificado-cpf'
                value={cpf}
                onChange={(event) => setCpf(formatarCpf(event.target.value))}
                inputMode='numeric'
                autoComplete='off'
                maxLength={14}
                placeholder='000.000.000-00'
                aria-describedby='certificado-cpf-aviso'
                disabled={baixando}
              />
              <p id='certificado-cpf-aviso' className='text-sm text-gray-600'>O CPF é usado só neste PDF e não fica guardado.</p>
            </div>
          </form>
        ) : null}
        <DialogFooter>
          <Button type='button' variant='outline' onClick={fechar}>Fechar</Button>
          {nomeObrigatorio ? (
            <Button onClick={() => { fechar(); onIrParaPainel(); }} className='bg-[#177a7a] hover:bg-[#136d6d]'>Ir para o Painel</Button>
          ) : (
            <Button type='submit' form='baixar-certificado' disabled={!certificado || !cpfValido(cpf) || baixando} className='bg-[#177a7a] hover:bg-[#136d6d]'>
              {baixando ? 'Gerando PDF...' : 'Baixar PDF'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
