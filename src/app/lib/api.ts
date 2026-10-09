import type {
  ApiErrorBody,
  CompletionDTO,
  ProgressDTO,
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

export function concluirAula(lessonId: string): Promise<CompletionDTO> {
  return requisitar<CompletionDTO>(
    '/me/progress/' + encodeURIComponent(lessonId),
    { method: 'PUT' },
  );
}
