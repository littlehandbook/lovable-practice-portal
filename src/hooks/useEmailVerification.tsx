
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getVerificationStatus } from "@/services/emailVerificationService";

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
        console.log('Checking email verification via microservice for:', user.email);
        
        const status = await getVerificationStatus(user.email!);
        setVerified(status.verified);

        // If the email is not verified and a redirect path is provided, navigate there
        if (!status.verified && redirectTo) {
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
