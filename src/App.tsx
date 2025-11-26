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
import { useEffect, lazy, Suspense } from "react";
import { PageSkeleton } from "@/components/ui/page-skeleton";

// Critical pages - load immediately
import Index from "./pages/Index";
import Auth from "./pages/Auth";

// Lazy load all other pages for better performance
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProjectManagement = lazy(() => import("./pages/ProjectManagement"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Support = lazy(() => import("./pages/Support"));
const UserSettings = lazy(() => import("./pages/UserSettings"));

// Portfolio pages
const GamePortfolio = lazy(() => import("./pages/GamePortfolio"));
const AppPortfolio = lazy(() => import("./pages/AppPortfolio"));
const WebPortfolio = lazy(() => import("./pages/WebPortfolio"));

// Service pages
const AIIntegration = lazy(() => import("./pages/services/AIIntegration"));

// Dashboard pages
const NewProject = lazy(() => import("./pages/dashboard/NewProject"));
const NewTicket = lazy(() => import("./pages/dashboard/NewTicket"));
const BookCall = lazy(() => import("./pages/dashboard/BookCall"));
const Subscriptions = lazy(() => import("./pages/dashboard/Subscriptions"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminAccounting = lazy(() => import("./components/admin/AdminAccounting").then(m => ({ default: m.AdminAccounting })));
const AdminSettings = lazy(() => import("./components/admin/AdminSettings"));

// Legal pages
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/legal/TermsOfService"));
const RefundsPolicy = lazy(() => import("./pages/legal/RefundsPolicy"));
const CookiePolicy = lazy(() => import("./pages/legal/CookiePolicy"));

// Blog pages
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const BlogCategory = lazy(() => import("./pages/BlogCategory"));
const BlogTag = lazy(() => import("./pages/BlogTag"));

// Google Ads Landing Pages
const WebDevelopmentAds = lazy(() => import("./pages/ads/WebDevelopmentAds"));
const GameDevelopmentAds = lazy(() => import("./pages/ads/GameDevelopmentAds"));
const AppDevelopmentAds = lazy(() => import("./pages/ads/AppDevelopmentAds"));

// Location Landing Pages
const WebDevelopmentEdinburgh = lazy(() => import("./pages/location/WebDevelopmentEdinburgh"));
const WebDevelopmentGlasgow = lazy(() => import("./pages/location/WebDevelopmentGlasgow"));
const AppDevelopmentEdinburgh = lazy(() => import("./pages/location/AppDevelopmentEdinburgh"));
const AppDevelopmentGlasgow = lazy(() => import("./pages/location/AppDevelopmentGlasgow"));


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
              <Suspense fallback={<PageSkeleton />}>
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
              
              {/* Location Landing Pages */}
              <Route path="/web-development-edinburgh" element={<WebDevelopmentEdinburgh />} />
              <Route path="/web-development-glasgow" element={<WebDevelopmentGlasgow />} />
              <Route path="/app-development-edinburgh" element={<AppDevelopmentEdinburgh />} />
              <Route path="/app-development-glasgow" element={<AppDevelopmentGlasgow />} />
              
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
              </Suspense>
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
