import Layout from "../layouts/Layout";
import Hero from "../MOD1-CLIENTES/components/Hero";
import Features from "../MOD1-CLIENTES/components/Features";
import ServicesOverview from "../MOD1-CLIENTES/components/ServicesOverview";
import Facilities from "../MOD1-CLIENTES/components/Facilities";
import ClassesSection from "../MOD1-CLIENTES/components/Classes";
import ClassSchedule from "../MOD1-CLIENTES/components/ClassSchedule";
import PricingPlans from "../MOD1-CLIENTES/components/PricingPlans";
import FAQ from "../MOD1-CLIENTES/components/FAQ";
import { siteData } from "../MOD1-CLIENTES/data/siteData";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <Layout
      title={`${siteData.name} - ${siteData.tagline}`}
      description={siteData.description}
    >
      <Hero />
      <Features />
      <ServicesOverview />
      <Facilities />
      <ClassesSection />
      <ClassSchedule />
      <PricingPlans />
      <FAQ />

      <section className="bg-gradient-to-r from-primary to-[#86c312] py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-primary-foreground sm:text-4xl md:text-5xl">
            ¿Listo para comenzar tu proceso?
          </h2>

          <p className="mx-auto mb-8 mt-4 max-w-2xl text-lg text-primary-foreground/90 sm:text-xl">
            Sumate a una comunidad que entrena con objetivos claros y acompañamiento.
          </p>

          <Link
            to="/contact"
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-background px-7 py-3.5 text-lg font-bold text-primary shadow-lg transition hover:bg-card"
          >
            Contactanos
            <i className="ri-arrow-right-line" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </Layout>
  );
}
