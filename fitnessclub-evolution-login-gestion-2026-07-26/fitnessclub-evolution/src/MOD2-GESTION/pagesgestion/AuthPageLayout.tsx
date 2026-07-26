import React from "react";


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <div className="relative min-h-screen overflow-hidden bg-[#070907]">
  {/* Fondo base con glow superior */}
  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.16),transparent_38%)]" />

  {/* Degradado general oscuro */}
  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#0c120c_0%,#070907_45%,#050605_100%)]" />

  {/* Patrón muy suave, casi invisible */}
  <div className="pointer-events-none absolute inset-0 opacity-[0.035]">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage:
          "radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)",
        backgroundSize: "38px 38px",
      }}
    />
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
