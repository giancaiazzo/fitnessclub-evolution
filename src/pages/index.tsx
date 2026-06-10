import Layout from '../layouts/Layout.tsx';
import Hero from '../MOD1-CLIENTES/components/Hero.tsx';
import Statistics from '../MOD1-CLIENTES/components/Statistics.tsx';
import Features from '../MOD1-CLIENTES/components/Features.tsx';
import Facilities from '../MOD1-CLIENTES/components/Facilities.tsx';
import classNamees from '../MOD1-CLIENTES/components/classNamees.tsx';
import classNameSchedule from '../MOD1-CLIENTES/components/classNameSchedule.tsx';
import PricingPlans from '../MOD1-CLIENTES/components/PricingPlans.tsx';
import SuccessStories from '../MOD1-CLIENTES/components/SuccessStories.tsx';
import Testimonials from '../MOD1-CLIENTES/components/Testimonials.tsx';
import FAQ from '../MOD1-CLIENTES/components/FAQ.tsx';
import { siteData } from '../MOD1-CLIENTES/data/siteData.ts';


<Layout title={`${siteData.name} - ${siteData.tagline}`} description={siteData.description}>
  <Hero />
  <Statistics />
  <Features />
  <Facilities />
  <classNamees />
  <classNameSchedule />
  <PricingPlans />
  <SuccessStories />
  <Testimonials />
  <FAQ />
  
  <section className="py-20 bg-linear-to-r from-primary to-[#86c312]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
      Listo para transformar tu vida?
    </h2>

    <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
      Unete a cientos de miembros que ya están en su viaje fitness
    </p>

    <a
      href="/contact"
      className="inline-flex items-center justify-center gap-3 bg-background text-primary hover:bg-card px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
    >
      Inicia ho
      <i className="ri-arrow-right-line"></i>
    </a>
  </div>
</section>
</Layout>
