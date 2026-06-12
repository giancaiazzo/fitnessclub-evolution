import { useState } from "react";
import { Link } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../icons";

import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  return (
    <div className="flex flex-col flex-1">
  <div className="w-full max-w-md pt-10 mx-auto">
    <Link
      to="/"
      className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
    >
      <ChevronLeftIcon className="size-5" />
      Volver a la página principal
    </Link>
  </div>

  <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
    <div>
      <div className="mb-5 sm:mb-8">
        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
          Iniciar sesión
        </h1>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ingresa tu usuario y contraseña para iniciar sesión!
        </p>
      </div>

      <form>
        <div className="space-y-6">
          <div>
            
              Email <span className="text-error-500">*</span>{" "}
            
            <Input placeholder="info@gmail.com" />
          </div>

          <div>
            
              Contraseña <span className="text-error-500">*</span>{" "}
            

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox checked={isChecked} onChange={setIsChecked} />
              <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                Mantenerme conectado
              </span>
            </div>

            <Link
              to="/reset-password"
              className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <div>
            <Button className="w-full" size="sm">
              Iniciar sesión
            </Button>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>
  );
}
