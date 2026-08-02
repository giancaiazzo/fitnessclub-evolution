import { Link } from "react-router-dom";
import { navigation, siteData, socialLinks } from "../data/siteData";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const publicNavigation = navigation.filter((item) => item.href !== "/SignIn");

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="min-w-0 lg:col-span-2">
            <Link
              to="/"
              className="inline-block max-w-full break-words font-heading text-2xl font-black tracking-tight"
            >
              <span className="text-foreground">FitnessClub</span>
              <span className="text-primary">Evolution</span>
            </Link>

            <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
              Un espacio de entrenamiento y bienestar en Salto, pensado para
              acompañarte desde tu primer día.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {socialLinks.map((social) => {
                const socialUrl =
                  siteData.social[social.name as keyof typeof siteData.social];

                return (
                  <a
                    key={social.name}
                    href={socialUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-xl text-muted-foreground transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <i className={social.icon} aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold text-foreground">Navegación</h2>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:text-base md:grid-cols-1">
              {publicNavigation.map((item) => (
                <li key={item.href} className="min-w-0">
                  <Link
                    to={item.href}
                    className="break-words text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <h2 className="mb-4 text-lg font-bold text-foreground">Contacto</h2>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start gap-3">
                <i className="ri-map-pin-line mt-1 shrink-0 text-primary" aria-hidden="true" />
                <span>{siteData.address}</span>
              </li>
              <li className="flex min-w-0 items-start gap-3">
                <i className="ri-phone-line mt-1 shrink-0 text-primary" aria-hidden="true" />
                <a
                  href={`tel:${siteData.phone}`}
                  className="min-w-0 break-words transition-colors hover:text-primary"
                >
                  {siteData.phone}
                </a>
              </li>
              <li className="flex min-w-0 items-start gap-3">
                <i className="ri-mail-line mt-1 shrink-0 text-primary" aria-hidden="true" />
                <a
                  href={`mailto:${siteData.email}`}
                  className="min-w-0 break-all transition-colors hover:text-primary"
                >
                  {siteData.email}
                </a>
              </li>
            </ul>

            <Link
              to="/SignIn"
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-primary/35 px-4 py-2.5 font-bold text-primary transition hover:bg-primary hover:text-primary-foreground"
            >
              Acceso administrativo
              <i className="ri-login-box-line" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground/70 sm:text-left">
          © {currentYear} {siteData.name}. Derechos reservados.
        </div>
      </div>
    </footer>
  );
}
