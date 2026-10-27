export function formatarCpf(texto: string): string {
  return texto.replace(/\D/g, '').slice(0, 11)
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3}\.\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3}\.\d{3}\.\d{3})(\d)/, '$1-$2');
}

export function cpfValido(texto: string): boolean {
  const digitos = texto.replace(/\D/g, '');
  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) return false;

  for (const tamanho of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) {
      soma += Number(digitos[i]) * (tamanho + 1 - i);
    }
    const resto = soma % 11;
    const verificador = resto < 2 ? 0 : 11 - resto;
    if (Number(digitos[tamanho]) !== verificador) return false;
  }
  return true;
}
