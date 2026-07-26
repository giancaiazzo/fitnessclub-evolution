import { HashRouter, Routes, Route } from "react-router-dom";
import TourVirtual from "./pages/TourVirtual";
import Home from "./pages/Home";
import AboutPage from "./pages/AboutPage";
import ClassesPage from "./pages/ClassesPage";
import ContactPage from "./pages/ContactPage";
import PricingPage from "./pages/PricingPage";
import SignIn from "./MOD2-GESTION/pagesgestion/SignIn";
import GestionDashboard from "./MOD2-GESTION/pagesgestion/GestionDashboard";
import ProtectedRoute from "./MOD2-GESTION/components/ProtectedRoute";
import CalcIMC from "./pages/CalcIMC";

function App() {
  return (
<HashRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/classes" element={<ClassesPage />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/pricing" element={<PricingPage />} />
    <Route path="/calc-imc" element={<CalcIMC />} />
    <Route path="/tour-virtual" element={<TourVirtual />} />
    <Route path="/SignIn" element={<SignIn />} />
    <Route
      path="/gestion"
      element={
        <ProtectedRoute>
          <GestionDashboard />
        </ProtectedRoute>
      }
    />
  </Routes>
</HashRouter>
  );
}

export default App;
