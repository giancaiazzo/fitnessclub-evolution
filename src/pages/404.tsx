
import Layout from '../layouts/Layout.tsx';
import { siteData } from '../data/siteData';


<Layout
  title={`404 - Página no encontrada | ${siteData.name}`}
  description="Página no encontrada"
>
  <section className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-card to-background pt-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-9xl font-bold text-primary mb-4">
        404
      </h1>

      <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
        Página no encontrada
      </h2>

      <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
        La página que estás buscando no existe o fue movida.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
        <a
          href="/"
          className="bg-primary hover:bg-[#86c312] text-primary-foreground px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 inline-flex items-center justify-center gap-3"
        >
          Volver al inicio
          <i className="ri-home-line"></i>
        </a>

        <a
          href="/contact"
          className="bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 rounded-lg font-bold text-lg transition-all inline-flex items-center justify-center gap-3"
        >
          Contactanos
          <i className="ri-mail-line"></i>
        </a>
      </div>
    </div>
  </section>
</Layout>

