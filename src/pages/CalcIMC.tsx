import { useState } from "react";
import Layout from "../layouts/Layout";
import { siteData } from "../MOD1-CLIENTES/data/siteData";

export default function CalcIMC() {
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [resultado, setResultado] = useState<number | null>(null);

  function calcularIMC() {
    const pesoNumero = Number(peso);
    const alturaNumero = Number(altura);

    if (!pesoNumero || !alturaNumero || pesoNumero <= 0 || alturaNumero <= 0) {
      setResultado(null);
      return;
    }

    const imc = pesoNumero / (alturaNumero * alturaNumero);
    setResultado(Number(imc.toFixed(1)));
  }

  function obtenerCategoria(imc: number) {
    if (imc < 18.5) return "Bajo peso";
    if (imc < 25) return "Peso normal";
    if (imc < 30) return "Sobrepeso";
    return "Obesidad";
  }

  return (
    <Layout
      title={`Calculadora IMC - ${siteData.name}`}
      description="Calculá tu Índice de Masa Corporal de forma rápida y sencilla"
    >
      <section className="pt-32 pb-20 bg-background">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-card border border-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-foreground mb-4 text-center">
              Calculadora de IMC
            </h2>

            <p className="text-muted-foreground text-center mb-8">
              Ingresá tu peso y altura para conocer tu Índice de Masa Corporal.
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Peso en kg
                </label>

                <input
                  type="number"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  placeholder="Ej: 80"
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Altura en metros
                </label>

                <input
                  type="number"
                  value={altura}
                  onChange={(e) => setAltura(e.target.value)}
                  placeholder="Ej: 1.75"
                  step="0.01"
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
                />
              </div>

              <button
                type="button"
                onClick={calcularIMC}
                className="w-full rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground transition-all hover:bg-[#86c312]"
              >
                Calcular IMC
              </button>

              {resultado !== null && (
                <div className="mt-6 rounded-xl border border-primary/30 bg-primary/10 p-6 text-center">
                  <p className="text-muted-foreground mb-2">Tu IMC es</p>

                  <p className="text-4xl font-black text-primary mb-2">
                    {resultado}
                  </p>

                  <p className="text-foreground font-semibold">
                    Categoría: {obtenerCategoria(resultado)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}