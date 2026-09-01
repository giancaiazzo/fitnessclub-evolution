import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Input from "../../form/input/InputField";
import logofit from "../../icons/logofit.png";
import Button from "../../ui/button/Button";
import {
  confirmarRecuperacion,
  solicitarRecuperacion,
} from "../../services/auth";
import AuthLayout from "./AuthPageLayout";

type Paso = "correo" | "codigo" | "completado";

export default function PasswordRecovery() {
  const [paso, setPaso] = useState<Paso>("correo");
  const [correoElectronico, setCorreoElectronico] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const solicitarCodigo = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setError("");
    setMensaje("");
    setEnviando(true);

    try {
      const correo = correoElectronico.trim().toLowerCase();
      const respuesta = await solicitarRecuperacion(correo);
      setCorreoElectronico(correo);
      setMensaje(respuesta);
      setPaso("codigo");
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No fue posible solicitar la recuperación.",
      );
    } finally {
      setEnviando(false);
    }
  };

  const cambiarContrasena = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(codigo)) {
      setError("Ingresá el código de seis números que recibiste por correo.");
      return;
    }

    if (nuevaContrasena.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (nuevaContrasena !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setEnviando(true);
    try {
      await confirmarRecuperacion({
        correoElectronico,
        codigo,
        nuevaContrasena,
      });
      setPaso("completado");
      setMensaje("");
      setCodigo("");
      setNuevaContrasena("");
      setConfirmacion("");
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No fue posible cambiar la contraseña.",
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full">
        <Link
          to="/SignIn"
          className="mb-7 inline-flex items-center text-sm text-gray-400 transition-colors hover:text-lime-300"
        >
          <ChevronLeftIcon className="size-5" />
          Volver al inicio de sesión
        </Link>

        <div className="rounded-[2rem] border border-white/[0.06] bg-white/[0.025] px-7 py-8 backdrop-blur-md">
          <div className="mb-7 flex justify-center">
            <img
              src={logofit}
              alt="FitnessClubEvolution"
              className="w-52 object-contain drop-shadow-[0_0_28px_rgba(159,220,26,0.22)]"
            />
          </div>

          {paso === "completado" ? (
            <div className="text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-lime-400/30 bg-lime-400/10 text-3xl text-lime-400">
                <i className="ri-check-line" aria-hidden="true" />
              </div>
              <h1 className="mt-5 text-2xl font-semibold text-white">
                Contraseña actualizada
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Ya podés ingresar al sistema con tu nueva contraseña.
              </p>
              <Link
                to="/SignIn"
                className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-xl bg-lime-400 font-semibold text-black transition hover:bg-lime-300"
              >
                Ir al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-7 text-center">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-lime-400">
                  Paso {paso === "correo" ? "1 de 2" : "2 de 2"}
                </p>
                <h1 className="mb-2 text-2xl font-semibold text-white">
                  Recuperar contraseña
                </h1>
                <p className="text-sm leading-relaxed text-gray-400">
                  {paso === "correo"
                    ? "Ingresá el correo asociado a tu cuenta administrativa."
                    : "Ingresá el código recibido y elegí una contraseña nueva."}
                </p>
              </div>

              {paso === "correo" ? (
                <form onSubmit={solicitarCodigo}>
                  <label
                    htmlFor="correo-recuperacion"
                    className="mb-2 block text-sm font-medium text-gray-300"
                  >
                    Correo electrónico <span className="text-lime-400">*</span>
                  </label>
                  <Input
                    id="correo-recuperacion"
                    type="email"
                    name="correoElectronico"
                    placeholder="nombre@correo.com"
                    value={correoElectronico}
                    onChange={(event) => setCorreoElectronico(event.target.value)}
                    autoComplete="email"
                    required
                    disabled={enviando}
                    className="h-12 rounded-xl border-white/10 bg-black/25 text-white placeholder:text-gray-500 focus:border-lime-400/60 focus:ring-lime-400/20"
                  />

                  <EstadoFormulario error={error} mensaje={mensaje} />

                  <Button
                    type="submit"
                    disabled={enviando}
                    className="mt-6 h-12 w-full rounded-xl bg-lime-400 font-semibold text-black transition-all hover:bg-lime-300"
                    size="sm"
                  >
                    {enviando ? "Enviando..." : "Enviar código"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={cambiarContrasena}>
                  <div className="rounded-xl border border-lime-400/20 bg-lime-400/[0.07] px-4 py-3 text-sm leading-relaxed text-lime-100">
                    {mensaje}
                  </div>

                  <div className="mt-5">
                    <label
                      htmlFor="codigo-recuperacion"
                      className="mb-2 block text-sm font-medium text-gray-300"
                    >
                      Código de 6 números <span className="text-lime-400">*</span>
                    </label>
                    <input
                      id="codigo-recuperacion"
                      name="codigo"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={codigo}
                      onChange={(event) =>
                        setCodigo(event.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      required
                      disabled={enviando}
                      placeholder="000000"
                      className="h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-center text-xl font-bold tracking-[0.35em] text-white outline-none placeholder:text-gray-600 focus:border-lime-400/60 focus:ring-3 focus:ring-lime-400/20"
                    />
                  </div>

                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Nueva contraseña <span className="text-lime-400">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type={mostrarContrasena ? "text" : "password"}
                        name="nuevaContrasena"
                        placeholder="Mínimo 8 caracteres"
                        value={nuevaContrasena}
                        onChange={(event) => setNuevaContrasena(event.target.value)}
                        autoComplete="new-password"
                        required
                        disabled={enviando}
                        className="h-12 rounded-xl border-white/10 bg-black/25 pr-12 text-white placeholder:text-gray-500 focus:border-lime-400/60 focus:ring-lime-400/20"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarContrasena((visible) => !visible)}
                        className="absolute right-4 top-1/2 z-30 -translate-y-1/2"
                        aria-label={
                          mostrarContrasena
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                      >
                        {mostrarContrasena ? (
                          <EyeIcon className="size-5 fill-gray-400 hover:fill-lime-400" />
                        ) : (
                          <EyeCloseIcon className="size-5 fill-gray-400 hover:fill-lime-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Confirmar contraseña <span className="text-lime-400">*</span>
                    </label>
                    <Input
                      type={mostrarContrasena ? "text" : "password"}
                      name="confirmacion"
                      placeholder="Repetí la contraseña"
                      value={confirmacion}
                      onChange={(event) => setConfirmacion(event.target.value)}
                      autoComplete="new-password"
                      required
                      disabled={enviando}
                      className="h-12 rounded-xl border-white/10 bg-black/25 text-white placeholder:text-gray-500 focus:border-lime-400/60 focus:ring-lime-400/20"
                    />
                  </div>

                  <EstadoFormulario error={error} />

                  <Button
                    type="submit"
                    disabled={enviando}
                    className="mt-6 h-12 w-full rounded-xl bg-lime-400 font-semibold text-black transition-all hover:bg-lime-300"
                    size="sm"
                  >
                    {enviando ? "Actualizando..." : "Cambiar contraseña"}
                  </Button>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
                    <button
                      type="button"
                      onClick={() => void solicitarCodigo()}
                      disabled={enviando}
                      className="text-lime-400 transition hover:text-lime-300 disabled:opacity-50"
                    >
                      Reenviar código
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaso("correo");
                        setCodigo("");
                        setError("");
                        setMensaje("");
                      }}
                      disabled={enviando}
                      className="text-gray-400 transition hover:text-white disabled:opacity-50"
                    >
                      Cambiar correo
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}

function EstadoFormulario({
  error,
  mensaje,
}: {
  error: string;
  mensaje?: string;
}) {
  if (!error && !mensaje) return null;

  return (
    <div
      role={error ? "alert" : "status"}
      aria-live="polite"
      className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
        error
          ? "border-red-400/25 bg-red-400/10 text-red-200"
          : "border-lime-400/20 bg-lime-400/[0.07] text-lime-100"
      }`}
    >
      {error || mensaje}
    </div>
  );
}
