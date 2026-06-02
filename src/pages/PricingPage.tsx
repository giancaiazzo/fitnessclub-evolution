import Layout from "../layouts/Layout";
import PricingPlans from "../components/PricingPlans";
import { paymentOptions, pricingPlans, siteData } from "../data/siteData";

const comparisonRows = [
  {
    feature: "Gym Access",
    values: ["check", "check", "check"],
  },
  {
    feature: "24/7 Access",
    values: ["no", "check", "check"],
  },
  {
    feature: "Group Classes",
    values: ["no", "check", "check"],
  },
  {
    feature: "Personal Trainer",
    values: ["Consultation only", "Consultation included", "Unlimited"],
  },
  {
    feature: "Nutrition Guidance",
    values: ["no", "check", "Custom Plans"],
  },
  {
    feature: "Spa & Recovery",
    values: ["no", "no", "check"],
  },
  {
    feature: "Priority Booking",
    values: ["no", "no", "check"],
  },
];

function renderComparisonValue(value: string) {
  if (value === "check") {
    return <i className="ri-checkbox-circle-fill text-orange-500 text-xl"></i>;
  }

  if (value === "no") {
    return <i className="ri-close-circle-line text-gray-600 text-xl"></i>;
  }

  if (value === "Unlimited" || value === "Custom Plans") {
    return <span className="text-orange-500 font-semibold">{value}</span>;
  }

  return <span className="text-gray-400 text-sm">{value}</span>;
}

export default function PricingPage() {
  return (
    <Layout
      title={`Pricing - ${siteData.name}`}
      description="Choose the perfect membership plan for your fitness journey"
    >
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Membership Plans
            </h1>

            <p className="text-xl text-gray-300">
              Flexible pricing options to fit your lifestyle and fitness goals
            </p>
          </div>
        </div>
      </section>

      <PricingPlans showHeading={false} />

      <section className="py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">
            Plan Comparison
          </h2>

          <p className="text-xl text-gray-300 mb-12 text-center max-w-2xl mx-auto">
            Compare features across all membership plans
          </p>

          <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-6 py-4 text-left text-white font-semibold">
                    Features
                  </th>

                  {pricingPlans.map((plan) => (
                    <th
                      key={plan.name}
                      className="px-6 py-4 text-center text-white font-semibold"
                    >
                      {plan.name}

                      {plan.popular && (
                        <span className="block text-orange-500 text-sm font-normal mt-1">
                          Most Popular
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="text-gray-300">
                {comparisonRows.map((row) => (
                  <tr
                    key={row.feature}
                    className="border-b border-slate-700/50 last:border-b-0"
                  >
                    <td className="px-6 py-4 font-medium">{row.feature}</td>

                    {row.values.map((value, index) => (
                      <td
                        key={`${row.feature}-${index}`}
                        className="px-6 py-4 text-center"
                      >
                        {renderComparisonValue(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Payment Options
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            {paymentOptions.plans.map((plan) => (
              <div
                key={plan.type}
                className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center hover:border-orange-500 transition-all"
              >
                <h3 className="text-2xl font-bold text-white mb-3">
                  {plan.type}
                </h3>

                <p className="text-gray-300 leading-relaxed">
                  {plan.description}
                </p>
              </div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 mb-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                Accepted Payment Methods
              </h3>

              <div className="flex flex-wrap justify-center gap-4">
                {paymentOptions.methods.map((method) => (
                  <div
                    key={method}
                    className="bg-slate-900 px-6 py-3 rounded-lg border border-slate-700"
                  >
                    <span className="text-gray-300 font-medium">{method}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-orange-500/10 border border-orange-500/30 p-6 rounded-xl text-center">
                <i className="ri-shield-check-line text-4xl text-orange-500 mb-4"></i>
                <h4 className="text-xl font-bold text-white mb-2">
                  Money-Back Guarantee
                </h4>
                <p className="text-gray-300">{paymentOptions.guarantee}</p>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/30 p-6 rounded-xl text-center">
                <i className="ri-gift-line text-4xl text-orange-500 mb-4"></i>
                <h4 className="text-xl font-bold text-white mb-2">
                  Free Trial
                </h4>
                <p className="text-gray-300">{paymentOptions.trial}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Frequently Asked Questions
          </h2>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-orange-500 transition-all">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <i className="ri-question-line text-orange-500"></i>
                Can I cancel my membership anytime?
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Yes, you can cancel your membership at any time with 30 days
                notice. No long-term contracts required.
              </p>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-orange-500 transition-all">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <i className="ri-question-line text-orange-500"></i>
                Do you offer trial periods?
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Yes! We offer a 7-day free trial for new members. Come in and
                experience everything we have to offer.
              </p>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-orange-500 transition-all">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <i className="ri-question-line text-orange-500"></i>
                Are personal training sessions included?
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Personal training sessions are included in Premium and Elite
                plans. Basic members can purchase sessions separately.
              </p>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-orange-500 transition-all">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <i className="ri-question-line text-orange-500"></i>
                What payment methods do you accept?
              </h3>
              <p className="text-gray-400 leading-relaxed">
                We accept all major credit cards, debit cards, and bank
                transfers. Monthly payments are automatically processed.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>

          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Contact us today to schedule a tour and start your fitness journey
          </p>

          <a
            href="/contact"
            className="inline-flex items-center justify-center gap-3 bg-white text-orange-500 hover:bg-slate-100 px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Contact Us
            <i className="ri-arrow-right-line"></i>
          </a>
        </div>
      </section>
    </Layout>
  );
}
