export interface UserDTO {
  id: string;
  email: string;
  nome: string | null;
}

export interface CompletionDTO {
  lessonId: string;
  completedAt: string; // ISO 8601
}

export interface ProgressDTO {
  completions: CompletionDTO[];
}

export interface NoteDTO {
  lessonId: string;
  content: string;
  updatedAt: string | null; // ISO 8601; null quando não há anotação
}

export interface MatriculaDTO {
  courseId: string;
  enrolledAt: string; // ISO 8601
}

export interface ResultadoExercicioDTO {
  moduleId: string;
  melhorAcertos: number;
  total: number;
  aprovado: boolean;
  aprovadoEm: string | null; // ISO 8601; null enquanto não aprovado
}

export interface CorrecaoDTO {
  moduleId: string;
  acertos: number;
  total: number;
  corretas: boolean[];
  aprovadoNestaTentativa: boolean;
  resultado: ResultadoExercicioDTO;
}

export interface NivelamentoDTO {
  disponivel: boolean;
  respondido: boolean;
  dispensaveis: string[]; // moduleIds que o docente pode pular
  dispensados: string[]; // moduleIds que o docente pulou
}

export interface ApiErrorBody {
  error: { code: string; message: string };
}

export interface Course {
  id: string;
  title: string;
  description: string;
  moduleIds: string[];
  closingYoutubeId?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  exerciseMinutes?: number;
  color: string;
  tags: string[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  youtubeId: string;
  title: string;
  description?: string;
  instructor?: string;
  duration?: string;
  durationSeconds?: number;
  tags?: string[];
}

export interface PerguntaDTO {
  id: string;
  moduleId?: string; // módulo avaliado; usado só no questionário diagnóstico
  enunciado: string;
  alternativas: string[];
}

// Sem gabarito: ele nunca fica em shared/.
export interface Exercicio {
  moduleId: string;
  instrucoes?: string; // texto mostrado antes das questões da Avaliação
  perguntas: PerguntaDTO[];
}

export interface Catalogo {
  courses: Course[];
  modules: Module[];
  lessons: Lesson[];
  exercicios: Exercicio[];
  nivelamento: PerguntaDTO[];
}
