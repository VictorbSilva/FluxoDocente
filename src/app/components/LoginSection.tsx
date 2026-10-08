import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { BookOpen, Mail, Lock, ArrowRight } from 'lucide-react';
import { ApiError } from '../lib/api';

interface LoginSectionProps {
  onLogin: (email: string, senha: string) => Promise<void>;
}

export function LoginSection({ onLogin }: LoginSectionProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await onLogin(email, senha);
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      className='min-h-screen flex items-center justify-center px-4'
      style={{ background: 'linear-gradient(to right, #2b364a, #21a3a3)' }}
    >
      <Card className='w-full max-w-md shadow-2xl border-0 bg-white'>
        {/* 1. Reduzimos o padding superior/inferior (pt-6, pb-4) e o gap entre elementos (space-y-2) */}
        <CardHeader className='space-y-2 items-center text-center pb-4 pt-6'>
          {/* Tornamos a "pílula" azul ligeiramente mais compacta nos paddings e tamanhos */}
          <div className='bg-[#e8f5f5] px-5 py-3 rounded-2xl shadow-sm flex items-center gap-3'>
            <BookOpen className='h-7 w-7 text-[#21a3a3]' />
            <h1 className='text-xl font-bold text-[#2b364a] tracking-tight'>
              FluxoDocente
            </h1>
          </div>

          {/* Removemos a margem extra do texto (mt-1) para que ele obedeça apenas ao space-y-2 do Header */}
          <p className='text-gray-500 text-sm'>
            Acesso à plataforma de capacitação em IA
          </p>
        </CardHeader>

        <CardContent className='pb-8'>
          {/* 2. Reduzimos o gap geral do formulário de space-y-6 para space-y-4 */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* 3. Reduzimos o gap entre a label e o input de space-y-2 para space-y-1.5 */}
            <div className='space-y-1.5'>
              <Label htmlFor='email' className='text-[#2b364a] font-medium'>
                E-mail Institucional
              </Label>
              <div className='relative'>
                <Mail className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                <Input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='docente@instituicao.edu.br'
                  className='pl-10 border-gray-200 focus:border-[#21a3a3] focus:ring-[#21a3a3] h-10'
                  required
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <div className='flex items-center justify-between'>
                <Label
                  htmlFor='password'
                  className='text-[#2b364a] font-medium'
                >
                  Senha
                </Label>
                <p className='text-xs text-gray-500'>
                  Esqueceu a senha? Fale com a equipe do projeto.
                </p>
              </div>
              <div className='relative'>
                <Lock className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                <Input
                  id='password'
                  name='password'
                  type='password'
                  autoComplete='current-password'
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder='••••••••'
                  className='pl-10 border-gray-200 focus:border-[#21a3a3] focus:ring-[#21a3a3] h-10'
                  required
                />
              </div>
            </div>

            {erro && (
              <p role='alert' className='text-sm text-red-600'>
                {erro}
              </p>
            )}

            {/* Reduzimos a margem superior do botão para mt-2 */}
            <Button
              type='submit'
              disabled={enviando}
              className='w-full text-white shadow-lg hover:opacity-90 transition-opacity h-11 text-base mt-2'
              style={{
                background: 'linear-gradient(to right, #2b364a, #21a3a3)',
              }}
            >
              {enviando ? 'Entrando...' : 'Fazer Login'}
              <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
