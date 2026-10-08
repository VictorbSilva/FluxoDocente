import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { LoginSection } from './components/LoginSection';
import { CategoryGrid } from './components/CategoryGrid';
import { VideoPlayer } from './components/VideoPlayer';
import { ProgressSection } from './components/ProgressSection';
import { toast, Toaster } from 'sonner';
import { modules, lessons } from '../../shared/catalog';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentSection, setCurrentSection] = useState('home');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState({
    points: 485,
    totalVideos: 150,
    completedVideos: 23,
    certificatesEarned: 3,
    currentStreak: 5,
  });

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
    setSelectedLessonId(null);
  };

  const handleGetStarted = () => {
    setCurrentSection('courses');
    toast.success('Vamos começar sua jornada de transformação! 🚀');
  };

  const handleCategorySelect = (moduleId: string) => {
    const lesson = lessons.find((l) => l.moduleId === moduleId);
    if (!lesson) {
      toast.info('Este módulo ainda não tem aulas publicadas.');
      return;
    }
    setSelectedLessonId(lesson.id);
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
    if (selectedLessonId) {
      const lesson = lessons.find((l) => l.id === selectedLessonId);
      const module = modules.find((m) => m.id === lesson.moduleId);
      const moduleLessons = lessons.filter((l) => l.moduleId === lesson.moduleId);

      return (
        <VideoPlayer
          lesson={lesson}
          module={module}
          moduleLessons={moduleLessons}
          onSelectLesson={setSelectedLessonId}
          onVideoComplete={handleVideoComplete}
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

  // =======================================================================
  // GUARDA DE ROTA (ROUTE GUARD) - Tático para a Apresentação
  // Se não estiver autenticado, encerra a renderização aqui e exibe o Login
  // =======================================================================
  if (!isAuthenticated) {
    return <LoginSection onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // =======================================================================
  // APLICAÇÃO PRINCIPAL - Só renderiza se a guarda de rota for ultrapassada
  // =======================================================================
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
