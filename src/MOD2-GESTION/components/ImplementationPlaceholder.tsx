type ImplementationPlaceholderProps = {
  title: string;
};

export default function ImplementationPlaceholder({
  title,
}: ImplementationPlaceholderProps) {
  return (
    <div>
      <div className="mb-9">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-lime-400">
          Panel de administración
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
      </div>

      <section className="flex min-h-72 items-center justify-center rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 text-center shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-9">
        <div>
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-lime-400/15 text-lime-400">
            <i className="ri-tools-line text-3xl" />
          </div>
          <p className="text-xl font-semibold text-white">
            Implementación a futuro
          </p>
        </div>
      </section>
    </div>
  );
}
