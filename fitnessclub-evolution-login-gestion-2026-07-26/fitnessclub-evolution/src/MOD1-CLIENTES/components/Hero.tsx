
import { siteData } from "../data/siteData";
import HeroImage from "../assets/photo-1534438327276-14e5300c3a48.jpg";

export default function Hero() {
  return (
   <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-background pt-20 overflow-hidden">
  {/* Patrón de fondo */}
  <div className="absolute inset-0 opacity-10">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage:
          "radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)",
        backgroundSize: "40px 40px",
      }}
    ></div>
  </div>

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Contenido de texto */}
      <div className="text-center lg:text-left">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
          {siteData.tagline}
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
          {siteData.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start mb-12">
          <a
            href="/contact"
            className="bg-primary hover:bg-[#86c312] text-primary-foreground px-8 py-4 rounded-lg font-bold text-lg transition-all transform inline-flex items-center justify-center gap-3"
          >
            Iniciá tu viaje
            <i className="ri-arrow-right-line"></i>
          </a>

          <a
            href="/about"
            className="bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 rounded-lg font-bold text-lg transition-all inline-flex items-center justify-center gap-3"
          >
            Conocé más
            <i className="ri-information-line"></i>
          </a>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0">
          <div className="text-center lg:text-left">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
              200+
            </div>
            <div className="text-muted-foreground text-sm md:text-base">
              Miembros activos
            </div>
          </div>

          <div className="text-center lg:text-left">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
              2+
            </div>
            <div className="text-muted-foreground text-sm md:text-base">
              Entrenadores expertos
            </div>
          </div>

          <div className="text-center lg:text-left">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
              24/7
            </div>
            <div className="text-muted-foreground text-sm md:text-base">
              Acceso 24/7
            </div>
          </div>
        </div>
      </div>

      {/* Imagen principal */}
      <div className="hidden lg:block">
        <div className="relative">
          <div className="aspect-square rounded-2xl overflow-hidden bg-card border-2 border-border shadow-2xl">
            <img
              src={HeroImage}
              alt="Entrenamiento fitness"
              width={800}
              height={800}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>

          <div className="absolute -bottom-6 -left-6 bg-primary p-6 rounded-xl shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-background rounded-lg flex items-center justify-center">
                <i className="ri-trophy-line text-2xl text-primary"></i>
              </div>

              <div>
                <div className="text-primary-foreground font-bold text-lg">
                  Premios al culturismo
                </div>
                <div className="text-primary-foreground/80 text-sm">
                  Tu gimnasio este 2027
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Indicador de scroll */}
  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden lg:block">
    <i className="ri-arrow-down-line text-2xl text-primary"></i>
  </div>
</section>
  );
}