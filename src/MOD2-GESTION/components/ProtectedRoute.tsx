import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/auth-context";

export default function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070907]">
        <div className="flex items-center gap-3 text-sm font-medium text-gray-300">
          <span className="size-5 animate-spin rounded-full border-2 border-lime-400/30 border-t-lime-400" />
          Verificando sesión...
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <Navigate
        to="/SignIn"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}
