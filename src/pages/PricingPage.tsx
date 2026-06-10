import Layout from "../layouts/Layout";
import PricingPlans from "../MOD1-CLIENTES/components/PricingPlans";
import { paymentOptions, pricingPlans, siteData } from "../MOD1-CLIENTES/data/siteData";

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
    return <i className="ri-checkbox-circle-fill text-primary text-xl"></i>;
  }

  if (value === "no") {
    return <i className="ri-close-circle-line text-muted-foreground/40 text-xl"></i>;
  }

  if (value === "Unlimited" || value === "Custom Plans") {
    return <span className="text-primary font-semibold">{value}</span>;
  }

  return <span className="text-muted-foreground text-sm">{value}</span>;
}

export default function PricingPage() {
  return (
    <Layout
      title={`Pricing - ${siteData.name}`}
      description="Choose the perfect membership plan for your fitness journey"
    >
      <section className="pt-32 pb-20 bg-gradient-to-br from-background via-card to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Precios de Membrecia
            </h1>

            <p className="text-xl text-muted-foreground">
              Precios flexibles para adaptarse a tus necesidades y objetivos de fitness
            </p>
          </div>
        </div>
      </section>

      <PricingPlans showHeading={false} />

      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-foreground mb-4 text-center">
            Comparacion de planes
          </h2>

          <p className="text-xl text-muted-foreground mb-12 text-center max-w-2xl mx-auto">
            Compara las características y beneficios de cada plan para encontrar el que mejor se adapte a ti
          </p>

          <div className="bg-background rounded-xl border border-border overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-foreground font-semibold">
                    Caracteristicas
                  </th>

                  {pricingPlans.map((plan) => (
                    <th
                      key={plan.name}
                      className="px-6 py-4 text-center text-foreground font-semibold"
                    >
                      {plan.name}

                      {plan.popular && (
                        <span className="block text-primary text-sm font-normal mt-1">
                          Mas Popular
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="text-muted-foreground">
                {comparisonRows.map((row) => (
                  <tr
                    key={row.feature}
                    className="border-b border-border/50 last:border-b-0"
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

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
            Opciones de pago y beneficios adicionales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            {paymentOptions.plans.map((plan) => (
              <div
                key={plan.type}
                className="bg-card p-6 rounded-xl border border-border text-center hover:border-primary transition-all"
              >
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {plan.type}
                </h3>

                <p className="text-muted-foreground leading-relaxed">
                  {plan.description}
                </p>
              </div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-card p-8 rounded-xl border border-border mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
                Metodos de pagos aceptados
              </h3>

              <div className="flex flex-wrap justify-center gap-4">
                {paymentOptions.methods.map((method) => (
                  <div
                    key={method}
                    className="bg-background px-6 py-3 rounded-lg border border-border"
                  >
                    <span className="text-muted-foreground font-medium">{method}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-primary/10 border border-primary/30 p-6 rounded-xl text-center">
                <i className="ri-shield-check-line text-4xl text-primary mb-4"></i>
                <h4 className="text-xl font-bold text-foreground mb-2">
                  Dinero retornado  de manera garantizada
                </h4>
                <p className="text-muted-foreground">{paymentOptions.guarantee}</p>
              </div>

              <div className="bg-primary/10 border border-primary/30 p-6 rounded-xl text-center">
                <i className="ri-gift-line text-4xl text-primary mb-4"></i>
                <h4 className="text-xl font-bold text-foreground mb-2">
                  Dia de prueba gratis
                </h4>
                <p className="text-muted-foreground">{paymentOptions.trial}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
            Preguntas frecuentes y contacto
          </h2>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-background p-6 rounded-xl border border-border hover:border-primary transition-all">
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <i className="ri-question-line text-primary"></i>
                Puedo cancelar mi membresia en cualquier momento?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Si, puedes cancelar tu membresia en cualquier momento a traves de tu cuenta en linea o contactando a nuestro equipo de soporte. No hay cargos por cancelacion.
              </p>
            </div>

            <div className="bg-background p-6 rounded-xl border border-border hover:border-primary transition-all">
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <i className="ri-question-line text-primary"></i>
                Ofrecen periodos de prueba?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                ¡Si! Ofrecemos un periodo de prueba gratuito de 7 días para nuevos miembros. Ven y experimenta todo lo que tenemos para ofrecer.
              </p>
            </div>

            <div className="bg-background p-6 rounded-xl border border-border hover:border-primary transition-all">
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <i className="ri-question-line text-primary"></i>
                ¿Incluyen sesiones de entrenamiento personal?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Las sesiones de entrenamiento personal están incluidas en los planes Premium y Elite.
                Los miembros básicos pueden comprar sesiones por separado.
              </p>
            </div>

            <div className="bg-background p-6 rounded-xl border border-border hover:border-primary transition-all">
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <i className="ri-question-line text-primary"></i>
                ¿Qué métodos de pago aceptan?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Aceptamos todas las tarjetas de crédito principales, tarjetas de débito y transferencias bancarias.
                Los pagos mensuales se procesan automáticamente.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-primary to-[#86c312]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            ¿Listo para comenzar?
          </h2>

          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Contáctanos hoy para programar una visita y comenzar tu viaje fitness
          </p>

          <a
            href="/contact"
            className="inline-flex items-center justify-center gap-3 bg-background text-primary hover:bg-card px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Contactanos
            <i className="ri-arrow-right-line"></i>
          </a>
        </div>
      </section>
    </Layout>
  );
}