import { successStories } from "../data/siteData";

export default function SuccessStories() {
  return (
   <section id="success-stories" className="py-20 bg-card">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="mb-16 text-center">
      <h2 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
        Historias de éxito
      </h2>

      <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
        Transformaciones reales de miembros que lograron avanzar junto a nosotros.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      {successStories.map((story) => (
        <div
          key={story.name}
          className="overflow-hidden rounded-xl border border-border bg-background transition-all hover:border-primary"
        >
          <div className="grid grid-cols-2 gap-2 p-2">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
              <img
                src={story.beforeImage}
                alt={`${story.name} antes`}
                width={400}
                height={600}
                className="h-full w-full object-cover"
                loading="lazy"
              />

              <div className="absolute bottom-2 left-2 rounded bg-red-500/90 px-2 py-1 text-xs font-bold text-white">
                Antes
              </div>
            </div>

            <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
              <img
                src={story.afterImage}
                alt={`${story.name} después`}
                width={400}
                height={600}
                className="h-full w-full object-cover"
                loading="lazy"
              />

              <div className="absolute bottom-2 left-2 rounded bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
                Después
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {story.name}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {story.age} años • {story.duration}
                </p>
              </div>

              <div className="rounded-lg bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
                {story.result}
              </div>
            </div>

            <p className="leading-relaxed text-muted-foreground italic">
              “{story.story}”
            </p>
          </div>
        </div>
      ))}
    </div>

    <div className="mt-12 text-center">
      <a
        href="/contact"
        className="inline-flex items-center gap-3 rounded-lg bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-[#86c312]"
      >
        Comenzá tu proceso
        <i className="ri-arrow-right-line" />
      </a>
    </div>
  </div>
</section>
  );
}
