
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Computer, User, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBranding } from "@/hooks/useBranding";

const LandingPage = () => {
  const { user, signOut } = useAuth();
  const { branding } = useBranding();

  const primaryColor = branding.primary_color || '#0f766e';
  const practiceName = branding.practice_name || 'EmpathTech';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {branding.logo_url && (
              <img 
                src={branding.logo_url} 
                alt="Practice logo" 
                className="h-8 w-8 object-contain"
              />
            )}
            <h1 
              className="text-xl font-bold"
              style={{ color: primaryColor }}
            >
              {practiceName}
            </h1>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link to="/admin" className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                  Admin Portal
                </Link>
              </li>
              <li>
                <Link to="/practice" className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                  Practice Portal
                </Link>
              </li>
              <li>
                <Link to="/client" className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                  Client Login
                </Link>
              </li>
              {user ? (
                <li>
                  <button 
                    onClick={signOut}
                    className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </li>
              ) : (
                <li>
                  <Link to="/auth/login" className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                    Sign In
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
          Therapy Management Platform
        </h1>
        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
          Streamline your practice with our comprehensive therapy management solution. Manage clients, sessions, and more in one secure platform.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            size="lg" 
            className="text-white hover:opacity-90" 
            style={{ backgroundColor: primaryColor }}
            asChild
          >
            <Link to="/auth/register">
              For Therapists
            </Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="hover:bg-gray-50" 
            style={{ 
              borderColor: primaryColor,
              color: primaryColor
            }}
            asChild
          >
            <Link to="/client">
              Client Portal
            </Link>
          </Button>
        </div>
      </section>

      {/* Portal Cards */}
      <section className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Admin Portal Card */}
          <Card className="flex flex-col">
            <CardContent className="pt-6 flex-grow flex flex-col items-center text-center">
              <div 
                className="h-16 w-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <Computer className="h-8 w-8" style={{ color: primaryColor }} />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-slate-800">Admin Portal</h2>
              <p className="text-slate-600">
                System administration and oversight for platform managers.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center pt-2 pb-6">
              <Link
                to="/admin"
                className="font-medium flex items-center hover:underline"
                style={{ color: primaryColor }}
              >
                Access Admin Portal
              </Link>
            </CardFooter>
          </Card>

          {/* Therapist Portal Card */}
          <Card className="flex flex-col">
            <CardContent className="pt-6 flex-grow flex flex-col items-center text-center">
              <div 
                className="h-16 w-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <Users className="h-8 w-8" style={{ color: primaryColor }} />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-slate-800">Therapist Portal</h2>
              <p className="text-slate-600">
                Complete practice management for therapy professionals.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center pt-2 pb-6">
              <Link
                to={user ? "/practice" : "/auth/login"}
                className="font-medium flex items-center hover:underline"
                style={{ color: primaryColor }}
              >
                {user ? "Access Therapist Portal" : "Login to Access"}
              </Link>
            </CardFooter>
          </Card>

          {/* Client Portal Card */}
          <Card className="flex flex-col">
            <CardContent className="pt-6 flex-grow flex flex-col items-center text-center">
              <div 
                className="h-16 w-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <User className="h-8 w-8" style={{ color: primaryColor }} />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-slate-800">Client Portal</h2>
              <p className="text-slate-600">
                Secure access to appointments, documents, and messaging for clients.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center pt-2 pb-6">
              <Link
                to="/client"
                className="font-medium flex items-center hover:underline"
                style={{ color: primaryColor }}
              >
                Access Client Portal
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-slate-600 text-sm">
        <p>© 2025 {practiceName}. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
