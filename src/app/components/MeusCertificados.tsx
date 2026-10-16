import { Card } from './ui/card';

export function MeusCertificados() {
  return (
    <section className='py-12 md:py-16 bg-white'>
      <div className='max-w-7xl mx-auto px-4'>
        <h2 className='text-2xl md:text-3xl text-gray-900 mb-6'>Meus certificados</h2>
        <Card className='p-6'>
          <p className='text-gray-600'>
            Você ainda não tem certificados. Quando concluir um curso, o certificado aparece aqui.
          </p>
        </Card>
      </div>
    </section>
  );
}
