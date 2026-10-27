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

  pdf.setDrawColor('#177a7a');
  pdf.setLineWidth(1.2);
  pdf.rect(10, 10, largura - 20, altura - 20);
  pdf.setDrawColor('#2b364a');
  pdf.setLineWidth(0.3);
  pdf.rect(13, 13, largura - 26, altura - 26);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor('#2b364a');
  pdf.setFontSize(14);
  pdf.text('Fluxo Docente', centro, 35, { align: 'center' });
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(34);
  pdf.setTextColor('#177a7a');
  pdf.text('CERTIFICADO', centro, 60, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor('#2b364a');
  const texto = `Certificamos que ${nome}, CPF ${cpf}, concluiu o curso on-line ${curso}, com carga horária de ${cargaHorariaHoras} ${cargaHorariaHoras === 1 ? 'hora' : 'horas'}, em ${data}.`;
  let tamanho = 18;
  pdf.setFontSize(tamanho);
  let linhas: string[] = pdf.splitTextToSize(texto, largura - 64);
  while (linhas.length * tamanho * 0.5 > 60 && tamanho > 10) {
    pdf.setFontSize(--tamanho);
    linhas = pdf.splitTextToSize(texto, largura - 64);
  }
  const passo = tamanho * 0.5;
  const inicio = 111 - ((linhas.length - 1) * passo) / 2;
  linhas.forEach((linha, i) => pdf.text(linha, centro, inicio + i * passo, { align: 'center' }));

  pdf.setDrawColor('#2b364a');
  pdf.line(centro - 42, 164, centro + 42, 164);
  pdf.setFontSize(14);
  pdf.text('Equipe Fluxo Docente', centro, 173, { align: 'center' });
  pdf.setFontSize(10);
  pdf.text(`Código do certificado: ${codigo}`, centro, 190, { align: 'center' });
  pdf.save('certificado-fluxo-docente.pdf');
}
