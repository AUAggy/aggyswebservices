import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Category from "./pages/Category";
import ServiceDetail from "./pages/ServiceDetail";
import Terms from "./pages/Terms";
import License from "./pages/License";
import NotFound from "./pages/NotFound";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/category/:categorySlug" element={<Category />} />
    <Route path="/category/:categorySlug/:serviceSlug" element={<ServiceDetail />} />
    <Route path="/terms" element={<Terms />} />
    <Route path="/license" element={<License />} />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
