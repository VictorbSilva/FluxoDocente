import { BookOpen, Code2, GraduationCap, Video } from 'lucide-react';

const integrantes = [
  {
    nome: 'Mirela Ferraz de A. G. de Souza',
    papel: 'Planejamento de aulas e atividades',
    descricao: 'Responsável pela produção do plano de aulas e do conteúdo das atividades do curso. Sua contribuição reúne a organização do percurso de aprendizagem e a elaboração das propostas de atividades que acompanham as aulas, apoiando a aplicação dos conteúdos pelos docentes.',
    icone: BookOpen,
  },
  {
    nome: 'Patrick Duarte Sardenberg',
    papel: 'Apresentação e gravação das aulas',
    descricao: 'Responsável pela apresentação e gravação das aulas, conduzindo a exposição dos conteúdos nos vídeos que integram o percurso de aprendizagem dos docentes.',
    icone: Video,
  },
  {
    nome: 'Victor Gabriel Basilio e Silva',
    papel: 'Desenvolvimento da plataforma',
    descricao: 'Responsável pelo desenvolvimento completo da plataforma FluxoDocente, da interface à API e ao banco de dados, integrando os recursos que permitem o acesso aos cursos e o acompanhamento da aprendizagem.',
    icone: Code2,
  },
];

export function SobreNos() {
  return (
    <section id='sobre' className='relative isolate overflow-hidden bg-[#f0fafa] py-12 md:py-16'>
      <div aria-hidden='true' className='pointer-events-none absolute -right-24 top-1/3 -z-10 h-80 w-80 rounded-full bg-[#6cf3d5]/20 blur-3xl' />
      <div aria-hidden='true' className='pointer-events-none absolute -left-24 bottom-0 -z-10 h-72 w-72 rounded-full bg-[#7375a5]/10 blur-3xl' />
      <div className='max-w-6xl mx-auto px-4'>
        <div className='max-w-3xl space-y-4'>
          <h2 className='text-2xl md:text-3xl text-gray-900'>Sobre nós</h2>
          <p className='text-gray-700 leading-relaxed'>
            O FluxoDocente é um projeto de Trabalho de Conclusão de Curso desenvolvido no Centro Universitário de João Pessoa (UNIPÊ). Ele nasceu para apoiar docentes do ensino superior no uso crítico e prático de ferramentas de Inteligência Artificial no dia a dia acadêmico, do planejamento das aulas à produção de materiais e à organização da rotina.
          </p>
          <p className='text-gray-700 leading-relaxed'>
            As aulas são curtas, gravadas pela própria equipe e organizadas em módulos, para que cada docente avance no seu ritmo e acompanhe o próprio progresso.
          </p>
        </div>

        <div className='mt-10 md:mt-12'>
          <h3 className='mb-6 text-xl text-gray-900 md:text-2xl'>Quem faz o FluxoDocente</h3>

          <article className='relative overflow-hidden rounded-2xl border border-[#21a3a3]/25 bg-white/70 p-6 shadow-sm backdrop-blur-md md:p-8'>
            <div aria-hidden='true' className='absolute inset-y-0 left-0 w-1 bg-[#177a7a]' />
            <div className='flex flex-col gap-5 md:flex-row md:items-start md:gap-6'>
              <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#177a7a] text-white'>
                <GraduationCap aria-hidden='true' className='h-7 w-7' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='mb-2 text-sm font-medium tracking-wide text-[#177a7a]'>Orientação acadêmica · UNIPÊ</p>
                <h4 className='text-xl leading-snug text-gray-900 md:text-2xl'>José Raul de Brito Andrade</h4>
                <p className='mt-3 max-w-3xl leading-relaxed text-gray-700'>
                  Orientador do TCC, com vínculo institucional com o Centro Universitário de João Pessoa (UNIPÊ). Responsável pela orientação pedagógica e pelo acompanhamento da área de pesquisa, oferecendo a direção acadêmica para o desenvolvimento do projeto.
                </p>
              </div>
            </div>
          </article>

          <div className='mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3'>
            {integrantes.map(({ nome, papel, descricao, icone: Icone }) => (
              <article
                key={nome}
                className='group relative flex flex-col overflow-hidden rounded-2xl border border-[#21a3a3]/15 bg-white/60 p-6 shadow-sm backdrop-blur-md transition-[border-color,box-shadow,background-color] duration-300 hover:border-[#21a3a3]/50 hover:bg-white/85 hover:shadow-lg hover:shadow-[#21a3a3]/10 motion-reduce:transition-none'
              >
                <div aria-hidden='true' className='absolute inset-x-0 top-0 h-1 bg-[#21a3a3] opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none' />
                <div className='mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[#21a3a3]/15 bg-[#e0faf6] text-[#177a7a]'>
                  <Icone aria-hidden='true' className='h-6 w-6' />
                </div>
                <p className='mb-2 text-sm font-medium text-[#177a7a]'>{papel}</p>
                <h4 className='text-xl leading-snug text-gray-900'>{nome}</h4>
                <p className='mt-4 text-sm leading-relaxed text-gray-700'>{descricao}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
