import { pricingPlans } from "../data/siteData";
import { Link } from "react-router-dom";

interface PricingPlansProps {
  showHeading?: boolean;
}

export default function PricingPlans({ showHeading = true }: PricingPlansProps) {
  return (
    <section id="pricing" className="bg-card py-16 sm:py-20">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    {showHeading && (
      <div className="mb-10 text-center sm:mb-14">
        <h2 className="mb-4 text-3xl font-black text-foreground sm:text-4xl md:text-5xl">
          Planes de membresía
        </h2>

        <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Elegí el plan que mejor se adapte a tus objetivos y a tu proceso fitness.
        </p>
      </div>
    )}

    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
      {pricingPlans.map((plan) => (
        <div
          key={plan.name}
          className={`flex min-w-0 flex-col rounded-2xl border-2 bg-background p-6 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/10 lg:p-8 ${
            plan.popular
              ? "border-primary shadow-lg shadow-primary/20"
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

          <ul className="mb-8 flex-1 space-y-4">
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

          <Link
            to="/contact"
            className={`flex w-full items-center justify-center gap-3 rounded-lg px-8 py-4 text-lg font-bold transition-all ${
              plan.popular
                ? "bg-primary text-primary-foreground hover:bg-[#86c312]"
                : "border border-border bg-card text-foreground hover:bg-secondary"
            }`}
          >
            Empezar ahora
            <i className="ri-arrow-right-line" />
          </Link>
        </div>
      ))}
    </div>
  </div>
</section>
  );
}
