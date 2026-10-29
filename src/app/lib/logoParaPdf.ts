export async function carregarLogoComoPng(
  caminho: string, larguraPx: number,
): Promise<{ dataUrl: string; proporcao: number }> {
  const resposta = await fetch(caminho);
  if (!resposta.ok) throw new Error('Não foi possível carregar a logo.');

  const documento = new DOMParser().parseFromString(await resposta.text(), 'image/svg+xml');
  const svg = documento.documentElement;
  const viewBox = svg.getAttribute('viewBox')?.trim().split(/[\s,]+/).map(Number);
  if (svg.localName !== 'svg' || viewBox?.length !== 4 || !(viewBox[2] > 0 && viewBox[3] > 0)) {
    throw new Error('A logo não possui um viewBox válido.');
  }

  const proporcao = viewBox[2] / viewBox[3];
  const canvas = document.createElement('canvas');
  // Quatro vezes a resolução de impressão, com tamanho explícito também no SVG (Firefox).
  canvas.width = Math.round(larguraPx * 4);
  canvas.height = Math.round(canvas.width / proporcao);
  svg.setAttribute('width', String(canvas.width));
  svg.setAttribute('height', String(canvas.height));

  const imagem = new Image();
  await new Promise<void>((resolve, reject) => {
    imagem.onload = () => resolve();
    imagem.onerror = () => reject(new Error('Não foi possível desenhar a logo.'));
    // A CSP permite imagens data:, mas não blob:.
    imagem.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
  });

  const contexto = canvas.getContext('2d');
  if (!contexto) throw new Error('Não foi possível criar o canvas da logo.');
  contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
  return { dataUrl: canvas.toDataURL('image/png'), proporcao };
}
