import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import ProtectedRoute from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import MobileBlocker from "./components/MobileBlocker";
import CookieBanner from "./components/CookieBanner";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const GenogramEditor = lazy(() => import("./pages/GenogramEditor"));
const DesignSystemPage = lazy(() => import("./pages/DesignSystem"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const SharedGenogram = lazy(() => import("./pages/SharedGenogram"));
const SharedEditor = lazy(() => import("./pages/SharedEditor"));
const NotFound = lazy(() => import("./pages/NotFound"));
const GenogramDefinition = lazy(() => import("./pages/GenogramDefinition"));
const HowToGenogram = lazy(() => import("./pages/HowToGenogram"));
const Account = lazy(() => import("./pages/Account"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const LegalNotice = lazy(() => import("./pages/LegalNotice"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const ResourcesPage = lazy(() => import("./pages/SeoLandingPages").then((module) => ({ default: module.ResourcesPage })));
const SymbolsGenogramPage = lazy(() => import("./pages/SeoLandingPages").then((module) => ({ default: module.SymbolsGenogramPage })));
const GenogramPsychologyPage = lazy(() => import("./pages/SeoLandingPages").then((module) => ({ default: module.GenogramPsychologyPage })));
const GenogramSocialWorkPage = lazy(() => import("./pages/SeoLandingPages").then((module) => ({ default: module.GenogramSocialWorkPage })));
const FirstSessionGenogramArticle = lazy(() => import("./pages/SeoLandingPages").then((module) => ({ default: module.FirstSessionGenogramArticle })));
const ClinicalExampleArticle = lazy(() => import("./pages/SeoLandingPages").then((module) => ({ default: module.ClinicalExampleArticle })));
const SocialWorkCaseArticle = lazy(() => import("./pages/SeoLandingPages").then((module) => ({ default: module.SocialWorkCaseArticle })));

const queryClient = new QueryClient();

const App = () => {

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
            <BrowserRouter>
              <MobileBlocker>
                <Suspense fallback={null}>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/en" element={<LandingPage forceLang="en" />} />
                    <Route path="/de" element={<LandingPage forceLang="de" />} />
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
                    <Route path="/legal" element={<LegalNotice />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/disclaimer" element={<Disclaimer />} />
                    <Route path="/genogramme" element={<GenogramDefinition />} />
                    <Route path="/comment-faire-un-genogramme" element={<HowToGenogram />} />
                    <Route path="/ressources" element={<ResourcesPage />} />
                    <Route path="/ressources/genogramme-premiere-seance" element={<FirstSessionGenogramArticle />} />
                    <Route path="/ressources/exemple-genogramme-clinique" element={<ClinicalExampleArticle />} />
                    <Route path="/ressources/genogramme-travail-social-cas-pratique" element={<SocialWorkCaseArticle />} />
                    <Route path="/blog" element={<Navigate to="/ressources" replace />} />
                    <Route path="/symboles-genogramme" element={<SymbolsGenogramPage />} />
                    <Route path="/genogramme-psychologie" element={<GenogramPsychologyPage />} />
                    <Route path="/genogramme-travail-social" element={<GenogramSocialWorkPage />} />
                    <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <CookieBanner />
              </MobileBlocker>
            </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
