import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import AboutPage from "./pages/AboutPage";
import ClassesPage from "./pages/ClassesPage";
import ContactPage from "./pages/ContactPage";
import PricingPage from "./pages/PricingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/classes" element={<ClassesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/pricing" element={<PricingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;