import { createContext, useContext } from "react";
import type {
  Credenciales,
  SesionAdministrador,
} from "../services/auth";

export type AuthContextValue = {
  usuario: SesionAdministrador | null;
  cargando: boolean;
  login: (credenciales: Credenciales) => Promise<SesionAdministrador>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  }

  return context;
}
