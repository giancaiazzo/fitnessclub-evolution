import Layout from "../layouts/Layout";
import { Link } from "react-router-dom";
import PricingPlans from "../MOD1-CLIENTES/components/PricingPlans";
import { paymentOptions, pricingPlans, siteData } from "../MOD1-CLIENTES/data/siteData";

const comparisonRows = [
  {
    feature: "Acceso al gimnasio",
    values: ["incluido", "incluido", "incluido"],
  },
  {
    feature: "Acceso con horario extendido",
    values: ["no", "incluido", "incluido"],
  },
  {
    feature: "Clases grupales",
    values: ["no", "incluido", "incluido"],
  },
  {
    feature: "Entrenador personal",
    values: ["Solo consulta", "Consulta incluida", "Ilimitado"],
  },
  {
    feature: "Orientación nutricional",
    values: ["no", "incluido", "Planes personalizados"],
  },
  {
    feature: "Recuperación y bienestar",
    values: ["no", "no", "incluido"],
  },
  {
    feature: "Reserva prioritaria",
    values: ["no", "no", "incluido"],
  },
];

function renderComparisonValue(value: string) {
  if (value === "incluido") {
    return <i className="ri-checkbox-circle-fill text-primary text-xl"></i>;
  }

  if (value === "no") {
    return <i className="ri-close-circle-line text-muted-foreground/40 text-xl"></i>;
  }

  if (value === "Ilimitado" || value === "Planes personalizados") {
    return <span className="text-primary font-semibold">{value}</span>;
  }

  return <span className="text-muted-foreground text-sm">{value}</span>;
}

export default function PricingPage() {
  return (
    <Layout
      title={`Planes - ${siteData.name}`}
      description="Elegí el plan ideal para comenzar tu proceso de entrenamiento"
    >
      <section className="bg-gradient-to-br from-background via-card to-background pb-16 pt-28 sm:pb-20 sm:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-black text-foreground sm:text-5xl md:text-6xl">
              Planes y membresías
            </h1>

            <p className="mt-5 text-lg text-muted-foreground sm:text-xl">
              Opciones flexibles para adaptarse a tus necesidades, objetivos y ritmo de entrenamiento.
            </p>
          </div>
        </div>
      </section>

      <PricingPlans showHeading={false} />

      <section className="bg-card py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 text-center text-3xl font-black text-foreground sm:text-4xl">
            Comparación de planes
          </h2>

          <p className="mx-auto mb-8 max-w-2xl text-center text-lg text-muted-foreground sm:mb-12 sm:text-xl">
            Compará las características y beneficios de cada plan para encontrar el que mejor se adapte a vos.
          </p>

          <p className="mb-3 text-center text-sm text-muted-foreground sm:hidden">
            Deslizá horizontalmente para comparar todos los planes.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-border bg-background">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-foreground font-semibold">
                    Características
                  </th>

                  {pricingPlans.map((plan) => (
                    <th
                      key={plan.name}
                      className="px-6 py-4 text-center text-foreground font-semibold"
                    >
                      {plan.name}

                      {plan.popular && (
                        <span className="block text-primary text-sm font-normal mt-1">
                          Más popular
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

      <section className="bg-background py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-3xl font-black text-foreground sm:mb-12 sm:text-4xl">
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
                Métodos de pago aceptados
              </h3>

              <div className="flex flex-wrap justify-center gap-4">
                {paymentOptions.methods.map((method) => (
                  <div
                    key={method}
                    className="bg-background px-6 py-3 rounded-lg border border-border"
                  >
                    <span className="text-muted-foreground font-medium">
                      {method}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-primary/10 border border-primary/30 p-6 rounded-xl text-center">
                <i className="ri-shield-check-line text-4xl text-primary mb-4"></i>

                <h4 className="text-xl font-bold text-foreground mb-2">
                  Condiciones claras
                </h4>

                <p className="text-muted-foreground">
                  {paymentOptions.guarantee}
                </p>
              </div>

              <div className="bg-primary/10 border border-primary/30 p-6 rounded-xl text-center">
                <i className="ri-gift-line text-4xl text-primary mb-4"></i>

                <h4 className="text-xl font-bold text-foreground mb-2">
                  Consulta para nuevos clientes
                </h4>

                <p className="text-muted-foreground">
                  {paymentOptions.trial}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-3xl font-black text-foreground sm:mb-12 sm:text-4xl">
            Preguntas frecuentes y contacto
          </h2>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-background p-6 rounded-xl border border-border hover:border-primary transition-all">
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <i className="ri-question-line text-primary"></i>
                ¿Puedo cancelar mi membresía en cualquier momento?
              </h3>

              <p className="text-muted-foreground leading-relaxed">
                Sí, podés consultar las condiciones de cancelación o modificación de tu plan directamente con el gimnasio.
              </p>
            </div>

            <div className="bg-background p-6 rounded-xl border border-border hover:border-primary transition-all">
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <i className="ri-question-line text-primary"></i>
                ¿Ofrecen períodos de prueba?
              </h3>

              <p className="text-muted-foreground leading-relaxed">
                Sí, podés comunicarte con el gimnasio para consultar por clases de prueba, disponibilidad y condiciones para nuevos clientes.
              </p>
            </div>

            <div className="bg-background p-6 rounded-xl border border-border hover:border-primary transition-all">
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <i className="ri-question-line text-primary"></i>
                ¿Incluyen entrenamiento personalizado?
              </h3>

              <p className="text-muted-foreground leading-relaxed">
                Algunos planes pueden incluir seguimiento o entrenamiento personalizado. También podés consultar por opciones adaptadas a tus objetivos.
              </p>
            </div>

            <div className="bg-background p-6 rounded-xl border border-border hover:border-primary transition-all">
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <i className="ri-question-line text-primary"></i>
                ¿Qué métodos de pago aceptan?
              </h3>

              <p className="text-muted-foreground leading-relaxed">
                Se aceptan distintos métodos de pago según disponibilidad. Consultá directamente con el gimnasio para confirmar las opciones actuales.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary to-[#86c312] py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-primary-foreground sm:text-4xl md:text-5xl">
            ¿Listo para comenzar?
          </h2>

          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Contactanos hoy para consultar por planes, horarios y servicios disponibles.
          </p>

          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-3 bg-background text-primary hover:bg-card px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Contactanos
            <i className="ri-arrow-right-line"></i>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
