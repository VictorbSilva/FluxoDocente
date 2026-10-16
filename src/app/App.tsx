import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { CabecalhoPublico } from './components/CabecalhoPublico';
import { Rodape } from './components/Rodape';
import { SobreNos } from './components/SobreNos';
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
  // Tela e aula exibidas agora, lidas pelo listener de popstate.
  const rotaAtualRef = useRef({
    section: currentSection,
    lessonId: selectedLessonId,
  });
  rotaAtualRef.current = { section: currentSection, lessonId: selectedLessonId };

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
      // O popstate não pode ser cancelado: se a pessoa desistir de sair da
      // anotação não salva, o endereço da tela atual volta para o histórico.
      if (pendenteRef.current) {
        if (!window.confirm(PERGUNTA_SAIR_SEM_SALVAR)) {
          const { section, lessonId } = rotaAtualRef.current;
          history.pushState(null, '', caminhoDe(section, lessonId));
          return;
        }
        pendenteRef.current = false;
      }
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
      pendenteRef.current = false;
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
    if (currentSection === 'entrar') {
      history.replaceState(null, '', '/');
      setCurrentSection('home');
    }
  };

  useEffect(() => {
    if (sessao.estado === 'autenticada' && currentSection === 'entrar') {
      history.replaceState(null, '', '/');
      setCurrentSection('home');
    }
  }, [sessao.estado, currentSection]);

  const handleLogout = async () => {
    if (pendenteRef.current && !window.confirm(PERGUNTA_SAIR_SEM_SALVAR)) {
      return;
    }
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
    toast.success('Vamos começar sua jornada de transformação!');
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
    if (currentSection === 'entrar' || selectedLessonId !== null) {
      return (
        <>
          <LoginSection onLogin={handleLogin} />
          {toaster}
        </>
      );
    }

    return (
      <div className='min-h-screen bg-white'>
        <CabecalhoPublico onEntrar={() => irPara('entrar', null)} />
        <main>
          <HeroSection onGetStarted={() => irPara('entrar', null)} />
          <CategoryGrid onCategorySelect={() => irPara('entrar', null)} />
          <SobreNos />
        </main>
        <Rodape />
        {toaster}
      </div>
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
      <Rodape />

      {toaster}
    </div>
  );
}
