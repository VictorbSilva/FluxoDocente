import type {
  ApiErrorBody,
  CertificadoDTO,
  CompletionDTO,
  CorrecaoDTO,
  MatriculaDTO,
  NivelamentoDTO,
  NoteDTO,
  ProgressDTO,
  ResultadoExercicioDTO,
  UserDTO,
} from '../../../shared/contracts';

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

interface OpcoesRequisicao {
  method?: string;
  body?: unknown;
}

export async function requisitar<T>(
  caminho: string,
  { method = 'GET', body }: OpcoesRequisicao = {},
): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch('/api' + caminho, {
      method,
      credentials: 'same-origin',
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(method !== 'GET' ? { 'X-FluxoDocente': '1' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      0,
      'erro_de_rede',
      'Não foi possível conectar ao servidor. Tente novamente.',
    );
  }

  if (resposta.status === 204) {
    return undefined;
  }

  if (!resposta.ok) {
    let corpo: ApiErrorBody | undefined;
    try {
      corpo = await resposta.json();
    } catch {
      corpo = undefined;
    }

    if (corpo?.error?.code && corpo.error.message) {
      throw new ApiError(resposta.status, corpo.error.code, corpo.error.message);
    }
    throw new ApiError(
      resposta.status,
      'erro_desconhecido',
      'Erro inesperado. Tente novamente.',
    );
  }

  return resposta.json();
}

export async function entrar(email: string, senha: string): Promise<UserDTO> {
  const { user } = await requisitar<{ user: UserDTO }>('/auth/login', {
    method: 'POST',
    body: { email, password: senha },
  });
  return user;
}

export async function sessaoAtual(): Promise<UserDTO> {
  const { user } = await requisitar<{ user: UserDTO }>('/auth/me');
  return user;
}

export function sair(): Promise<void> {
  return requisitar<void>('/auth/logout', { method: 'POST' });
}

export function progresso(): Promise<ProgressDTO> {
  return requisitar<ProgressDTO>('/me/progress');
}

export async function resultadosDosExercicios(): Promise<ResultadoExercicioDTO[]> {
  const { resultados } = await requisitar<{ resultados: ResultadoExercicioDTO[] }>(
    '/me/exercicios',
  );
  return resultados;
}

export function enviarExercicio(moduleId: string, respostas: number[]): Promise<CorrecaoDTO> {
  return requisitar<CorrecaoDTO>(
    '/me/exercicios/' + encodeURIComponent(moduleId),
    { method: 'POST', body: { respostas } },
  );
}

export function nivelamento(): Promise<NivelamentoDTO> {
  return requisitar<NivelamentoDTO>('/me/nivelamento');
}

export function responderNivelamento(respostas: number[]): Promise<NivelamentoDTO> {
  return requisitar<NivelamentoDTO>('/me/nivelamento', {
    method: 'POST',
    body: { respostas },
  });
}

export function recusarNivelamento(): Promise<NivelamentoDTO> {
  return requisitar<NivelamentoDTO>('/me/nivelamento/recusa', { method: 'POST' });
}

export function dispensarModulo(moduleId: string): Promise<NivelamentoDTO> {
  return requisitar<NivelamentoDTO>(
    '/me/dispensas/' + encodeURIComponent(moduleId),
    { method: 'POST' },
  );
}

export function emitirCertificado(courseId: string): Promise<CertificadoDTO> {
  return requisitar<CertificadoDTO>(
    '/me/certificados/' + encodeURIComponent(courseId),
    { method: 'POST' },
  );
}

export async function matriculas(): Promise<MatriculaDTO[]> {
  const { matriculas } = await requisitar<{ matriculas: MatriculaDTO[] }>('/me/matriculas');
  return matriculas;
}

export function matricular(courseId: string): Promise<MatriculaDTO> {
  return requisitar<MatriculaDTO>(
    '/me/matriculas/' + encodeURIComponent(courseId),
    { method: 'POST' },
  );
}

export async function salvarPerfil(nome: string): Promise<UserDTO> {
  const { user } = await requisitar<{ user: UserDTO }>('/me/perfil', {
    method: 'PUT',
    body: { nome },
  });
  return user;
}

export function concluirAula(lessonId: string): Promise<CompletionDTO> {
  return requisitar<CompletionDTO>(
    '/me/progress/' + encodeURIComponent(lessonId),
    { method: 'PUT' },
  );
}

export function anotacao(lessonId: string): Promise<NoteDTO> {
  return requisitar<NoteDTO>('/me/notes/' + encodeURIComponent(lessonId));
}

export function salvarAnotacao(lessonId: string, content: string): Promise<NoteDTO> {
  return requisitar<NoteDTO>(
    '/me/notes/' + encodeURIComponent(lessonId),
    { method: 'PUT', body: { content } },
  );
}
