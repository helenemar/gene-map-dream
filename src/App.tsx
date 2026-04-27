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
const SerpPreview = lazy(() => import("./pages/SerpPreview"));
const TranslationAudit = lazy(() => import("./pages/TranslationAudit"));
const ResourcesPage = lazy(() => import("./pages/SeoLandingPages").then((module) => ({ default: module.ResourcesPage })));
const SymbolsGenogramPage = lazy(() => import("./pages/SeoLandingPages").then((module) => ({ default: module.SymbolsGenogramPage })));
const GenogramPsychologyPage = lazy(() => import("./pages/SeoLandingPages").then((module) => ({ default: module.GenogramPsychologyPage })));
const GenogramSocialWorkPage = lazy(() => import("./pages/SeoLandingPages").then((module) => ({ default: module.GenogramSocialWorkPage })));
const FirstSessionGenogramArticle = lazy(() => import("./pages/SeoLandingPages").then((module) => ({ default: module.FirstSessionGenogramArticle })));
const ClinicalExampleArticle = lazy(() => import("./pages/SeoLandingPages").then((module) => ({ default: module.ClinicalExampleArticle })));
const SocialWorkCaseArticle = lazy(() => import("./pages/SeoLandingPages").then((module) => ({ default: module.SocialWorkCaseArticle })));
const EnResourcesPage = lazy(() => import("./pages/LocalizedSeoPages").then((module) => ({ default: module.EnResourcesPage })));
const EnWhatIsGenogramPage = lazy(() => import("./pages/LocalizedSeoPages").then((module) => ({ default: module.EnWhatIsGenogramPage })));
const EnHowToGenogramPage = lazy(() => import("./pages/LocalizedSeoPages").then((module) => ({ default: module.EnHowToGenogramPage })));
const EnSymbolsPage = lazy(() => import("./pages/EnGenogramSymbolsPage"));
const EnPsychologyPage = lazy(() => import("./pages/LocalizedSeoPages").then((module) => ({ default: module.EnPsychologyPage })));
const EnSocialWorkPage = lazy(() => import("./pages/LocalizedSeoPages").then((module) => ({ default: module.EnSocialWorkPage })));
const EnFirstSessionArticle = lazy(() => import("./pages/LocalizedSeoPages").then((module) => ({ default: module.EnFirstSessionArticle })));
const EnClinicalExampleArticle = lazy(() => import("./pages/LocalizedSeoPages").then((module) => ({ default: module.EnClinicalExampleArticle })));
const EnSocialCaseArticle = lazy(() => import("./pages/LocalizedSeoPages").then((module) => ({ default: module.EnSocialCaseArticle })));
const DeResourcesPage = lazy(() => import("./pages/LocalizedSeoPages").then((module) => ({ default: module.DeResourcesPage })));
const DeWhatIsGenogramPage = lazy(() => import("./pages/LocalizedSeoPages").then((module) => ({ default: module.DeWhatIsGenogramPage })));
const DeHowToGenogramPage = lazy(() => import("./pages/LocalizedSeoPages").then((module) => ({ default: module.DeHowToGenogramPage })));
const DeSymbolsPage = lazy(() => import("./pages/LocalizedSeoPages").then((module) => ({ default: module.DeSymbolsPage })));
const DePsychologyPage = lazy(() => import("./pages/LocalizedSeoPages").then((module) => ({ default: module.DePsychologyPage })));
const DeSocialWorkPage = lazy(() => import("./pages/LocalizedSeoPages").then((module) => ({ default: module.DeSocialWorkPage })));
const DeFirstSessionArticle = lazy(() => import("./pages/LocalizedSeoPages").then((module) => ({ default: module.DeFirstSessionArticle })));
const DeClinicalExampleArticle = lazy(() => import("./pages/LocalizedSeoPages").then((module) => ({ default: module.DeClinicalExampleArticle })));
const DeSocialCaseArticle = lazy(() => import("./pages/LocalizedSeoPages").then((module) => ({ default: module.DeSocialCaseArticle })));
const BlogJusticeArticleFr = lazy(() => import("./pages/BlogJusticeArticle").then((module) => ({ default: module.BlogJusticeArticleFr })));
const BlogJusticeArticleEn = lazy(() => import("./pages/BlogJusticeArticle").then((module) => ({ default: module.BlogJusticeArticleEn })));
const BlogJusticeArticleDe = lazy(() => import("./pages/BlogJusticeArticle").then((module) => ({ default: module.BlogJusticeArticleDe })));

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
                    <Route path="/en/resources" element={<EnResourcesPage />} />
                    <Route path="/en/what-is-a-genogram" element={<EnWhatIsGenogramPage />} />
                    <Route path="/en/how-to-create-a-genogram" element={<EnHowToGenogramPage />} />
                    <Route path="/en/genogram-symbols" element={<EnSymbolsPage />} />
                    <Route path="/en/genogram-psychology" element={<EnPsychologyPage />} />
                    <Route path="/en/genogram-social-work" element={<EnSocialWorkPage />} />
                    <Route path="/en/resources/first-session-genogram" element={<EnFirstSessionArticle />} />
                    <Route path="/en/resources/clinical-genogram-example" element={<EnClinicalExampleArticle />} />
                    <Route path="/en/resources/social-work-genogram-case-study" element={<EnSocialCaseArticle />} />
                    <Route path="/de/ressourcen" element={<DeResourcesPage />} />
                    <Route path="/de/was-ist-ein-genogramm" element={<DeWhatIsGenogramPage />} />
                    <Route path="/de/genogramm-erstellen" element={<DeHowToGenogramPage />} />
                    <Route path="/de/genogramm-symbole" element={<DeSymbolsPage />} />
                    <Route path="/de/genogramm-psychologie" element={<DePsychologyPage />} />
                    <Route path="/de/genogramm-sozialarbeit" element={<DeSocialWorkPage />} />
                    <Route path="/de/ressourcen/genogramm-erste-sitzung" element={<DeFirstSessionArticle />} />
                    <Route path="/de/ressourcen/klinisches-genogramm-beispiel" element={<DeClinicalExampleArticle />} />
                    <Route path="/de/ressourcen/genogramm-sozialarbeit-fallbeispiel" element={<DeSocialCaseArticle />} />
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
                    <Route path="/serp-preview" element={<SerpPreview />} />
                    <Route path="/translation-audit" element={<TranslationAudit />} />
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
