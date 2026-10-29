import { useState, type FormEvent } from 'react';
import { ApiError } from '../lib/api';
import { LogoSimbolo } from './LogoSimbolo';
import { TermoDialog } from './TermoDialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface CadastroSectionProps {
  onCadastro: (dados: {
    nome: string;
    email: string;
    password: string;
    aceitouTermo: boolean;
  }) => Promise<void>;
  onEntrar: () => void;
  onRecuperarSenha: () => void;
}

export function CadastroSection({ onCadastro, onEntrar, onRecuperarSenha }: CadastroSectionProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [aceitouTermo, setAceitouTermo] = useState(false);
  const [termoAberto, setTermoAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [emailEmUso, setEmailEmUso] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!aceitouTermo || enviando) return;
    setErro(null);
    setEmailEmUso(false);
    if (senha !== confirmacao) {
      setErro('As senhas não conferem.');
      return;
    }
    setEnviando(true);
    try {
      await onCadastro({ nome, email, password: senha, aceitouTermo });
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
      setErro(err.message);
      setEmailEmUso(err.status === 409 && err.code === 'email_em_uso');
    } finally {
      setEnviando(false);
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
          <p className='text-gray-500 text-sm'>Crie sua conta para fazer o curso</p>
        </CardHeader>
        <CardContent className='pb-8'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-1.5'>
              <Label htmlFor='cadastro-nome' className='text-[#2b364a] font-medium'>Nome completo</Label>
              <Input id='cadastro-nome' name='nome' autoComplete='name' value={nome} onChange={(event) => setNome(event.target.value)} className={classeInput} required />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='cadastro-email' className='text-[#2b364a] font-medium'>E-mail</Label>
              <Input id='cadastro-email' name='email' type='email' autoComplete='email' value={email} onChange={(event) => setEmail(event.target.value)} className={classeInput} required />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='cadastro-senha' className='text-[#2b364a] font-medium'>Senha</Label>
              <Input id='cadastro-senha' name='password' type='password' autoComplete='new-password' value={senha} onChange={(event) => setSenha(event.target.value)} aria-describedby='cadastro-senha-dica' className={classeInput} required />
              <p id='cadastro-senha-dica' className='text-xs text-gray-500'>Pelo menos 8 caracteres.</p>
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='cadastro-confirmacao' className='text-[#2b364a] font-medium'>Confirmar senha</Label>
              <Input id='cadastro-confirmacao' name='confirmacao' type='password' autoComplete='new-password' value={confirmacao} onChange={(event) => setConfirmacao(event.target.value)} className={classeInput} required />
            </div>
            <div className='flex items-start gap-2 text-sm text-[#2b364a]'>
              <input id='cadastro-termo' name='aceitouTermo' type='checkbox' checked={aceitouTermo} onChange={(event) => setAceitouTermo(event.target.checked)} aria-labelledby='cadastro-termo-rotulo cadastro-termo-link' className='mt-1 accent-[#177a7a]' />
              <div>
                <label id='cadastro-termo-rotulo' htmlFor='cadastro-termo'>Li e aceito o </label>
                <button id='cadastro-termo-link' type='button' onClick={() => setTermoAberto(true)} className='text-[#177a7a] underline'>termo de consentimento</button>
              </div>
            </div>
            {erro && <p role='alert' className='text-sm text-red-600'>{erro}</p>}
            {emailEmUso && (
              <button type='button' onClick={onRecuperarSenha} className='text-sm text-[#177a7a] hover:underline'>Recuperar a senha</button>
            )}
            <Button
              type='submit'
              disabled={!aceitouTermo || enviando}
              className='w-full text-white shadow-lg hover:opacity-90 transition-opacity h-11 text-base mt-2'
              style={{ background: 'linear-gradient(to right, #2b364a, #177a7a)' }}
            >
              {enviando ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>
          <p className='mt-4 text-center text-sm text-gray-500'>
            Já tem conta?{' '}
            <button type='button' onClick={onEntrar} className='text-[#177a7a] hover:underline'>Entrar</button>
          </p>
        </CardContent>
      </Card>
      <TermoDialog aberto={termoAberto} onFechar={() => setTermoAberto(false)} />
    </div>
  );
}
