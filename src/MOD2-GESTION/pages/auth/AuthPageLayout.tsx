import React from "react";


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <div className="auth-page-shell relative min-h-screen overflow-hidden">
  {/* Fondo base con glow superior */}
  <div className="auth-page-radial-glow pointer-events-none absolute inset-0" />

  {/* Degradado general oscuro */}
  <div className="auth-page-dark-gradient pointer-events-none absolute inset-0" />

  {/* Patrón muy suave, casi invisible */}
  <div className="pointer-events-none absolute inset-0 opacity-[0.035]">
    <div className="background-dot-grid background-dot-grid--auth absolute inset-0" />
  </div>

  {/* Luces suaves laterales */}
  <div className="pointer-events-none absolute -left-40 top-24 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
  <div className="pointer-events-none absolute -right-40 bottom-24 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />

  {/* Glow central detrás del formulario */}
  <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.055] blur-[110px]" />

  {/* Contenido */}
  <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
    <div className="w-full max-w-md">
      {children}
    </div>
  </div>
</div>
  );
}
