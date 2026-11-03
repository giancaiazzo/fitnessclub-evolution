import Layout from '../layouts/Layout.tsx';
import Hero from '../MOD1-CLIENTES/components/Hero.tsx';
import Statistics from '../MOD1-CLIENTES/components/Statistics.tsx';
import Features from '../MOD1-CLIENTES/components/Features.tsx';
import Facilities from '../MOD1-CLIENTES/components/Facilities.tsx';
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
  <PricingPlans />
  <SuccessStories />
  <Testimonials />
  <FAQ />

</Layout>
