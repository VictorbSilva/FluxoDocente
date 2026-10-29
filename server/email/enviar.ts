import nodemailer from 'nodemailer';

export type EnviarEmail = (mensagem: {
  para: string;
  nomeDoDestinatario: string | null;
  assunto: string;
  html: string;
  texto: string;
}) => Promise<void>;

export function criarEnvioPeloGmail(opcoes: { usuario: string; senhaDeApp: string }): EnviarEmail {
  const transporte = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: opcoes.usuario, pass: opcoes.senhaDeApp },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  return async (mensagem) => {
    try {
      await transporte.sendMail({
        from: { name: 'Fluxo Docente', address: opcoes.usuario },
        to: mensagem.nomeDoDestinatario
          ? { name: mensagem.nomeDoDestinatario, address: mensagem.para }
          : mensagem.para,
        subject: mensagem.assunto,
        text: mensagem.texto,
        html: mensagem.html,
      });
    } catch (erro) {
      // O erro original pode trazer a resposta do servidor SMTP e o conteúdo da
      // mensagem; só o código sobe, para o log não guardar link nem credencial.
      const codigo = (erro as { code?: unknown }).code;
      throw new Error(`Falha ao enviar o e-mail pelo Gmail (${typeof codigo === 'string' ? codigo : 'sem código'}).`);
    }
  };
}

// Em desenvolvimento sem Gmail configurado: o e-mail aparece no terminal.
export function criarEnvioPeloConsole(): EnviarEmail {
  return async (mensagem) => {
    console.log(`\n--- E-mail para ${mensagem.para} ---\nAssunto: ${mensagem.assunto}\n\n${mensagem.texto}\n--- Fim do e-mail ---\n`);
  };
}
