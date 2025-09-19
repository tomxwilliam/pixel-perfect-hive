
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ProtectedRoute } from "@/components/ProtectedRoute";
// Pages
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ProjectManagement from "./pages/ProjectManagement";
import NotFound from "./pages/NotFound";
import Support from "./pages/Support";

// Portfolio pages
import GamePortfolio from "./pages/GamePortfolio";
import AppPortfolio from "./pages/AppPortfolio";  
import WebPortfolio from "./pages/WebPortfolio";

// Service pages
import AIIntegration from "./pages/services/AIIntegration";
import WebDevelopment from "./pages/services/WebDevelopment";
import AppDevelopment from "./pages/services/AppDevelopment";
import GameDevelopment from "./pages/services/GameDevelopment";

// Dashboard pages
import NewProject from "./pages/dashboard/NewProject";
import NewTicket from "./pages/dashboard/NewTicket";
import BookCall from "./pages/dashboard/BookCall";
import AIChat from "./pages/dashboard/AIChat";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";

// Legal pages
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import RefundsPolicy from "./pages/legal/RefundsPolicy";
import CookiePolicy from "./pages/legal/CookiePolicy";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Main pages */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/support" element={<Support />} />
              
              {/* Portfolio pages */}
              <Route path="/portfolio/web" element={<WebPortfolio />} />
              <Route path="/portfolio/apps" element={<AppPortfolio />} />
              <Route path="/portfolio/games" element={<GamePortfolio />} />
              
              {/* Service pages */}
              <Route path="/services/ai-integration" element={<AIIntegration />} />
              <Route path="/services/web-development" element={<WebDevelopment />} />
              <Route path="/services/app-development" element={<AppDevelopment />} />
              <Route path="/services/game-development" element={<GameDevelopment />} />
              
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
              <Route path="/dashboard/book-call" element={
                <ProtectedRoute>
                  <BookCall />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/chat" element={
                <ProtectedRoute>
                  <AIChat />
                </ProtectedRoute>
              } />
              
              {/* Admin pages */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/projects" element={
                <ProtectedRoute requireCodeLabEmail={true}>
                  <ProjectManagement />
                </ProtectedRoute>
              } />
              
              {/* Legal pages */}
              <Route path="/legal/privacy" element={<PrivacyPolicy />} />
              <Route path="/legal/terms" element={<TermsOfService />} />
              <Route path="/legal/refunds" element={<RefundsPolicy />} />
              <Route path="/legal/cookies" element={<CookiePolicy />} />
              
              {/* 404 page */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>

          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
