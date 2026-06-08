
import { navigation, siteData, socialLinks } from "../data/siteData";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
      <div className="md:col-span-2">
        <a
          href="/"
          className="text-2xl font-bold text-primary font-heading tracking-tight"
        >
          {siteData.name}
        </a>

        <p className="text-muted-foreground mt-4 max-w-md leading-relaxed">
          {siteData.description}
        </p>

        <div className="flex items-center gap-4 mt-6">
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
                rel="noreferrer"
                aria-label={social.label}
                className="w-10 h-10 rounded-lg bg-card hover:bg-primary text-muted-foreground hover:text-primary-foreground flex items-center justify-center transition-colors"
              >
                <i className={`${social.icon} text-xl`}></i>
              </a>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-foreground font-bold text-lg mb-4">
          Navegación
        </h3>

        <ul className="space-y-3">
          {navigation.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-foreground font-bold text-lg mb-4">
          Contacto
        </h3>

        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-3">
            <i className="ri-map-pin-line text-primary mt-1"></i>
            <span>{siteData.address}</span>
          </li>

          <li className="flex items-center gap-3">
            <i className="ri-phone-line text-primary"></i>
            <a
              href={`tel:${siteData.phone}`}
              className="hover:text-primary transition-colors"
            >
              {siteData.phone}
            </a>
          </li>

          <li className="flex items-center gap-3">
            <i className="ri-mail-line text-primary"></i>
            <a
              href={`mailto:${siteData.email}`}
              className="hover:text-primary transition-colors"
            >
              {siteData.email}
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <p className="text-muted-foreground/70 text-sm">
        © {currentYear} {siteData.name}. Derechos reservados.
      </p>

      <div className="flex items-center gap-6 text-sm">
        <a
          href="/privacy"
          className="text-muted-foreground/70 hover:text-primary transition-colors"
        >
          Política de privacidad
        </a>

        <a
          href="/terms"
          className="text-muted-foreground/70 hover:text-primary transition-colors"
        >
          Términos de servicio
        </a>
      </div>
    </div>
  </div>
</footer>
  );
}
