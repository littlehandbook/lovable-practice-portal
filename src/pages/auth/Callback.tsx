
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Spinner } from "@/components/Spinner";
import { toast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL hash
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');
        
        // If we have tokens in the URL, handle them
        if (accessToken && refreshToken && type === 'recovery') {
          console.log("Processing token-based auth...");
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error("Error setting session:", error);
            setError(error.message);
            toast({
              title: "Authentication Error",
              description: error.message,
              variant: "destructive"
            });
          } else {
            // Successfully set the session
            console.log("Session set successfully");
            toast({
              title: "Authentication Successful",
              description: "You have been logged in successfully."
            });
            navigate('/practice');
          }
        } else {
          console.log("Checking for code parameter...");
          // No tokens in URL, check if there's a code parameter for OAuth or magic link
          const url = new URL(window.location.href);
          const code = url.searchParams.get('code');
          
          if (code) {
            console.log("Found code parameter, exchanging for session...");
            try {
              // Exchange the code for a session
              const { error } = await supabase.auth.exchangeCodeForSession(code);
              
              if (error) {
                console.error("Error exchanging code for session:", error);
                setError(error.message);
                toast({
                  title: "Authentication Error",
                  description: error.message,
                  variant: "destructive"
                });
                setTimeout(() => navigate('/auth/login'), 3000);
              } else {
                console.log("Session exchange successful");
                toast({
                  title: "Authentication Successful",
                  description: "You have been logged in successfully."
                });
                navigate('/practice');
              }
            } catch (err: any) {
              console.error("Exception during code exchange:", err);
              setError(err.message);
              toast({
                title: "Authentication Error",
                description: err.message,
                variant: "destructive"
              });
              setTimeout(() => navigate('/auth/login'), 3000);
            }
          } else {
            // No authentication information found
            console.log("No auth information found, redirecting to login");
            navigate('/auth/login');
          }
        }
      } catch (generalError: any) {
        console.error("General error in auth callback:", generalError);
        setError(generalError.message || "An unexpected error occurred");
        toast({
          title: "Authentication Error",
          description: generalError.message || "An unexpected error occurred",
          variant: "destructive"
        });
        setTimeout(() => navigate('/auth/login'), 3000);
      }
    };
    
    handleAuthCallback();
  }, [navigate]);
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h2 className="text-xl font-medium text-red-600">Authentication Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button 
            onClick={() => navigate('/auth/login')} 
            className="mt-4 bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Spinner />
      <p className="ml-3 text-gray-600">Authenticating...</p>
    </div>
  );
};

export default AuthCallback;
