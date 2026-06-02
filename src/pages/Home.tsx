import Layout from "../layouts/Layout";
import Hero from "../components/Hero";
import Statistics from "../components/Statistics";
import Features from "../components/Features";
import Facilities from "../components/Facilities";
import ClassesSection from "../components/Classes";
import ClassSchedule from "../components/ClassSchedule";
import PricingPlans from "../components/PricingPlans";
import SuccessStories from "../components/SuccessStories";
import Testimonials from "../components/Testimonials";
import FAQ from "../components/FAQ";
import { siteData } from "../data/siteData";

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

      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Transform Your Life?
          </h2>

          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of members who are already on their fitness journey
          </p>

          <a
            href="/contact"
            className="inline-flex items-center justify-center gap-3 bg-white text-orange-500 hover:bg-slate-100 px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Get Started Today
            <i className="ri-arrow-right-line"></i>
          </a>
        </div>
      </section>
    </Layout>
  );
}
