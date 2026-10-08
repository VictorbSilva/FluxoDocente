import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LogOut, BookOpen } from 'lucide-react';

interface HeaderProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  userEmail: string;
  onLogout: () => void;
}

export function Header({
  currentSection,
  onSectionChange,
  userEmail,
  onLogout,
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
              <p className='text-xs text-white/80'>Inovação Educacional</p>
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
            <span className='hidden sm:inline text-sm text-white/80'>
              {userEmail}
            </span>
            <Button
              variant='ghost'
              size='sm'
              onClick={onLogout}
              className='text-white hover:bg-white/10'
            >
              <LogOut className='h-4 w-4' />
              Sair
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
