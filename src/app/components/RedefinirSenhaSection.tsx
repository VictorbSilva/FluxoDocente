import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { ApiError, redefinirSenha } from '../lib/api';
import { LogoSimbolo } from './LogoSimbolo';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface RedefinirSenhaSectionProps {
  onEntrar: () => void;
  onPedirNovoLink: () => void;
}

export function RedefinirSenhaSection({ onEntrar, onPedirNovoLink }: RedefinirSenhaSectionProps) {
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('token') ?? '');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [tokenInvalido, setTokenInvalido] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    history.replaceState(null, '', '/redefinir-senha');
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (salvando) return;
    setErro(null);
    if (senha !== confirmacao) {
      setErro('As senhas não conferem.');
      return;
    }
    setSalvando(true);
    try {
      await redefinirSenha(token, senha);
      toast.success('Senha alterada. Entre com a senha nova.');
      onEntrar();
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
      setErro(err.message);
      if (err.status === 400 && err.code === 'token_invalido') setTokenInvalido(true);
    } finally {
      setSalvando(false);
    }
  };

  const classeInput = 'border-gray-200 focus:border-[#177a7a] focus:ring-[#177a7a] h-10';

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
          <p className='text-gray-500 text-sm'>Criar uma senha nova</p>
        </CardHeader>
        <CardContent className='pb-8'>
          {!token || tokenInvalido ? (
            <div className='space-y-4'>
              <p role='alert' className='text-sm text-red-600'>{tokenInvalido ? erro : 'Link inválido. Peça um novo.'}</p>
              <button type='button' onClick={onPedirNovoLink} className='text-sm text-[#177a7a] hover:underline'>Pedir um novo link</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-1.5'>
                <Label htmlFor='redefinir-senha' className='text-[#2b364a] font-medium'>Nova senha</Label>
                <Input id='redefinir-senha' name='password' type='password' autoComplete='new-password' value={senha} onChange={(event) => setSenha(event.target.value)} aria-describedby='redefinir-senha-dica' className={classeInput} required />
                <p id='redefinir-senha-dica' className='text-xs text-gray-500'>Pelo menos 8 caracteres.</p>
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='redefinir-confirmacao' className='text-[#2b364a] font-medium'>Confirmar nova senha</Label>
                <Input id='redefinir-confirmacao' name='confirmacao' type='password' autoComplete='new-password' value={confirmacao} onChange={(event) => setConfirmacao(event.target.value)} className={classeInput} required />
              </div>
              {erro && <p role='alert' className='text-sm text-red-600'>{erro}</p>}
              <Button
                type='submit'
                disabled={salvando}
                className='w-full text-white shadow-lg hover:opacity-90 transition-opacity h-11 text-base mt-2'
                style={{ background: 'linear-gradient(to right, #2b364a, #177a7a)' }}
              >
                {salvando ? 'Salvando...' : 'Salvar senha'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
