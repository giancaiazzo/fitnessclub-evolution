import Layout from "../layouts/Layout";
import Hero from "../MOD1-CLIENTES/components/Hero";
import Statistics from "../MOD1-CLIENTES/components/Statistics";
import Features from "../MOD1-CLIENTES/components/Features";
import Facilities from "../MOD1-CLIENTES/components/Facilities";
import ClassesSection from "../MOD1-CLIENTES/components/Classes";
import ClassSchedule from "../MOD1-CLIENTES/components/ClassSchedule";
import PricingPlans from "../MOD1-CLIENTES/components/PricingPlans";
import SuccessStories from "../MOD1-CLIENTES/components/SuccessStories";
import Testimonials from "../MOD1-CLIENTES/components/Testimonials";
import FAQ from "../MOD1-CLIENTES/components/FAQ";
import { siteData } from "../MOD1-CLIENTES/data/siteData";

export default function HomePage() {
  return (
    <Layout
      title={`${siteData.name} - ${siteData.tagline}`}
      description={siteData.description}
    >
      <Hero />
      <Statistics />
      <Features />
      <Facilities />
      <ClassesSection />
      <ClassSchedule />
      <PricingPlans />
      <SuccessStories />
      <Testimonials />
      <FAQ />

      <section className="py-20 bg-gradient-to-r from-primary to-[#86c312]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
      ¿Listo para transformar tu vida?
    </h2>

    <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
      Únete a cientos de miembros que ya están en su viaje fitness
    </p>

    <a
      href="/contact"
      className="inline-flex items-center justify-center gap-3 bg-background text-primary hover:bg-card px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
    >
      Comienza hoy
      <i className="ri-arrow-right-line"></i>
    </a>
  </div>
</section>
    </Layout>
  );
}
