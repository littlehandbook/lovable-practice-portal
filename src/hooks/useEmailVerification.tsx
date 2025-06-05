
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export function useEmailVerification(redirectTo?: string) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [verified, setVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEmailVerification = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Check the therapist record for email verification status
        const { data, error } = await supabase.rpc(
          'sp_get_therapist_by_email' as any,
          { p_email: user.email }
        );

        if (error) throw error;

        const isVerified = data?.[0]?.email_verified || false;
        setVerified(isVerified);

        // If the email is not verified and a redirect path is provided, navigate there
        if (!isVerified && redirectTo) {
          navigate(redirectTo);
        }
      } catch (error) {
        console.error("Error checking email verification:", error);
      } finally {
        setLoading(false);
      }
    };

    checkEmailVerification();
  }, [user, navigate, redirectTo]);

  return { verified, loading };
}
