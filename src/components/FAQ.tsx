import { faqs } from "../data/siteData";

export default function FAQ() {
  return (
    <section id="faq" className="py-20 bg-slate-800">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            Preguntas frecuentes
          </h2>

          <p className="mx-auto max-w-2xl text-xl text-gray-300">
            Todo lo que necesitas saber sobre unirte a FitnessClubEvolution y comenzar tu viaje de fitness
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-xl border border-slate-700 bg-slate-900 transition-all hover:border-orange-500"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                <h3 className="pr-4 text-xl font-bold text-white">
                  {faq.question}
                </h3>

                <i className="ri-arrow-down-s-line shrink-0 text-2xl text-orange-500 transition-transform group-open:rotate-180" />
              </summary>

              <div className="px-6 pb-6">
                <p className="leading-relaxed text-gray-300">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="mb-4 text-gray-400">¿Todavía tienes preguntas?</p>

          <a
            href="/contact"
            className="inline-flex items-center gap-3 rounded-lg bg-orange-500 px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:bg-orange-600"
          >
            Contactar
            <i className="ri-arrow-right-line" />
          </a>
        </div>
      </div>
    </section>
  );
}
