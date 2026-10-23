import { Lock } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface AulaIndisponivelProps {
  titulo: string;
  texto: string;
  acao: string;
  onAcao: () => void;
}

export function AulaIndisponivel({ titulo, texto, acao, onAcao }: AulaIndisponivelProps) {
  return (
    <div className='max-w-4xl mx-auto px-4 py-12'>
      <Card className='p-6 items-start'>
        <Lock className='h-8 w-8 text-[#177a7a]' aria-hidden='true' />
        <h2 className='text-xl text-gray-900'>{titulo}</h2>
        <p className='text-gray-600'>{texto}</p>
        <Button onClick={onAcao} className='bg-[#177a7a] hover:bg-[#136d6d]'>
          {acao}
        </Button>
      </Card>
    </div>
  );
}
