// Índice da alternativa certa (começando em 0), na ordem das perguntas.
// Fica só em server/: src/ nunca importa este arquivo, e o Vite só empacota o que src/ importa.
export interface Gabaritos {
  exercicios: Readonly<Record<string, readonly number[]>>;
  nivelamento: readonly number[] | null;
}

// Chave: moduleId do exercício em shared/exercicios.ts.
export const gabaritoDosExercicios: Gabaritos['exercicios'] = {};
