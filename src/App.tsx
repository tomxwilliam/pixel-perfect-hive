
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
import NotFound from "./pages/NotFound";

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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
