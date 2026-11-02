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

    </Layout>
  );
}
