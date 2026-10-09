import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { LoginSection } from './components/LoginSection';
import { CategoryGrid } from './components/CategoryGrid';
import { PERGUNTA_SAIR_SEM_SALVAR, VideoPlayer } from './components/VideoPlayer';
import { ProgressSection } from './components/ProgressSection';
import { Button } from './components/ui/button';
import { toast, Toaster } from 'sonner';
import { modules, lessons } from '../../shared/catalog';
import type { UserDTO } from '../../shared/contracts';
import {
  ApiError,
  concluirAula,
  entrar,
  progresso,
  sair,
  sessaoAtual,
} from './lib/api';
import { caminhoDe, lerRota } from './lib/rotas';

type Sessao =
  | { estado: 'carregando' }
  | { estado: 'anonima' }
  | { estado: 'erro' }
  | { estado: 'autenticada'; usuario: UserDTO };

export default function App() {
  const [sessao, setSessao] = useState<Sessao>({ estado: 'carregando' });
  const [currentSection, setCurrentSection] = useState<string>(
    () => lerRota(window.location.pathname).section,
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(
    () => lerRota(window.location.pathname).lessonId,
  );
  const [concluidas, setConcluidas] = useState<Map<string, string>>(
    () => new Map(),
  );
  const [progressoCarregado, setProgressoCarregado] = useState(false);
  // Anotação com alterações não salvas no player, informada pelo VideoPlayer.
  const pendenteRef = useRef(false);

  const consultarSessao = () => {
    setSessao({ estado: 'carregando' });
    sessaoAtual()
      .then((usuario) => setSessao({ estado: 'autenticada', usuario }))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          setSessao({ estado: 'anonima' });
        } else {
          setSessao({ estado: 'erro' });
        }
      });
  };

  useEffect(() => {
    consultarSessao();
  }, []);

  // O endereço acompanha a tela: corrige um caminho inválido na abertura e
  // aplica o Voltar/Avançar do navegador sem empilhar outra entrada.
  useEffect(() => {
    const inicial = lerRota(window.location.pathname);
    const canonico = caminhoDe(inicial.section, inicial.lessonId);
    if (window.location.pathname !== canonico) {
      history.replaceState(null, '', canonico);
    }

    const aoNavegar = () => {
      const rota = lerRota(window.location.pathname);
      setCurrentSection(rota.section);
      setSelectedLessonId(rota.lessonId);
    };
    window.addEventListener('popstate', aoNavegar);
    return () => window.removeEventListener('popstate', aoNavegar);
  }, []);

  // F5 e fechar a aba avisam enquanto houver anotação não salva.
  useEffect(() => {
    const avisarAoSair = (event: BeforeUnloadEvent) => {
      if (!pendenteRef.current) return;
      event.preventDefault();
      event.returnValue = ''; // navegadores antigos só avisam com returnValue
    };
    window.addEventListener('beforeunload', avisarAoSair);
    return () => window.removeEventListener('beforeunload', avisarAoSair);
  }, []);

  const irPara = (section: string, lessonId: string | null) => {
    const mudaDeLugar =
      section !== currentSection || lessonId !== selectedLessonId;
    if (pendenteRef.current && mudaDeLugar) {
      if (!window.confirm(PERGUNTA_SAIR_SEM_SALVAR)) return;
      pendenteRef.current = false;
    }
    setCurrentSection(section);
    setSelectedLessonId(lessonId);
    const caminho = caminhoDe(section, lessonId);
    if (caminho !== window.location.pathname) {
      history.pushState(null, '', caminho);
    }
  };

  const tratarErro = (err) => {
    if (err instanceof ApiError && err.status === 401) {
      setSessao({ estado: 'anonima' });
      setConcluidas(new Map());
      toast.info('Sua sessão expirou. Entre novamente.');
    } else {
      toast.error(err.message);
    }
  };

  const usuarioId = sessao.estado === 'autenticada' ? sessao.usuario.id : null;

  useEffect(() => {
    setConcluidas(new Map());
    setProgressoCarregado(false);
    if (!usuarioId) return;

    let cancelado = false;
    progresso()
      .then(({ completions }) => {
        if (cancelado) return;
        setConcluidas(
          new Map(completions.map((c) => [c.lessonId, c.completedAt])),
        );
        setProgressoCarregado(true);
      })
      .catch((err) => {
        if (cancelado) return;
        tratarErro(err);
      });

    return () => {
      cancelado = true;
    };
  }, [usuarioId]);

  const handleLogin = async (email: string, senha: string) => {
    const usuario = await entrar(email, senha);
    setSessao({ estado: 'autenticada', usuario });
  };

  const handleLogout = async () => {
    try {
      await sair();
    } catch (err) {
      toast.error(err.message);
      return;
    }
    pendenteRef.current = false;
    setSessao({ estado: 'anonima' });
    setConcluidas(new Map());
    history.replaceState(null, '', '/');
    setCurrentSection('home');
    setSelectedLessonId(null);
  };

  const handleSectionChange = (section: string) => {
    irPara(section, null);
  };

  const handleGetStarted = () => {
    irPara('courses', null);
    toast.success('Vamos começar sua jornada de transformação! 🚀');
  };

  const handleCategorySelect = (moduleId: string) => {
    const lesson = lessons.find((l) => l.moduleId === moduleId);
    if (!lesson) {
      toast.info('Este módulo ainda não tem aulas publicadas.');
      return;
    }
    irPara(currentSection, lesson.id);
  };

  const handleConcluir = async (lessonId: string): Promise<void> => {
    if (concluidas.has(lessonId)) return;
    try {
      const { completedAt } = await concluirAula(lessonId);
      setConcluidas((anterior) => new Map(anterior).set(lessonId, completedAt));
      toast.success('Aula marcada como concluída.');
    } catch (err) {
      tratarErro(err);
    }
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

      return (
        <VideoPlayer
          lesson={lesson}
          module={module}
          onSelectLesson={(id) => irPara(currentSection, id)}
          concluidas={concluidas}
          carregado={progressoCarregado}
          onConcluir={handleConcluir}
          onAlteracoesPendentes={(pendente) => {
            pendenteRef.current = pendente;
          }}
          onErro={tratarErro}
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
            modules={modules}
            lessons={lessons}
            concluidas={concluidas}
            carregado={progressoCarregado}
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

  const toaster = (
    <Toaster
      position='top-right'
      toastOptions={{
        style: {
          background: '#177a7a',
          color: 'white',
          border: 'none',
        },
      }}
    />
  );

  // =======================================================================
  // GUARDA DE ROTA (ROUTE GUARD)
  // Enquanto a sessão não estiver confirmada pelo servidor, encerra a
  // renderização aqui: carregando, erro de conexão ou tela de login
  // =======================================================================
  if (sessao.estado === 'carregando') {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-gray-500'>Carregando...</p>
      </div>
    );
  }

  if (sessao.estado === 'erro') {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center'>
        <p className='text-gray-700'>Não foi possível conectar ao servidor.</p>
        <Button onClick={consultarSessao}>Tentar novamente</Button>
      </div>
    );
  }

  if (sessao.estado === 'anonima') {
    return (
      <>
        <LoginSection onLogin={handleLogin} />
        {toaster}
      </>
    );
  }

  // =======================================================================
  // APLICAÇÃO PRINCIPAL - Só renderiza se a guarda de rota for ultrapassada
  // =======================================================================
  return (
    <div className='min-h-screen bg-white'>
      <Header
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
        userEmail={sessao.usuario.email}
        onLogout={handleLogout}
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

      {toaster}
    </div>
  );
}
