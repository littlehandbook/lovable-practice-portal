
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/Spinner";

interface ProtectedRouteProps {
  children: ReactNode;
  requireVerification?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireVerification = true 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    // Redirect them to the login page, but save where they were going
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If verification is required, check if the email is verified
  // Email verification is checked directly in each component that requires it
  // using the useEmailVerification hook

  return <>{children}</>;
};
