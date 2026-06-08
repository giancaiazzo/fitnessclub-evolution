import { pricingPlans } from "../data/siteData";

interface PricingPlansProps {
  showHeading?: boolean;
}

export default function PricingPlans({ showHeading = true }: PricingPlansProps) {
  return (
    <section id="pricing" className="py-20 bg-card">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    {showHeading && (
      <div className="mb-16 text-center">
        <h2 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
          Planes de membresía
        </h2>

        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
          Elegí el plan que mejor se adapte a tus objetivos y a tu proceso fitness.
        </p>
      </div>
    )}

    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
      {pricingPlans.map((plan) => (
        <div
          key={plan.name}
          className={`rounded-xl border-2 bg-background p-8 transition-all hover:border-primary ${
            plan.popular
              ? "scale-105 border-primary shadow-lg shadow-primary/20"
              : "border-border"
          }`}
        >
          {plan.popular && (
            <div className="mb-4 inline-block rounded-full bg-primary px-4 py-1 text-sm font-bold text-primary-foreground">
              Más elegido
            </div>
          )}

          <h3 className="mb-2 text-2xl font-bold text-foreground">
            {plan.name}
          </h3>

          <div className="mb-6">
            <span className="text-4xl font-bold text-foreground">
              {plan.price}
            </span>
            <span className="text-muted-foreground">{plan.period}</span>
          </div>

          <ul className="mb-8 space-y-4">
            {plan.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 text-muted-foreground"
              >
                <i className="ri-checkbox-circle-fill mt-0.5 shrink-0 text-xl text-primary" />
                <span className="leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>

          <a
            href="/contact"
            className={`flex w-full items-center justify-center gap-3 rounded-lg px-8 py-4 text-lg font-bold transition-all ${
              plan.popular
                ? "bg-primary text-primary-foreground hover:bg-[#86c312]"
                : "border border-border bg-card text-foreground hover:bg-secondary"
            }`}
          >
            Empezar ahora
            <i className="ri-arrow-right-line" />
          </a>
        </div>
      ))}
    </div>
  </div>
</section>
  );
}
