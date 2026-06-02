
import { navigation, siteData, socialLinks } from "../data/siteData";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <a
              href="/"
              className="text-2xl font-bold text-orange-500 font-heading tracking-tight"
            >
              {siteData.name}
            </a>

            <p className="text-gray-400 mt-4 max-w-md leading-relaxed">
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
                    className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-orange-500 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
                  >
                    <i className={`${social.icon} text-xl`}></i>
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Navegacion</h3>

            <ul className="space-y-3">
              {navigation.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contacto</h3>

            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-3">
                <i className="ri-map-pin-line text-orange-500 mt-1"></i>
                <span>{siteData.address}</span>
              </li>

              <li className="flex items-center gap-3">
                <i className="ri-phone-line text-orange-500"></i>
                <a
                  href={`tel:${siteData.phone}`}
                  className="hover:text-orange-500 transition-colors"
                >
                  {siteData.phone}
                </a>
              </li>

              <li className="flex items-center gap-3">
                <i className="ri-mail-line text-orange-500"></i>
                <a
                  href={`mailto:${siteData.email}`}
                  className="hover:text-orange-500 transition-colors"
                >
                  {siteData.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {currentYear} {siteData.name}. Derechos reservados.
          </p>

          <div className="flex items-center gap-6 text-sm">
            <a
              href="/privacy"
              className="text-gray-500 hover:text-orange-500 transition-colors"
            >
              Política de Privacidad
            </a>

            <a
              href="/terms"
              className="text-gray-500 hover:text-orange-500 transition-colors"
            >
              Terminos de servicio.
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
