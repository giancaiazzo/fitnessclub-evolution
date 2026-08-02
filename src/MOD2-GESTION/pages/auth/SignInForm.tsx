import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import { useAuth } from "../../context/auth-context";

import Input from "../../form/input/InputField";
import logofit from "../../icons/logofit.png";
import Button from "../../ui/button/Button";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mantenerSesion, setMantenerSesion] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setEnviando(true);

    try {
      await login({
        nombreUsuario,
        contrasena,
        mantenerSesion,
      });

      const destino =
        (location.state as { from?: string } | null)?.from || "/gestion";
      navigate(destino, { replace: true });
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "No fue posible iniciar sesión.",
      );
    } finally {
      setEnviando(false);
    }
  };

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

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Usuario <span className="text-lime-400">*</span>
            </label>

            <Input
              name="nombreUsuario"
              placeholder="Ingresa tu usuario"
              value={nombreUsuario}
              onChange={(event) => setNombreUsuario(event.target.value)}
              autoComplete="username"
              required
              disabled={enviando}
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
                name="contrasena"
                placeholder="Ingresa tu contraseña"
                value={contrasena}
                onChange={(event) => setContrasena(event.target.value)}
                autoComplete="current-password"
                required
                disabled={enviando}
                className="h-12 rounded-xl border-white/10 bg-black/25 pr-12 text-white placeholder:text-gray-500 focus:border-lime-400/60 focus:ring-lime-400/20"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? (
                  <EyeIcon className="size-5 fill-gray-400 hover:fill-lime-400" />
                ) : (
                    <EyeCloseIcon className="size-5 fill-gray-400 hover:fill-lime-400" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={mantenerSesion}
                onChange={(event) => setMantenerSesion(event.target.checked)}
                disabled={enviando}
                className="size-4 rounded border-white/20 bg-black/30 accent-lime-400"
              />

              <span className="text-sm text-gray-400">
                Mantenerme conectado
              </span>
            </label>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={enviando}
            className="h-12 w-full rounded-xl bg-lime-400 font-semibold text-black transition-all hover:bg-lime-300 hover:shadow-[0_0_24px_rgba(159,220,26,0.28)]"
            size="sm"
          >
            {enviando ? "Validando..." : "Iniciar sesión"}
          </Button>
        </div>
      </form>
    </div>
  </div>
</div>

  );
}
