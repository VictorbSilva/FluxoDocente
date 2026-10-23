export function ordemEmbaralhada(quantidade: number): number[] {
  const ordem = Array.from({ length: quantidade }, (_, indice) => indice);

  for (let indice = ordem.length - 1; indice > 0; indice--) {
    const sorteado = Math.floor(Math.random() * (indice + 1));
    [ordem[indice], ordem[sorteado]] = [ordem[sorteado], ordem[indice]];
  }

  return ordem;
}
