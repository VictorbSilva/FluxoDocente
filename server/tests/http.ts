export interface Resposta {
  status: number;
  corpo: any;
  setCookie: string[];
}

export interface OpcoesDeEnvio {
  corpo?: unknown;
  cookie?: string;
  semCabecalho?: boolean;
}

export function novoCliente(baseUrl: string) {
  let cookie: string | undefined;

  return {
    get cookie() {
      return cookie;
    },

    async enviar(metodo: string, caminho: string, opcoes: OpcoesDeEnvio = {}): Promise<Resposta> {
      const headers: Record<string, string> = {};

      if (opcoes.corpo !== undefined) {
        headers['content-type'] = 'application/json';
      }

      if (metodo !== 'GET' && !opcoes.semCabecalho) {
        headers['x-fluxodocente'] = '1';
      }

      const cookieEnviado = opcoes.cookie ?? cookie;

      if (cookieEnviado) {
        headers.cookie = cookieEnviado;
      }

      const resposta = await fetch(baseUrl + caminho, {
        method: metodo,
        headers,
        body: opcoes.corpo === undefined ? undefined : JSON.stringify(opcoes.corpo),
      });
      const setCookie = resposta.headers.getSetCookie();
      const sid = setCookie.find((valor) => valor.startsWith('fd.sid='));

      if (sid) {
        const par = sid.split(';')[0];
        cookie = par === 'fd.sid=' ? undefined : par;
      }

      const texto = await resposta.text();
      return { status: resposta.status, corpo: texto ? JSON.parse(texto) : null, setCookie };
    },
  };
}

export async function entrar(baseUrl: string, email: string, senha: string): Promise<string> {
  const cliente = novoCliente(baseUrl);
  const resposta = await cliente.enviar('POST', '/api/auth/login', {
    corpo: { email, password: senha },
  });

  if (resposta.status !== 200 || !cliente.cookie) {
    throw new Error(`Login de ${email} falhou com status ${resposta.status}.`);
  }

  return cliente.cookie;
}
