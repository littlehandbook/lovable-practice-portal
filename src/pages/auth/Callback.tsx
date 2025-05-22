
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Spinner } from "@/components/Spinner";

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Get the URL hash
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');
      
      // If we have tokens in the URL, handle them
      if (accessToken && refreshToken && type === 'recovery') {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        
        if (error) {
          setError(error.message);
        } else {
          // Successfully set the session
          navigate('/practice');
        }
      } else {
        // No tokens in URL, check if there's a code parameter for OAuth or magic link
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        
        if (code) {
          try {
            // Exchange the code for a session
            await supabase.auth.exchangeCodeForSession(code);
            navigate('/practice');
          } catch (err: any) {
            setError(err.message);
          }
        } else {
          // No authentication information found
          navigate('/auth/login');
        }
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
