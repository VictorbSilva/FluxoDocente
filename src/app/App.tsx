import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { CabecalhoPublico } from './components/CabecalhoPublico';
import { Rodape } from './components/Rodape';
import { SobreNos } from './components/SobreNos';
import { HeroSection } from './components/HeroSection';
import { LoginSection } from './components/LoginSection';
import { CategoryGrid } from './components/CategoryGrid';
import { PERGUNTA_SAIR_SEM_SALVAR, VideoPlayer } from './components/VideoPlayer';
import { Painel } from './components/Painel';
import { MeusCursos } from './components/MeusCursos';
import { NossosCursos } from './components/NossosCursos';
import { MeusCertificados } from './components/MeusCertificados';
import { AulaIndisponivel } from './components/AulaIndisponivel';
import { ExercicioDialog } from './components/ExercicioDialog';
import { NivelamentoDialog } from './components/NivelamentoDialog';
import { Button } from './components/ui/button';
import { toast, Toaster } from 'sonner';
import { catalogo, modules, lessons } from '../../shared/catalog';
import { exercicios } from '../../shared/exercicios';
import { perguntasDoNivelamento } from '../../shared/nivelamento';
import { cursoDoModulo, moduloCompleto, moduloLiberado } from '../../shared/progressao';
import type { CorrecaoDTO, MatriculaDTO, NivelamentoDTO, ResultadoExercicioDTO, UserDTO } from '../../shared/contracts';
import {
  ApiError,
  concluirAula,
  dispensarModulo,
  entrar,
  enviarExercicio,
  matriculas as consultarMatriculas,
  matricular,
  nivelamento as consultarNivelamento,
  progresso,
  responderNivelamento,
  resultadosDosExercicios,
  sair,
  salvarPerfil,
  sessaoAtual,
} from './lib/api';
import { caminhoDe, lerRota, SECOES_PRIVADAS } from './lib/rotas';

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
  const [matriculas, setMatriculas] = useState<MatriculaDTO[]>([]);
  const [matriculasCarregadas, setMatriculasCarregadas] = useState(false);
  const [resultados, setResultados] = useState<Map<string, ResultadoExercicioDTO>>(
    () => new Map(),
  );
  const [resultadosCarregados, setResultadosCarregados] = useState(false);
  const [erroCarregamentoAula, setErroCarregamentoAula] = useState(false);
  const [tentativaCarregamentoAula, setTentativaCarregamentoAula] = useState(0);
  const [exercicioAberto, setExercicioAberto] = useState<string | null>(null);
  const [nivelamento, setNivelamento] = useState<NivelamentoDTO | null>(null);
  const [nivelamentoAdiado, setNivelamentoAdiado] = useState(false);
  const aprovados = new Set(
    [...resultados.values()].filter((resultado) => resultado.aprovado).map((resultado) => resultado.moduleId),
  );
  const dispensados = new Set<string>(nivelamento?.dispensados ?? []);
  const liberado = (moduleId: string) => moduloLiberado(catalogo, moduleId, concluidas, aprovados, dispensados);
  const dispensavel = (moduleId: string) =>
    (nivelamento?.dispensaveis.includes(moduleId) ?? false)
    && liberado(moduleId)
    && !dispensados.has(moduleId)
    && !moduloCompleto(catalogo, moduleId, concluidas, aprovados, dispensados)
    && lessons.some((aula) => aula.moduleId === moduleId);
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
      setMatriculas([]);
      setMatriculasCarregadas(false);
      setResultados(new Map());
      setResultadosCarregados(false);
      setExercicioAberto(null);
      setNivelamento(null);
      setNivelamentoAdiado(false);
      toast.info('Sua sessão expirou. Entre novamente.');
    } else {
      toast.error(err.message);
    }
  };

  const usuarioId = sessao.estado === 'autenticada' ? sessao.usuario.id : null;

  useEffect(() => {
    setConcluidas(new Map());
    setProgressoCarregado(false);
    setErroCarregamentoAula(false);
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
        setErroCarregamentoAula(true);
        tratarErro(err);
      });

    return () => {
      cancelado = true;
    };
  }, [usuarioId, tentativaCarregamentoAula]);

  useEffect(() => {
    setMatriculas([]);
    setMatriculasCarregadas(false);
    if (!usuarioId) return;

    let cancelado = false;
    consultarMatriculas()
      .then((matriculas) => {
        if (cancelado) return;
        setMatriculas(matriculas);
        setMatriculasCarregadas(true);
      })
      .catch((err) => {
        if (cancelado) return;
        setErroCarregamentoAula(true);
        tratarErro(err);
      });

    return () => {
      cancelado = true;
    };
  }, [usuarioId, tentativaCarregamentoAula]);

  useEffect(() => {
    setResultados(new Map());
    setResultadosCarregados(false);
    if (!usuarioId) return;

    let cancelado = false;
    resultadosDosExercicios()
      .then((resultados) => {
        if (cancelado) return;
        setResultados(new Map(resultados.map((resultado) => [resultado.moduleId, resultado])));
        setResultadosCarregados(true);
      })
      .catch((err) => {
        if (cancelado) return;
        setErroCarregamentoAula(true);
        tratarErro(err);
      });

    return () => {
      cancelado = true;
    };
  }, [usuarioId, tentativaCarregamentoAula]);

  useEffect(() => {
    setNivelamento(null);
    setNivelamentoAdiado(false);
    if (!usuarioId) return;

    let cancelado = false;
    consultarNivelamento()
      .then((nivelamento) => {
        if (cancelado) return;
        setNivelamento(nivelamento);
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
    setMatriculas([]);
    setMatriculasCarregadas(false);
    setResultados(new Map());
    setResultadosCarregados(false);
    setExercicioAberto(null);
    setNivelamento(null);
    setNivelamentoAdiado(false);
    history.replaceState(null, '', '/');
    setCurrentSection('home');
    setSelectedLessonId(null);
  };

  const handleSectionChange = (section: string) => {
    irPara(section, null);
  };

  const handleMatricular = async (courseId: string, irParaMeusCursos = true): Promise<void> => {
    try {
      const matricula = await matricular(courseId);
      setMatriculas((anteriores) => [...anteriores, matricula]);
      toast.success('Matrícula feita. O curso está em Meus cursos.');
      if (irParaMeusCursos) irPara('meus-cursos', null);
    } catch (err) {
      tratarErro(err);
    }
  };

  const handleSalvarNome = async (nome: string): Promise<void> => {
    try {
      const usuario = await salvarPerfil(nome);
      setSessao({ estado: 'autenticada', usuario });
      toast.success('Nome salvo.');
    } catch (err) {
      tratarErro(err);
    }
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
      const aula = lessons.find((item) => item.id === lessonId);
      const aulasDoModulo = lessons.filter((item) => item.moduleId === aula.moduleId);
      if (
        aulasDoModulo.every((item) => item.id === lessonId || concluidas.has(item.id))
        && exercicios.some((exercicio) => exercicio.moduleId === aula.moduleId && exercicio.perguntas.length > 0)
        && !aprovados.has(aula.moduleId)
      ) {
        toast.info('Você concluiu as aulas deste módulo. Faça a avaliação para liberar o próximo.');
      }
    } catch (err) {
      tratarErro(err);
    }
  };

  const handleEnviarExercicio = async (moduleId: string, respostas: number[]): Promise<CorrecaoDTO | null> => {
    try {
      const correcao = await enviarExercicio(moduleId, respostas);
      setResultados((anteriores) => new Map(anteriores).set(moduleId, correcao.resultado));
      if (correcao.aprovadoNestaTentativa) toast.success('Avaliação aprovada.');
      return correcao;
    } catch (err) {
      tratarErro(err);
      return null;
    }
  };

  const handleDispensar = async (moduleId: string): Promise<void> => {
    try {
      const nivelamentoAtualizado = await dispensarModulo(moduleId);
      setNivelamento(nivelamentoAtualizado);
      toast.success('Módulo dispensado. O próximo foi liberado.');
    } catch (err) {
      tratarErro(err);
    }
  };

  const handleResponderNivelamento = async (respostas: number[]): Promise<boolean> => {
    try {
      const nivelamentoRespondido = await responderNivelamento(respostas);
      setNivelamento(nivelamentoRespondido);
      toast.success('Obrigado! Suas respostas foram registradas.');
      if (nivelamentoRespondido.dispensaveis.length > 0) {
        toast.info('Você pode pular os módulos em que foi bem no diagnóstico. A opção aparece em Meus cursos, na vez de cada módulo.');
      }
      return true;
    } catch (err) {
      if (err instanceof ApiError && err.code === 'nivelamento_respondido') {
        setNivelamento((anterior) => anterior ? { ...anterior, respondido: true } : anterior);
        return true;
      }
      tratarErro(err);
      return false;
    }
  };

  const renderCurrentSection = () => {
    if (sessao.estado !== 'autenticada') return null;

    if (selectedLessonId) {
      if (erroCarregamentoAula) {
        return (
          <AulaIndisponivel
            titulo='Não foi possível carregar a aula'
            texto='Tente novamente para carregar seu progresso e os dados do curso.'
            acao='Tentar novamente'
            onAcao={() => setTentativaCarregamentoAula((anterior) => anterior + 1)}
          />
        );
      }

      if (!progressoCarregado || !matriculasCarregadas || !resultadosCarregados) {
        return <p className='text-center text-gray-500 py-12'>Carregando...</p>;
      }

      const lesson = lessons.find((l) => l.id === selectedLessonId);
      const module = modules.find((m) => m.id === lesson.moduleId);
      const curso = cursoDoModulo(catalogo, module.id);

      if (!matriculas.some((matricula) => matricula.courseId === curso.id)) {
        return (
          <AulaIndisponivel
            titulo='Matrícula necessária'
            texto={'Para assistir às aulas e registrar seu progresso, faça a matrícula no curso ' + curso.title + '.'}
            acao='Matricular-se'
            onAcao={() => handleMatricular(curso.id, false)}
          />
        );
      }

      if (!liberado(module.id)) {
        return (
          <AulaIndisponivel
            titulo='Módulo bloqueado'
            texto='Conclua as aulas e a avaliação do módulo anterior para liberar este módulo.'
            acao='Ir para Meus cursos'
            onAcao={() => irPara('meus-cursos', null)}
          />
        );
      }

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
          liberado={liberado}
          resultados={resultados}
          onAbrirExercicio={setExercicioAberto}
        />
      );
    }

    switch (currentSection) {
      case 'meus-cursos':
        return (
          <MeusCursos
            matriculas={matriculas}
            carregado={matriculasCarregadas && progressoCarregado && resultadosCarregados}
            concluidas={concluidas}
            onCategorySelect={handleCategorySelect}
            onVerNossosCursos={() => irPara('nossos-cursos', null)}
            liberado={liberado}
            resultados={resultados}
            onExercicio={setExercicioAberto}
            nivelamento={nivelamento}
            onResponderNivelamento={() => setNivelamentoAdiado(false)}
            dispensavel={dispensavel}
            dispensados={dispensados}
            onDispensar={handleDispensar}
          />
        );

      case 'nossos-cursos':
        return (
          <NossosCursos
            matriculas={matriculas}
            carregado={matriculasCarregadas}
            onMatricular={handleMatricular}
            onIrParaMeusCursos={() => irPara('meus-cursos', null)}
          />
        );

      case 'certificados':
        return <MeusCertificados />;

      case 'sobre':
        return <SobreNos />;

      case 'home':
      default:
        return (
          <Painel
            usuario={sessao.usuario}
            concluidas={concluidas}
            carregado={progressoCarregado}
            onSalvarNome={handleSalvarNome}
          />
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
    if (
      currentSection === 'entrar' ||
      SECOES_PRIVADAS.has(currentSection) ||
      selectedLessonId !== null
    ) {
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
  const exercicioSelecionado = exercicios.find((exercicio) => exercicio.moduleId === exercicioAberto && exercicio.perguntas.length > 0);

  return (
    <div className='min-h-screen bg-white'>
      <Header
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
        userLabel={sessao.usuario.nome ?? sessao.usuario.email}
        onLogout={handleLogout}
      />

      <main>{renderCurrentSection()}</main>

      {exercicioSelecionado && (
        <ExercicioDialog
          exercicio={exercicioSelecionado}
          tituloDoModulo={modules.find((modulo) => modulo.id === exercicioAberto).title}
          resultado={resultados.get(exercicioAberto)}
          aberto={true}
          onFechar={() => setExercicioAberto(null)}
          onEnviar={(respostas) => handleEnviarExercicio(exercicioAberto, respostas)}
        />
      )}

      <NivelamentoDialog
        perguntas={perguntasDoNivelamento}
        aberto={Boolean(nivelamento?.disponivel && !nivelamento.respondido && !nivelamentoAdiado)}
        onAdiar={() => setNivelamentoAdiado(true)}
        onEnviar={handleResponderNivelamento}
      />

      {/* Footer */}
      <Rodape />

      {toaster}
    </div>
  );
}
