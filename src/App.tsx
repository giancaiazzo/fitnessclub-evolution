import { HashRouter, Routes, Route } from "react-router-dom";
import TourVirtual from "./pages/TourVirtual";
import Home from "./pages/Home";
import AboutPage from "./pages/AboutPage";
import ClassesPage from "./pages/ClassesPage";
import ContactPage from "./pages/ContactPage";
import PricingPage from "./pages/PricingPage";
import ServicesPage from "./pages/ServicesPage";
import SignIn from "./MOD2-GESTION/pages/auth/SignIn";
import PasswordRecovery from "./MOD2-GESTION/pages/auth/PasswordRecovery";
import GestionDashboard from "./MOD2-GESTION/pages/dashboard/GestionDashboard";
import IngresarClientePage from "./MOD2-GESTION/pages/clientes/IngresarClientePage";
import ListadoClientesPage from "./MOD2-GESTION/pages/clientes/ListadoClientesPage";
import IngresarEjercicioPage from "./MOD2-GESTION/pages/ejercicios/IngresarEjercicioPage";
import ListadoEjerciciosPage from "./MOD2-GESTION/pages/ejercicios/ListadoEjerciciosPage";
import IngresarRutinaPage from "./MOD2-GESTION/pages/rutinas/IngresarRutinaPage";
import ListadoRutinasPage from "./MOD2-GESTION/pages/rutinas/ListadoRutinasPage";
import IngresarServicioPage from "./MOD2-GESTION/pages/servicios/IngresarServicioPage";
import ListadoServiciosPage from "./MOD2-GESTION/pages/servicios/ListadoServiciosPage";
import RegistrarPagoPage from "./MOD2-GESTION/pages/pagos/RegistrarPagoPage";
import ProtectedRoute from "./MOD2-GESTION/components/ProtectedRoute";
import GestionLayout from "./MOD2-GESTION/layouts/GestionLayout";
import CalcIMC from "./pages/CalcIMC";
import NotFoundPage from "./pages/404";
import ExercisesPage from "./pages/ExercisesPage";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/classes" element={<ClassesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/exercises" element={<ExercisesPage />} />
        <Route path="/calc-imc" element={<CalcIMC />} />
        <Route path="/tour-virtual" element={<TourVirtual />} />
        <Route path="/SignIn" element={<SignIn />} />
        <Route path="/recuperar-contrasena" element={<PasswordRecovery />} />

        <Route
          path="/gestion"
          element={
            <ProtectedRoute>
              <GestionLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<GestionDashboard />} />
          <Route path="clientes/ingresar" element={<IngresarClientePage />} />
          <Route path="clientes/listado" element={<ListadoClientesPage />} />
          <Route path="ejercicios/ingresar" element={<IngresarEjercicioPage />} />
          <Route path="ejercicios/listado" element={<ListadoEjerciciosPage />} />
          <Route path="rutinas/ingresar" element={<IngresarRutinaPage />} />
          <Route path="rutinas/listado" element={<ListadoRutinasPage />} />
          <Route path="servicios/ingresar" element={<IngresarServicioPage />} />
          <Route path="servicios/listado" element={<ListadoServiciosPage />} />
          <Route path="pagos/registrar" element={<RegistrarPagoPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
