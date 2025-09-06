
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import GamePortfolio from "./pages/GamePortfolio";
import AppPortfolio from "./pages/AppPortfolio";
import WebPortfolio from "./pages/WebPortfolio";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NewProject from "./pages/dashboard/NewProject";
import NewTicket from "./pages/dashboard/NewTicket";
import BookCall from "./pages/dashboard/BookCall";
import AIChat from "./pages/dashboard/AIChat";
import Portal from "./pages/dashboard/Portal";
import NotFound from "./pages/NotFound";
import AIIntegration from "./pages/services/AIIntegration";
import GamesLanding from "./pages/landing/GamesLanding";
import AppsLanding from "./pages/landing/AppsLanding";
import WebLanding from "./pages/landing/WebLanding";
import AILanding from "./pages/landing/AILanding";
import ProjectManagement from "./pages/ProjectManagement";
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
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/portfolio/games" element={<GamePortfolio />} />
              <Route path="/portfolio/apps" element={<AppPortfolio />} />
              <Route path="/portfolio/web" element={<WebPortfolio />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
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
              <Route path="/dashboard/portal" element={
                <ProtectedRoute>
                  <Portal />
                </ProtectedRoute>
              } />
              <Route path="/projects" element={
                <ProtectedRoute requireCodeLabEmail={true}>
                  <ProjectManagement />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="/services/ai-integration" element={<AIIntegration />} />
              <Route path="/l/games" element={<GamesLanding />} />
              <Route path="/l/apps" element={<AppsLanding />} />
              <Route path="/l/web" element={<WebLanding />} />
              <Route path="/l/ai-integration" element={<AILanding />} />
              <Route path="/legal/privacy" element={<PrivacyPolicy />} />
              <Route path="/legal/terms" element={<TermsOfService />} />
              <Route path="/legal/refunds" element={<RefundsPolicy />} />
              <Route path="/legal/cookies" element={<CookiePolicy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>

          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
