import { useState, type FormEvent } from 'react';
import { ApiError, pedirRecuperacaoDeSenha } from '../lib/api';
import { LogoSimbolo } from './LogoSimbolo';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface EsqueciSenhaSectionProps {
  onEntrar: () => void;
}

export function EsqueciSenhaSection({ onEntrar }: EsqueciSenhaSectionProps) {
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (enviando) return;
    setErro(null);
    setEnviando(true);
    try {
      await pedirRecuperacaoDeSenha(email);
      setEnviado(true);
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      className='min-h-screen flex items-center justify-center px-4 py-8'
      style={{ background: 'linear-gradient(to right, #2b364a, #21a3a3)' }}
    >
      <Card className='w-full max-w-md shadow-2xl border-0 bg-white'>
        <CardHeader className='space-y-2 items-center text-center pb-4 pt-6'>
          <div className='bg-[#e8f5f5] px-5 py-3 rounded-2xl shadow-sm flex items-center gap-3'>
            <LogoSimbolo className='h-8 w-auto' />
            <h1 className='text-xl font-bold text-[#2b364a] tracking-tight'>FluxoDocente</h1>
          </div>
          <p className='text-gray-500 text-sm'>Esqueci minha senha</p>
        </CardHeader>
        <CardContent className='pb-8'>
          {enviado ? (
            <p className='text-sm text-gray-700'>
              Se houver uma conta com esse e-mail, enviamos um link para criar uma senha nova. Ele vale por 1 hora. Se não chegar em alguns minutos, confira a caixa de spam.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-1.5'>
                <Label htmlFor='recuperacao-email' className='text-[#2b364a] font-medium'>E-mail</Label>
                <Input id='recuperacao-email' name='email' type='email' autoComplete='email' value={email} onChange={(event) => setEmail(event.target.value)} className='border-gray-200 focus:border-[#177a7a] focus:ring-[#177a7a] h-10' required />
              </div>
              {erro && <p role='alert' className='text-sm text-red-600'>{erro}</p>}
              <Button
                type='submit'
                disabled={enviando}
                className='w-full text-white shadow-lg hover:opacity-90 transition-opacity h-11 text-base mt-2'
                style={{ background: 'linear-gradient(to right, #2b364a, #177a7a)' }}
              >
                {enviando ? 'Enviando...' : 'Enviar link'}
              </Button>
            </form>
          )}
          <div className='mt-4 text-center'>
            <button type='button' onClick={onEntrar} className='text-sm text-[#177a7a] hover:underline'>Voltar para o login</button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
