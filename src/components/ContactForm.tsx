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
      className="space-y-6 rounded-xl border border-slate-700 bg-slate-900 p-8"
    >
      <div>
        <label htmlFor="name" className="mb-2 block font-semibold text-white">
          Nombre completo
        </label>

        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-orange-500 focus:outline-none"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block font-semibold text-white">
          Direccion de email
        </label>

        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-orange-500 focus:outline-none"
          placeholder="john@example.com"
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-2 block font-semibold text-white">
          Numero telefonico
        </label>

        <input
          type="tel"
          id="phone"
          name="phone"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-orange-500 focus:outline-none"
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-2 block font-semibold text-white"
        >
          Mensaje
        </label>

        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-orange-500 focus:outline-none"
          placeholder="Tell us about your fitness goals..."
        />
      </div>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-3 rounded-lg bg-orange-500 px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:bg-orange-600"
      >
        Enviar mensaje
        <i className="ri-send-plane-line" />
      </button>
    </form>
  );
}
