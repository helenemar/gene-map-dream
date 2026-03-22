import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import ProtectedRoute from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import GenogramEditor from "./pages/GenogramEditor";
import DesignSystemPage from "./pages/DesignSystem";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import SharedGenogram from "./pages/SharedGenogram";
import SharedEditor from "./pages/SharedEditor";
import NotFound from "./pages/NotFound";
import Account from "./pages/Account";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import MobileBlocker from "./components/MobileBlocker";
import OAuthProxy from "./pages/OAuthProxy";

const queryClient = new QueryClient();

const App = () => {
  const isCustomDomainHost =
    typeof window !== "undefined" &&
    !window.location.hostname.endsWith("lovable.app") &&
    !window.location.hostname.endsWith("lovableproject.com");

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <MobileBlocker>
            <BrowserRouter>
              <Routes>
                {isCustomDomainHost && <Route path="/~oauth/*" element={<OAuthProxy />} />}
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<Navigate to="/" replace />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/editor" element={<ProtectedRoute><GenogramEditor /></ProtectedRoute>} />
                <Route path="/editor/:id" element={<ProtectedRoute><GenogramEditor /></ProtectedRoute>} />
                <Route path="/tree/:id" element={<ProtectedRoute><GenogramEditor /></ProtectedRoute>} />
                <Route path="/shared/:token" element={<SharedGenogram />} />
                <Route path="/shared-edit/:token" element={<SharedEditor />} />
                <Route path="/design-system" element={<DesignSystemPage />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </MobileBlocker>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
