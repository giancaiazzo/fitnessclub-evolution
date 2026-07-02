import { useState } from "react";
import { Link } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../icons";

import Input from "../form/input/InputField";
import logofit from "../icons/logofit.png";
import Button from "../ui/button/Button";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
   <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#080b08] px-4 py-8">
  {/* Fondo general integrado */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(159,220,26,0.16),transparent_34%),linear-gradient(180deg,#0b100b_0%,#070907_45%,#050605_100%)]" />

  {/* Glow muy suave detrás del login */}
  <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-400/5 blur-3xl" />

  <div className="relative z-10 w-full max-w-md">
    <Link
      to="/"
      className="mb-7 inline-flex items-center text-sm text-gray-400 transition-colors hover:text-lime-300"
    >
      <ChevronLeftIcon className="size-5" />
      Volver a la página principal
    </Link>

    <div className="rounded-[2rem] border border-white/[0.06] bg-white/[0.025] px-7 py-8 backdrop-blur-md">
      {/* Logo más integrado, sin caja negra fuerte */}
      <div className="mb-8 flex justify-center">
        <img
          src={logofit}
          alt="Fit Evolution"
          className="w-52 object-contain drop-shadow-[0_0_28px_rgba(159,220,26,0.22)]"
        />
      </div>

      <div className="mb-7 text-center">
        <h1 className="mb-2 text-2xl font-semibold text-white">
          Iniciar sesión
        </h1>

        <p className="text-sm text-gray-400">
          Ingresa tu usuario y contraseña para acceder al sistema.
        </p>
      </div>

      <form>
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Email <span className="text-lime-400">*</span>
            </label>

            <Input
              placeholder="info@gmail.com"
              className="h-12 rounded-xl border-white/10 bg-black/25 text-white placeholder:text-gray-500 focus:border-lime-400/60 focus:ring-lime-400/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Contraseña <span className="text-lime-400">*</span>
            </label>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                className="h-12 rounded-xl border-white/10 bg-black/25 pr-12 text-white placeholder:text-gray-500 focus:border-lime-400/60 focus:ring-lime-400/20"
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? (
                  <EyeIcon className="size-5 fill-gray-400 hover:fill-lime-400" />
                ) : (
                  <EyeCloseIcon className="size-5 fill-gray-400 hover:fill-lime-400" />
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className="size-4 rounded border-white/20 bg-black/30 accent-lime-400"
              />

              <span className="text-sm text-gray-400">
                Mantenerme conectado
              </span>
            </label>

            <Link
              to="/reset-password"
              className="text-sm font-medium text-lime-400 transition-colors hover:text-lime-300"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button
            className="h-12 w-full rounded-xl bg-lime-400 font-semibold text-black transition-all hover:bg-lime-300 hover:shadow-[0_0_24px_rgba(159,220,26,0.28)]"
            size="sm"
          >
            Iniciar sesión
          </Button>
        </div>
      </form>
    </div>
  </div>
</div>

  );
}
