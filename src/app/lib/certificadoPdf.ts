import { carregarLogoComoPng } from './logoParaPdf';

interface DadosCertificadoPdf {
  nome: string;
  cpf: string;
  curso: string;
  cargaHorariaHoras: number;
  emitidoEm: string;
  codigo: string;
}

export async function baixarCertificadoPdf({
  nome, cpf, curso, cargaHorariaHoras, emitidoEm, codigo,
}: DadosCertificadoPdf): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const largura = pdf.internal.pageSize.getWidth();
  const altura = pdf.internal.pageSize.getHeight();
  const centro = largura / 2;
  const data = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Fortaleza',
  }).format(new Date(emitidoEm));

  pdf.setFillColor('#f0fafa');
  pdf.rect(0, 0, largura, altura, 'F');
  pdf.saveGraphicsState();
  pdf.setGState(pdf.GState({ opacity: 0.12 }));
  pdf.setFillColor('#13c8b5');
  pdf.circle(largura - 8, 8, 65, 'F');
  pdf.setFillColor('#7375a5');
  pdf.circle(8, altura - 8, 65, 'F');
  pdf.restoreGraphicsState();

  pdf.setFillColor('#ffffff');
  pdf.roundedRect(12, 12, largura - 24, altura - 24, 4, 4, 'F');
  pdf.saveGraphicsState();
  pdf.roundedRect(12, 12, largura - 24, altura - 24, 4, 4, null);
  pdf.clip();
  pdf.discardPath();
  const faixas = Math.ceil((largura - 24) / 0.5);
  const larguraFaixa = (largura - 24) / faixas;
  const inicioDegrade = [43, 54, 74];
  const fimDegrade = [23, 122, 122];
  for (let i = 0; i < faixas; i++) {
    const cor = inicioDegrade.map((canal, j) => Math.round(canal + (fimDegrade[j] - canal) * i / (faixas - 1)));
    pdf.setFillColor(cor[0], cor[1], cor[2]);
    pdf.rect(12 + i * larguraFaixa, 12, larguraFaixa + 0.01, 6, 'F');
  }
  pdf.restoreGraphicsState();
  pdf.setDrawColor('#21a3a3');
  pdf.setLineWidth(0.3);
  pdf.roundedRect(12, 12, largura - 24, altura - 24, 4, 4, 'S');

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor('#2b364a');
  try {
    const larguraLogo = 70;
    const logo = await carregarLogoComoPng('/logo-fluxodocente.svg', larguraLogo * 96 / 25.4);
    pdf.addImage(logo.dataUrl, 'PNG', centro - larguraLogo / 2, 26, larguraLogo, larguraLogo / logo.proporcao);
  } catch {
    pdf.setFontSize(20);
    pdf.text('Fluxo Docente', centro, 40, { align: 'center' });
  }
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(34);
  pdf.text('CERTIFICADO', centro, 66, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(22);
  pdf.setTextColor('#21a3a3');
  pdf.text('de conclusão', centro, 77, { align: 'center' });

  pdf.setTextColor('#2b364a');
  pdf.setFontSize(16);
  pdf.text('Certificamos que', centro, 97, { align: 'center' });
  pdf.setFont('helvetica', 'bold');
  let tamanhoNome = 26;
  pdf.setFontSize(tamanhoNome);
  while (pdf.getTextWidth(nome) > largura - 64 && tamanhoNome > 18) {
    pdf.setFontSize(--tamanhoNome);
  }
  pdf.text(nome, centro, 112, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  const texto = `CPF ${cpf}, concluiu o curso on-line ${curso}, com carga horária de ${cargaHorariaHoras} ${cargaHorariaHoras === 1 ? 'hora' : 'horas'}, em ${data}.`;
  let tamanho = 16;
  pdf.setFontSize(tamanho);
  let linhas: string[] = pdf.splitTextToSize(texto, largura - 64);
  while (linhas.length * tamanho * 0.5 > 32 && tamanho > 10) {
    pdf.setFontSize(--tamanho);
    linhas = pdf.splitTextToSize(texto, largura - 64);
  }
  const passo = tamanho * 0.5;
  const inicio = 136 - ((linhas.length - 1) * passo) / 2;
  linhas.forEach((linha, i) => pdf.text(linha, centro, inicio + i * passo, { align: 'center' }));

  pdf.setDrawColor('#21a3a3');
  pdf.line(centro - 42, 164, centro + 42, 164);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Equipe Fluxo Docente', centro, 173, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor('#6b7280');
  pdf.setFontSize(9);
  pdf.text(`Código do certificado: ${codigo}`, centro, 190, { align: 'center' });
  pdf.save('certificado-fluxo-docente.pdf');
}
