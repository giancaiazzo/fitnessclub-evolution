import { useState } from "react";
import Layout from "../layouts/Layout";
import { siteData } from "../MOD1-CLIENTES/data/siteData";

export default function CalcIMC() {
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [resultado, setResultado] = useState<number | null>(null);
  const [error, setError] = useState("");

  function calcularIMC() {
    const pesoNumero = Number(peso);
    const alturaNumero = Number(altura);

    if (!pesoNumero || !alturaNumero || pesoNumero <= 0 || alturaNumero <= 0) {
      setResultado(null);
      setError("Ingresá un peso y una altura válidos para realizar el cálculo.");
      return;
    }

    const imc = pesoNumero / (alturaNumero * alturaNumero);
    setResultado(Number(imc.toFixed(1)));
    setError("");
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
      <section className="bg-background pb-16 pt-28 sm:pb-20 sm:pt-32">
        <div className="mx-auto max-w-xl px-4 sm:px-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xl shadow-black/20 sm:p-8">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl text-primary">
              <i className="ri-heart-pulse-line" aria-hidden="true" />
            </div>

            <h1 className="text-center text-3xl font-black text-foreground sm:text-4xl">
              Calculadora de IMC
            </h1>

            <p className="mb-8 mt-4 text-center text-muted-foreground">
              Ingresá tu peso y altura para conocer tu Índice de Masa Corporal.
            </p>

            <div className="space-y-5">
              <div>
                <label htmlFor="imc-peso" className="mb-2 block text-sm font-semibold text-foreground">
                  Peso en kg
                </label>

                <input
                  type="number"
                  id="imc-peso"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  placeholder="Ej: 80"
                  min="1"
                  inputMode="decimal"
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="imc-altura" className="mb-2 block text-sm font-semibold text-foreground">
                  Altura en metros
                </label>

                <input
                  type="number"
                  id="imc-altura"
                  value={altura}
                  onChange={(e) => setAltura(e.target.value)}
                  placeholder="Ej: 1.75"
                  step="0.01"
                  min="0.5"
                  max="2.5"
                  inputMode="decimal"
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

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-sm text-red-200"
                >
                  {error}
                </p>
              )}

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

              <p className="border-t border-border pt-5 text-center text-xs leading-relaxed text-muted-foreground">
                El resultado es orientativo y no sustituye una evaluación profesional.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
