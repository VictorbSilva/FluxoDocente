import { BookOpen } from 'lucide-react';
import { modules } from '../../../shared/catalog';

export function Rodape() {
  return (
    <footer className='bg-gray-900 text-white py-12'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='grid md:grid-cols-4 gap-8'>
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <div className='bg-[#21a3a3] p-2 rounded-lg'>
                <BookOpen className='h-5 w-5 text-white' />
              </div>
              <div>
                <h3 className='text-xl'>FluxoDocente</h3>
                <p className='text-gray-400 text-sm'>Inovação Educacional</p>
              </div>
            </div>
            <p className='text-gray-300 text-sm leading-relaxed'>
              "A inovação tecnológica não substitui o docente ela potencializa
              a sua capacidade de inspirar."
            </p>
          </div>

          <div>
            <h4 className='text-lg mb-4'>Aprenda</h4>
            <ul className='space-y-2 text-sm text-gray-300'>
              {modules.map((m) => <li key={m.id}>{m.title}</li>)}
            </ul>
          </div>

          <div>
            <h4 className='text-lg mb-4'>Suporte</h4>
            <ul className='space-y-2 text-sm text-gray-300'>
              <li>Central de Ajuda</li>
              <li>WhatsApp: (83) 99999-9999</li>
              <li>contato@fluxodocente.com.br</li>
              <li>Acompanhamento 24/7</li>
            </ul>
          </div>
        </div>

        <div className='border-t border-gray-800 mt-8 pt-8 text-center'>
          <p className='text-gray-400 text-sm'>
            © 2026 FluxoDocente. Transformando vidas através da educação.
          </p>
          <p className='text-[#6cf3d5] text-sm mt-2'>
            "A inovação tecnológica não substitui o docente ela potencializa a
            sua capacidade de inspirar."
          </p>
        </div>
      </div>
    </footer>
  );
}
