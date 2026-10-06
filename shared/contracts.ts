export interface UserDTO {
  id: string;
  email: string;
}

export interface CompletionDTO {
  lessonId: string;
  completedAt: string; // ISO 8601
}

export interface ProgressDTO {
  completions: CompletionDTO[];
}

export interface ApiErrorBody {
  error: { code: string; message: string };
}

export type Difficulty = 'Iniciante' | 'Intermediário' | 'Avançado';

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration: string;
  difficulty: Difficulty;
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
  tags?: string[];
}
