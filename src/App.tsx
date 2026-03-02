import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import ProtectedRoute from "@/components/ProtectedRoute";
import SEOHead from "@/components/SEOHead";
import ScrollToTop from "@/components/ScrollToTop";
import UnifiedLanding from "./pages/UnifiedLanding";
import ProLanding from "./pages/ProLanding";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Practice from "./pages/Practice";
import SessionDetail from "./pages/SessionDetail";
import Settings from "./pages/Settings";
import ProSubscription from "./pages/ProSubscription";
import ProSubscriptionManage from "./pages/ProSubscriptionManage";
import Library from "./pages/Library";
import PatientDetail from "./pages/PatientDetail";
import Pricing from "./pages/Pricing";
import Assessment from "./pages/Assessment";
import ResetPassword from "./pages/ResetPassword";

import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import SubscriptionManage from "./pages/SubscriptionManage";

import Contact from "./pages/Contact";
import CookieConsent from "./components/CookieConsent";
import TherapistDashboard from "./pages/TherapistDashboard";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import Dialogue from "./pages/Dialogue";
import Diagnostic from "./pages/Diagnostic";
import Admin from "./pages/Admin";
import AcousticTest from "./pages/AcousticTest";
import DialogueLab from "./pages/DialogueLab";
import SessionLive from "./pages/SessionLive";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <SEOHead />
          <Routes>
            {/* Unified landing page */}
            <Route path="/" element={<UnifiedLanding />} />
            <Route path="/pro" element={<ProLanding />} />
            <Route path="/patients" element={<Navigate to="/#patients" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/pro/subscription" element={<ProtectedRoute><ProSubscription /></ProtectedRoute>} />
            <Route path="/pro/subscription/manage" element={<ProtectedRoute><ProSubscriptionManage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
            <Route path="/dialogue" element={<ProtectedRoute><Dialogue /></ProtectedRoute>} />
            
            <Route path="/session/:id" element={<ProtectedRoute><SessionDetail /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/patient/list" element={<ProtectedRoute><TherapistDashboard /></ProtectedRoute>} />
            <Route path="/patient/:id" element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} />
            <Route path="/pricing" element={<Pricing />} />
            
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/diagnostic" element={<Diagnostic />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/legal/terms" element={<Terms />} />
            <Route path="/legal/privacy" element={<Privacy />} />
            <Route path="/subscription/manage" element={<ProtectedRoute><SubscriptionManage /></ProtectedRoute>} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogArticle />} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/admin/test-acoustique" element={<ProtectedRoute><AcousticTest /></ProtectedRoute>} />
            <Route path="/dialogue-lab" element={<DialogueLab />} />
            <Route path="/session-live" element={<ProtectedRoute><SessionLive /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieConsent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
