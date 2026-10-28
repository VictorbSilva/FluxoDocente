import { LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { LogoSimbolo } from './LogoSimbolo';

interface CabecalhoPublicoProps {
  onEntrar: () => void;
}

export function CabecalhoPublico({ onEntrar }: CabecalhoPublicoProps) {
  return (
    <header
      style={{ background: 'linear-gradient(to right, #2b364a, #177a7a)' }}
      className='text-white shadow-lg sticky top-0 z-50'
    >
      <div className='max-w-7xl mx-auto px-4 py-3'>
        <div className='flex items-center justify-between'>
          {/* Logo */}
          <div className='flex items-center gap-3'>
            <LogoSimbolo className='h-9 w-auto' />
            <div>
              <h1 className='text-xl tracking-tight'>FluxoDocente</h1>
              <p className='text-xs text-white/80'>Inovação Educacional</p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <button
              type='button'
              className='text-sm text-white hover:underline'
              onClick={() =>
                document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Sobre nós
            </button>
            <Button
              variant='ghost'
              size='sm'
              className='text-white hover:bg-white/10'
              onClick={onEntrar}
            >
              <LogIn className='h-4 w-4' />
              Entrar
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
