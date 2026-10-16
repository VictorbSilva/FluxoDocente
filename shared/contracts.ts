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

export interface NoteDTO {
  lessonId: string;
  content: string;
  updatedAt: string | null; // ISO 8601; null quando não há anotação
}

export interface ApiErrorBody {
  error: { code: string; message: string };
}

export interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
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
