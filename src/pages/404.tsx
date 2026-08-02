import { Link } from "react-router-dom";
import Layout from "../layouts/Layout";
import { siteData } from "../MOD1-CLIENTES/data/siteData";

export default function NotFoundPage() {
  return (
    <Layout
      title={`Página no encontrada - ${siteData.name}`}
      description="La página solicitada no existe"
    >
      <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-card to-background px-4 pb-16 pt-28 sm:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-7xl font-black leading-none text-primary sm:text-9xl">
            404
          </p>
          <h1 className="mt-5 text-3xl font-black text-foreground sm:text-4xl md:text-5xl">
            Página no encontrada
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            La dirección que abriste no existe o fue modificada. Podés volver al
            inicio o comunicarte con el gimnasio.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 font-bold text-primary-foreground transition hover:bg-[#b8ef45]"
            >
              Volver al inicio
              <i className="ri-home-line" aria-hidden="true" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-primary px-7 py-3.5 font-bold text-primary transition hover:bg-primary hover:text-primary-foreground"
            >
              Contactanos
              <i className="ri-mail-line" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
