import { pricingPlans } from "../data/siteData";

interface PricingPlansProps {
  showHeading?: boolean;
}

export default function PricingPlans({ showHeading = true }: PricingPlansProps) {
  return (
    <section id="pricing" className="py-20 bg-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {showHeading && (
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Planes de membresía
            </h2>

            <p className="mx-auto max-w-2xl text-xl text-gray-300">
              Choose the plan that fits your fitness journey
            </p>
          </div>
        )}

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border-2 bg-slate-900 p-8 transition-all hover:border-orange-500 ${
                plan.popular
                  ? "scale-105 border-orange-500 shadow-lg shadow-orange-500/20"
                  : "border-slate-700"
              }`}
            >
              {plan.popular && (
                <div className="mb-4 inline-block rounded-full bg-orange-500 px-4 py-1 text-sm font-bold text-white">
                  Most Popular
                </div>
              )}

              <h3 className="mb-2 text-2xl font-bold text-white">
                {plan.name}
              </h3>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  {plan.price}
                </span>
                <span className="text-gray-400">{plan.period}</span>
              </div>

              <ul className="mb-8 space-y-4">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-gray-300"
                  >
                    <i className="ri-checkbox-circle-fill mt-0.5 shrink-0 text-xl text-orange-500" />
                    <span className="leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="/contact"
                className={`flex w-full items-center justify-center gap-3 rounded-lg px-8 py-4 text-lg font-bold transition-all ${
                  plan.popular
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "border border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
                }`}
              >
                Get Started
                <i className="ri-arrow-right-line" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
