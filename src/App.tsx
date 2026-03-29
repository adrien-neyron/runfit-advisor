import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Questionnaire from "./pages/Questionnaire";
import Results from "./pages/Results";
import ProductDetail from "./pages/ProductDetail";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import CookieBanner from "./components/CookieBanner";
import ShoeCatalog from "./pages/ShoeCatalog";
import ShoeDetail from "./pages/ShoeDetail";
import AdminImages from "./pages/AdminImages";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/questionnaire" element={<Questionnaire />} />
              <Route path="/resultats" element={<Results />} />
              <Route path="/produit/:id" element={<ProductDetail />} />
              <Route path="/shoes" element={<ShoeCatalog />} />
              <Route path="/shoes/:slug" element={<ShoeDetail />} />
              <Route path="/confidentialite" element={<PrivacyPolicy />} />
              <Route path="/admin/images" element={<AdminImages />} />
              <Route path="/connexion" element={<Auth />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <CookieBanner />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
