import type { FormEvent } from "react";

export default function ContactForm() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Más adelante acá conectamos el formulario con  backend/API.
    console.log("Formulario enviado");
  };

  return (
   <form
  onSubmit={handleSubmit}
  className="space-y-6 rounded-2xl border border-border bg-background p-5 sm:p-8"
>
  <div>
    <label htmlFor="name" className="mb-2 block font-semibold text-foreground">
      Nombre completo
    </label>

    <input
      type="text"
      id="name"
      name="name"
      required
      className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder-muted-foreground/60 transition-colors focus:border-primary focus:outline-none"
      placeholder="Juan Pérez"
    />
  </div>

  <div>
    <label htmlFor="email" className="mb-2 block font-semibold text-foreground">
      Dirección de email
    </label>

    <input
      type="email"
      id="email"
      name="email"
      required
      className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder-muted-foreground/60 transition-colors focus:border-primary focus:outline-none"
      placeholder="juan@example.com"
    />
  </div>

  <div>
    <label htmlFor="phone" className="mb-2 block font-semibold text-foreground">
      Número telefónico
    </label>

    <input
      type="tel"
      id="phone"
      name="phone"
      className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder-muted-foreground/60 transition-colors focus:border-primary focus:outline-none"
      placeholder="+598 99 123 456"
    />
  </div>

  <div>
    <label
      htmlFor="message"
      className="mb-2 block font-semibold text-foreground"
    >
      Mensaje
    </label>

    <textarea
      id="message"
      name="message"
      rows={5}
      required
      className="w-full resize-none rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder-muted-foreground/60 transition-colors focus:border-primary focus:outline-none"
      placeholder="Contanos cuáles son tus objetivos fitness..."
    />
  </div>

  <button
    type="submit"
    className="flex w-full items-center justify-center gap-3 rounded-lg bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-[#86c312]"
  >
    Enviar mensaje
    <i className="ri-send-plane-line" />
  </button>
</form>
  );
}
