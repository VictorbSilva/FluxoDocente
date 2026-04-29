import { Button } from './ui/button';
import { Card } from './ui/card';
import { Play, ArrowRight, Users, BookOpen } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className='bg-gradient-to-br from-[#e0faf6] via-[#f0fafa] to-[#eef0f8] py-12 md:py-20'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='grid md:grid-cols-2 gap-8 md:gap-12 items-center'>
          {/* Content */}
          <div className='space-y-6'>
            <div className='space-y-4'>
              <h1 className='text-3xl md:text-5xl text-[#2b364a] leading-tight'>
                Você pode escrever sua própria
                <span className='text-[#21a3a3] block'>história</span>
              </h1>
              <p className='text-lg md:text-xl text-gray-700 leading-relaxed'>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>

            <div className='flex flex-col sm:flex-row gap-4'>
              <Button
                onClick={onGetStarted}
                size='lg'
                className='bg-gradient-to-r bg-[#21a3a3] hover:bg-[#13c8b5] text-white shadow-lg'
              >
                <Play className='h-5 w-5 mr-2' />
                Começar Agora
              </Button>
            </div>

            {/* Stats */}
            <div className='grid grid-cols-2 gap-4 pt-6'>
              <div className='text-center sm:text-left'>
                <div className='flex items-center gap-2 text-[#21a3a3] mb-1'></div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className='relative'>
            <Card className='overflow-hidden shadow-2xl border-0 bg-white'>
              <ImageWithFallback
                src='https://images.pexels.com/photos/33449528/pexels-photo-33449528.jpeg'
                alt='Jovem estudando e se desenvolvendo'
                className='w-full h-64 md:h-80 object-cover'
              />
            </Card>

            {/* Background decoration */}
            <div className='absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-[#13c8b5] to-[#21a3a3] rounded-full opacity-20 blur-xl'></div>
            <div className='absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-[#7375a5] to-[#21a3a3] rounded-full opacity-20 blur-xl'></div>
          </div>
        </div>
      </div>
    </section>
  );
}
