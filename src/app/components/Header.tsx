import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Menu, Trophy, User, BookOpen } from 'lucide-react';

interface HeaderProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  userPoints: number;
}

export function Header({
  currentSection,
  onSectionChange,
  userPoints,
}: HeaderProps) {
  const navItems = [
    { id: 'home', label: 'Início', icon: '🏠' },
    { id: 'courses', label: 'Cursos', icon: '📚' },
    { id: 'progress', label: 'Progresso', icon: '🏆' },
  ];

  return (
    <header
      style={{ background: 'linear-gradient(to right, #2b364a, #21a3a3)' }}
      className='text-white shadow-lg sticky top-0 z-50'
    >
      <div className='max-w-7xl mx-auto px-4 py-3'>
        <div className='flex items-center justify-between'>
          {/* Logo */}
          <div className='flex items-center gap-3'>
            <div className='bg-white/20 p-2 rounded-lg'>
              <BookOpen className='h-6 w-6' />
            </div>
            <div>
              <h1 className='text-xl tracking-tight'>FluxoDocente</h1>
              <p className='text-xs text-white/80'>Sua história começa agora</p>
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className='hidden md:flex items-center gap-6'>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  currentSection === item.id
                    ? 'bg-white/20 shadow-md'
                    : 'hover:bg-white/10'
                }`}
              >
                <span className='text-sm'>{item.icon}</span>
                <span className='text-sm'>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Info */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full'>
              <Trophy className='h-4 w-4' style={{ color: '#6cf3d5' }} />
              <span className='text-sm'>{userPoints}</span>
            </div>
            <Button
              variant='ghost'
              size='sm'
              className='text-white hover:bg-white/10'
            >
              <User className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='md:hidden text-white hover:bg-white/10'
            >
              <Menu className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className='md:hidden mt-3 flex gap-2 overflow-x-auto pb-2'>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                currentSection === item.id
                  ? 'bg-white/20 shadow-md'
                  : 'hover:bg-white/10'
              }`}
            >
              <span className='text-sm'>{item.icon}</span>
              <span className='text-xs'>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
