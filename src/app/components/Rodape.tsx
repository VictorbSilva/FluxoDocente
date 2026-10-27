import { LogoSimbolo } from './LogoSimbolo';

interface RodapeProps {
  autenticado: boolean;
  onSectionChange: (section: string) => void;
}

export function Rodape({ autenticado, onSectionChange }: RodapeProps) {
  const classeLink = 'rounded-sm text-left transition-colors hover:text-[#6cf3d5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6cf3d5]';

  return (
    <footer className='bg-gray-900 text-white py-12'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='grid gap-8 md:grid-cols-[2fr_1fr_1fr]'>
          <div className='space-y-4'>
            <div className='flex items-center gap-3'>
              <LogoSimbolo className='h-9 w-auto' />
              <div>
                <h3 className='text-xl'>FluxoDocente</h3>
                <p className='text-gray-400 text-sm'>Inovação Educacional</p>
              </div>
            </div>
            <p className='max-w-sm text-gray-300 text-sm leading-relaxed'>
              Formação para docentes do ensino superior, com cursos e recursos para apoiar a prática acadêmica.
            </p>
          </div>

          <nav aria-label='Plataforma no rodapé'>
            <h4 className='text-lg mb-4'>Plataforma</h4>
            <ul className='space-y-2 text-sm text-gray-300'>
              <li><button type='button' className={classeLink} onClick={() => onSectionChange('home')}>Início</button></li>
              <li><button type='button' className={classeLink} onClick={() => onSectionChange('sobre')}>Sobre nós</button></li>
              {!autenticado && (
                <li><button type='button' className={classeLink} onClick={() => onSectionChange('entrar')}>Entrar</button></li>
              )}
            </ul>
          </nav>

          <nav aria-label='Cursos no rodapé'>
            <h4 className='text-lg mb-4'>Cursos</h4>
            <ul className='space-y-2 text-sm text-gray-300'>
              <li>
                <button type='button' className={classeLink} onClick={() => onSectionChange(autenticado ? 'mais-cursos' : 'entrar')}>
                  {autenticado ? 'Explorar cursos' : 'Acessar os cursos'}
                </button>
              </li>
              {autenticado && (
                <>
                  <li><button type='button' className={classeLink} onClick={() => onSectionChange('meus-cursos')}>Meus cursos</button></li>
                  <li><button type='button' className={classeLink} onClick={() => onSectionChange('certificados')}>Meus certificados</button></li>
                </>
              )}
            </ul>
          </nav>
        </div>

        <div className='border-t border-gray-800 mt-8 pt-8 text-center'>
          <p className='text-gray-400 text-sm'>
            © {new Date().getFullYear()} FluxoDocente. Transformando vidas através da educação.
          </p>
          <p className='text-[#6cf3d5] text-sm mt-2'>
            "A inovação tecnológica não substitui o docente; ela potencializa a
            sua capacidade de inspirar."
          </p>
        </div>
      </div>
    </footer>
  );
}
