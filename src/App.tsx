
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AuthCallback from "./pages/auth/Callback";

// Practitioner Portal Pages
import PractitionerDashboard from "./pages/practice/Dashboard";
import ClientsPage from "./pages/practice/Clients";
import ClientDetailPage from "./pages/practice/ClientDetail";
import CalendarPage from "./pages/practice/Calendar";
import NotesPage from "./pages/practice/Notes";
import TelehealthPage from "./pages/practice/Telehealth";
import SettingsPage from "./pages/practice/Settings";

// Client Portal Pages
import ClientDashboard from "./pages/client/Dashboard";
import BookSessionPage from "./pages/client/BookSession";
import ClientSessionsPage from "./pages/client/Sessions";
import ClientDocumentsPage from "./pages/client/Documents";
import ClientSettingsPage from "./pages/client/ClientSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/verify-email" element={<VerifyEmail />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Protected Routes - Practitioner Portal */}
            <Route 
              path="/practice" 
              element={
                <ProtectedRoute>
                  <PractitionerDashboard />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/practice/clients" 
              element={
                <ProtectedRoute>
                  <ClientsPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/practice/clients/:clientId" 
              element={
                <ProtectedRoute>
                  <ClientDetailPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/practice/calendar" 
              element={
                <ProtectedRoute>
                  <CalendarPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/practice/notes" 
              element={
                <ProtectedRoute>
                  <NotesPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/practice/telehealth" 
              element={
                <ProtectedRoute>
                  <TelehealthPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/practice/settings" 
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            
            {/* Protected Routes - Client Portal */}
            <Route 
              path="/client" 
              element={
                <ProtectedRoute>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/client/book" 
              element={
                <ProtectedRoute>
                  <BookSessionPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/client/sessions" 
              element={
                <ProtectedRoute>
                  <ClientSessionsPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/client/documents" 
              element={
                <ProtectedRoute>
                  <ClientDocumentsPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/client/settings" 
              element={
                <ProtectedRoute>
                  <ClientSettingsPage />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
