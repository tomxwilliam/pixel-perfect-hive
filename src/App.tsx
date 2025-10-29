import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ScrollToTop } from "@/components/ScrollToTop";
import { CookieConsentProvider, useCookieConsent } from "@/hooks/useCookieConsent";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { CookiePreferenceCenter } from "@/components/CookiePreferenceCenter";
import { initializeAnalytics, trackPageView } from "@/lib/analytics";
import { useEffect } from "react";
// Pages
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ProjectManagement from "./pages/ProjectManagement";
import NotFound from "./pages/NotFound";
import Support from "./pages/Support";
import UserSettings from "./pages/UserSettings";

// Portfolio pages
import GamePortfolio from "./pages/GamePortfolio";
import AppPortfolio from "./pages/AppPortfolio";  
import WebPortfolio from "./pages/WebPortfolio";

// Service pages
import AIIntegration from "./pages/services/AIIntegration";

// Dashboard pages
import NewProject from "./pages/dashboard/NewProject";
import NewTicket from "./pages/dashboard/NewTicket";
import BookCall from "./pages/dashboard/BookCall";
import Subscriptions from "./pages/dashboard/Subscriptions";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import { AdminAccounting } from "./components/admin/AdminAccounting";
import AdminSettings from "./components/admin/AdminSettings";

// Legal pages
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import RefundsPolicy from "./pages/legal/RefundsPolicy";
import CookiePolicy from "./pages/legal/CookiePolicy";

// Blog pages
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogCategory from "./pages/BlogCategory";
import BlogTag from "./pages/BlogTag";

// Google Ads Landing Pages
import WebDevelopmentAds from "./pages/ads/WebDevelopmentAds";
import GameDevelopmentAds from "./pages/ads/GameDevelopmentAds";
import AppDevelopmentAds from "./pages/ads/AppDevelopmentAds";


const queryClient = new QueryClient();

function AnalyticsTracker() {
  const { hasConsent } = useCookieConsent();
  const location = useLocation();

  useEffect(() => {
    // Initialize analytics if user has given consent
    if (hasConsent('analytics')) {
      initializeAnalytics(true);
    }
  }, [hasConsent]);

  useEffect(() => {
    // Track page views on route change
    if (hasConsent('analytics')) {
      trackPageView(location.pathname + location.search);
    }
  }, [location, hasConsent]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <CookieConsentProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnalyticsTracker />
              <ScrollToTop />
              <Routes>
              {/* Main pages */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/support" element={<Support />} />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <UserSettings />
                </ProtectedRoute>
              } />
              
              {/* Portfolio pages */}
              <Route path="/portfolio/web" element={<WebPortfolio />} />
              <Route path="/portfolio/apps" element={<AppPortfolio />} />
              <Route path="/portfolio/games" element={<GamePortfolio />} />
              
              {/* Service pages */}
              <Route path="/services/ai-integration" element={<AIIntegration />} />
              
              {/* Google Ads Landing Pages */}
              <Route path="/ads/web-development" element={<WebDevelopmentAds />} />
              <Route path="/ads/game-development" element={<GameDevelopmentAds />} />
              <Route path="/ads/app-development" element={<AppDevelopmentAds />} />
              
              {/* Authentication */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Dashboard pages */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/projects/new" element={
                <ProtectedRoute>
                  <NewProject />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/tickets/new" element={
                <ProtectedRoute>
                  <NewTicket />
                </ProtectedRoute>
              } />
            <Route path="/dashboard/new-project" element={<ProtectedRoute><NewProject /></ProtectedRoute>} />
            <Route path="/dashboard/new-ticket" element={<ProtectedRoute><NewTicket /></ProtectedRoute>} />
            <Route path="/dashboard/book-call" element={<ProtectedRoute><BookCall /></ProtectedRoute>} />
            <Route path="/dashboard/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
              
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
              <Route path="/project-management" element={
                <ProtectedRoute requireCodeLabEmail={true}>
                  <ProjectManagement />
                </ProtectedRoute>
              } />
              <Route path="/accounting" element={
                <ProtectedRoute requireCodeLabEmail={true}>
                  <AdminAccounting />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute requireCodeLabEmail={true}>
                  <AdminSettings />
                </ProtectedRoute>
              } />
              
              {/* Legal pages */}
              <Route path="/legal/privacy" element={<PrivacyPolicy />} />
              <Route path="/legal/terms" element={<TermsOfService />} />
              <Route path="/legal/refunds" element={<RefundsPolicy />} />
              <Route path="/legal/cookies" element={<CookiePolicy />} />
              
              {/* Blog pages */}
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/blog/category/:slug" element={<BlogCategory />} />
              <Route path="/blog/tag/:tag" element={<BlogTag />} />
              
              {/* 404 page */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <CookieConsentBanner />
            <CookiePreferenceCenter />
          </BrowserRouter>
        </TooltipProvider>
        </CookieConsentProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
