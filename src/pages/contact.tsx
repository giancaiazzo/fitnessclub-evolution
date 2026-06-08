import Layout from "../layouts/Layout";
import ContactForm from "../components/ContactForm";
import { siteData, socialLinks, contactInfo } from "../data/siteData";
import mapImage from "../assets/photo-1517487881594-2787fef5ebf7.jpg";

export default function ContactPage() {
  return (
    <Layout
      title={`Contacto - ${siteData.name}`}
      description="Ponte en contacto con nosotros para comenzar tu viaje fitness"
    >
      {/* Sección principal */}
      <section className="pt-32 pb-20 bg-linear-to-br from-background via-card to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Contactanos
            </h1>

            <p className="text-xl text-muted-foreground">
              Estamos aquí para ayudarte en tu viaje fitness. ¡Ponte en contacto con nosotros hoy mismo!
            </p>
          </div>
        </div>
      </section>

      {/* Información de contacto y formulario */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Información de contacto */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">
                Ponete en contacto
              </h2>

              <div className="space-y-6">
                {contactInfo.map((info) => (
                  <div key={info.title} className="flex items-start gap-4">
                    <div className="bg-primary p-4 rounded-lg shrink-0">
                      <i
                        className={`${info.icon} text-2xl text-primary-foreground`}
                      ></i>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {info.title}
                      </h3>

                      {Array.isArray(info.content) ? (
                        info.content.map((line) => (
                          <p
                            key={`${info.title}-${line}`}
                            className="text-muted-foreground leading-relaxed"
                          >
                            {line}
                          </p>
                        ))
                      ) : info.link ? (
                        <a
                          href={info.link}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {info.content}
                        </a>
                      ) : (
                        <p className="text-muted-foreground leading-relaxed">
                          {info.content}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Redes sociales */}
              <div className="mt-10">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Seguinos en redes sociales
                </h3>

                <div className="flex space-x-4">
                  {socialLinks.map((social) => {
                    const socialUrl =
                      siteData.social[
                        social.name as keyof typeof siteData.social
                      ];

                    return (
                      <a
                        key={social.name}
                        href={socialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-secondary hover:bg-primary rounded-lg flex items-center justify-center transition-all"
                        aria-label={social.label}
                      >
                        <i className={`${social.icon} text-xl text-foreground`}></i>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Formulario de contacto */}
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Sección de expectativas de visita */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-foreground mb-4 text-center">
            ¿Qué esperar cuando nos visitás?
          </h2>

          <p className="text-xl text-muted-foreground mb-12 text-center max-w-2xl mx-auto">
            Tu primera visita es importante para nosotros. Esto es lo que podés esperar.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            <div className="bg-card p-6 rounded-xl border border-border text-center hover:border-primary transition-all">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="ri-user-search-line text-3xl text-primary"></i>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-3">
                Recorrido y consulta
              </h3>

              <p className="text-muted-foreground text-sm leading-relaxed">
                Te daremos un recorrido completo por nuestras instalaciones y conversaremos sobre tus objetivos fitness.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border text-center hover:border-primary transition-all">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="ri-group-line text-3xl text-primary"></i>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-3">
                Conocé a nuestro equipo
              </h3>

              <p className="text-muted-foreground text-sm leading-relaxed">
                Te presentaremos a nuestros entrenadores y al equipo que te acompañará durante tu proceso.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border text-center hover:border-primary transition-all">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="ri-file-list-3-line text-3xl text-primary"></i>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-3">
                Opciones de membresía
              </h3>

              <p className="text-muted-foreground text-sm leading-relaxed">
                Explorá nuestros planes flexibles, diseñados para adaptarse a tu estilo de vida y presupuesto.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de tiempo de respuesta */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-background p-8 rounded-xl border border-border">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="bg-primary/10 p-4 rounded-lg shrink-0">
                  <i className="ri-time-line text-4xl text-primary"></i>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    Tiempo de respuesta
                  </h3>

                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    Estamos comprometidos a responder todas las consultas de forma rápida y ordenada. Estos son nuestros tiempos estimados:
                  </p>

                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <i className="ri-checkbox-circle-fill text-primary text-xl mt-0.5"></i>
                      <div>
                        <span className="text-foreground font-semibold">
                          Consultas por email:
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          respondemos dentro de las 24 horas durante días hábiles.
                        </span>
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <i className="ri-checkbox-circle-fill text-primary text-xl mt-0.5"></i>
                      <div>
                        <span className="text-foreground font-semibold">
                          Llamadas telefónicas:
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          disponibles durante el horario de atención.
                        </span>
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <i className="ri-checkbox-circle-fill text-primary text-xl mt-0.5"></i>
                      <div>
                        <span className="text-foreground font-semibold">
                          Formularios enviados:
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          confirmación dentro de 2 horas y respuesta completa dentro de 24 horas.
                        </span>
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <i className="ri-checkbox-circle-fill text-primary text-xl mt-0.5"></i>
                      <div>
                        <span className="text-foreground font-semibold">
                          Asuntos urgentes:
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          comunicate directamente con nosotros para recibir asistencia inmediata.
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de ubicación */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
            Encontranos
          </h2>

          <div className="max-w-5xl mx-auto bg-card p-8 rounded-xl border border-border">
            <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center overflow-hidden relative">
              <img
                src={mapImage}
                alt="Ubicación del gimnasio"
                width={1200}
                height={600}
                className="w-full h-full object-cover opacity-50"
                loading="lazy"
              />

              <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                <div>
                  <i className="ri-map-pin-line text-5xl text-primary mb-4"></i>

                  <p className="text-muted-foreground text-lg">
                    La integración del mapa puede agregarse aquí, por ejemplo con Google Maps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}