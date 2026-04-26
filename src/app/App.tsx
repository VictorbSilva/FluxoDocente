import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoryGrid } from './components/CategoryGrid';
import { VideoPlayer } from './components/VideoPlayer';
import { ProgressSection } from './components/ProgressSection';
import { toast, Toaster } from 'sonner';

export default function App() {
  const [currentSection, setCurrentSection] = useState('home');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [userProgress, setUserProgress] = useState({
    points: 485,
    totalVideos: 150,
    completedVideos: 23,
    certificatesEarned: 3,
    currentStreak: 5,
  });

  // Mock video data
  const mockVideo = {
    id: '1',
    title: 'Como Carlos saiu do tráfico e abriu sua oficina',
    description:
      'Uma história real de superação. Carlos Santos, de 28 anos, conta como descobriu novas possibilidades através da educação e hoje emprega pessoas da sua comunidade.',
    duration: '12:30',
    instructor: 'Carlos Santos',
    category: 'Histórias de Superação',
    tags: ['Motivação', 'Empreendedorismo', 'Vida real'],
    thumbnail: '',
    progress: 0,
    completed: false,
  };

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
    setSelectedVideo(null);
  };

  const handleGetStarted = () => {
    setCurrentSection('courses');
    toast.success('Vamos começar sua jornada de transformação! 🚀');
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedVideo(mockVideo);
    toast.info('Carregando vídeo... Prepare-se para se inspirar! ✨');
  };

  const handleVideoComplete = () => {
    setUserProgress((prev) => ({
      ...prev,
      points: prev.points + 10,
      completedVideos: prev.completedVideos + 1,
    }));
    toast.success('🎉 Vídeo concluído! +10 pontos conquistados!');
  };

  const handleApplyOpportunity = (opportunityId: string) => {
    toast.success('🎯 Redirecionando para a oportunidade! Boa sorte!');
  };

  const handleViewAllStories = () => {
    setCurrentSection('stories');
  };

  const renderCurrentSection = () => {
    if (selectedVideo) {
      return (
        <VideoPlayer
          video={selectedVideo}
          onVideoComplete={handleVideoComplete}
          onNextVideo={() => toast.info('Carregando próximo vídeo...')}
          onPrevVideo={() => toast.info('Voltando ao vídeo anterior...')}
        />
      );
    }

    switch (currentSection) {
      case 'home':
        return (
          <div>
            <HeroSection onGetStarted={handleGetStarted} />
            <CategoryGrid onCategorySelect={handleCategorySelect} />
          </div>
        );

      case 'courses':
        return <CategoryGrid onCategorySelect={handleCategorySelect} />;

      case 'progress':
        return (
          <ProgressSection
            userPoints={userProgress.points}
            totalVideos={userProgress.totalVideos}
            completedVideos={userProgress.completedVideos}
            certificatesEarned={userProgress.certificatesEarned}
            currentStreak={userProgress.currentStreak}
          />
        );

      default:
        return (
          <div>
            <HeroSection onGetStarted={handleGetStarted} />
            <CategoryGrid onCategorySelect={handleCategorySelect} />
          </div>
        );
    }
  };

  return (
    <div className='min-h-screen bg-white'>
      <Header
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
        userPoints={userProgress.points}
      />

      <main>{renderCurrentSection()}</main>

      {/* Footer */}
      <footer className='bg-gray-900 text-white py-12'>
        <div className='max-w-7xl mx-auto px-4'>
          <div className='grid md:grid-cols-4 gap-8'>
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <div className='bg-[#21a3a3] p-2 rounded-lg'>
                  <span className='text-white'>⭐</span>
                </div>
                <div>
                  <h3 className='text-xl'>FluxoDocente</h3>
                  <p className='text-gray-400 text-sm'>
                    Sua história começa agora
                  </p>
                </div>
              </div>
              <p className='text-gray-300 text-sm leading-relaxed'>
                Acreditamos que todo mundo merece uma segunda chance. Estamos
                aqui para apoiar sua jornada de transformação.
              </p>
            </div>

            <div>
              <h4 className='text-lg mb-4'>Aprenda</h4>
              <ul className='space-y-2 text-sm text-gray-300'>
                <li>Histórias de Superação</li>
                <li>Educação Financeira</li>
                <li>Empreendedorismo</li>
                <li>Tecnologia</li>
                <li>Habilidades Práticas</li>
              </ul>
            </div>

            <div>
              <h4 className='text-lg mb-4'>Suporte</h4>
              <ul className='space-y-2 text-sm text-gray-300'>
                <li>Central de Ajuda</li>
                <li>WhatsApp: (11) 9999-9999</li>
                <li>contato@fluxodocente.com.br</li>
                <li>Acompanhamento 24/7</li>
              </ul>
            </div>
          </div>

          <div className='border-t border-gray-800 mt-8 pt-8 text-center'>
            <p className='text-gray-400 text-sm'>
              © 2024 FluxoDocente. Transformando vidas através da educação.
            </p>
            <p className='text-[#6cf3d5] text-sm mt-2'>
              💚 "O crime não é o único caminho. Você pode escrever sua própria
              história."
            </p>
          </div>
        </div>
      </footer>

      <Toaster
        position='top-right'
        toastOptions={{
          style: {
            background: '#21a3a3',
            color: 'white',
            border: 'none',
          },
        }}
      />
    </div>
  );
}
