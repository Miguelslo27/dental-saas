import { BrowserRouter, Routes, Route } from "react-router";
import { HomePage } from "./pages/HomePage";
import { PricingPage } from "./pages/PricingPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/precios" element={<PricingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
