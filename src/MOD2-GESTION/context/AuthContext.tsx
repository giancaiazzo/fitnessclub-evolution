import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  cerrarSesion,
  iniciarSesion,
  obtenerSesion,
  type Credenciales,
  type SesionAdministrador,
} from "../services/auth";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<SesionAdministrador | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    obtenerSesion().then((sesion) => {
      if (activo) {
        setUsuario(sesion);
        setCargando(false);
      }
    });

    return () => {
      activo = false;
    };
  }, []);

  const login = useCallback(async (credenciales: Credenciales) => {
    const sesion = await iniciarSesion(credenciales);
    setUsuario(sesion);
    return sesion;
  }, []);

  const logout = useCallback(async () => {
    await cerrarSesion();
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
