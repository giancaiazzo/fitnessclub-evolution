import { faqs } from "../data/siteData";
import { Link } from "react-router-dom";

export default function FAQ() {
  return (
    <section id="faq" className="bg-card py-16 sm:py-20">
  <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
    <div className="mb-10 text-center sm:mb-14">
      <h2 className="mb-4 text-3xl font-black text-foreground sm:text-4xl md:text-5xl">
        Preguntas frecuentes
      </h2>

      <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
        Todo lo que necesitás saber para unirte a FitnessClubEvolution y comenzar tu proceso fitness.
      </p>
    </div>

    <div className="space-y-4">
      {faqs.map((faq) => (
        <details
          key={faq.question}
          className="group rounded-xl border border-border bg-background transition-all hover:border-primary"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between p-5 sm:p-6">
            <h3 className="pr-4 text-lg font-bold text-foreground sm:text-xl">
              {faq.question}
            </h3>

            <i className="ri-arrow-down-s-line shrink-0 text-2xl text-primary transition-transform group-open:rotate-180" />
          </summary>

          <div className="px-5 pb-5 sm:px-6 sm:pb-6">
            <p className="leading-relaxed text-muted-foreground">
              {faq.answer}
            </p>
          </div>
        </details>
      ))}
    </div>

    <div className="mt-12 text-center">
      <p className="mb-4 text-muted-foreground">
        ¿Todavía tenés preguntas?
      </p>

      <Link
        to="/contact"
        className="inline-flex items-center gap-3 rounded-lg bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-[#86c312]"
      >
        Contactanos
        <i className="ri-arrow-right-line" />
      </Link>
    </div>
  </div>
</section>
  );
}
