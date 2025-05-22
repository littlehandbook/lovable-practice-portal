
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle2, XCircle } from "lucide-react";

const VerifyEmail = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [verificationSent, setVerificationSent] = useState(false);
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;

    // Check if email is already verified
    const checkVerification = async () => {
      setChecking(true);
      try {
        // Check verification status from our therapist table
        const { data, error } = await supabase.rpc(
          'sp_get_therapist_by_email' as any,
          { p_email: user.email }
        );

        if (error) throw error;

        const isVerified = data?.[0]?.email_verified;
        setVerified(isVerified || false);
        
        // If verified, redirect to dashboard after a short delay
        if (isVerified) {
          setTimeout(() => navigate("/practice"), 2000);
        }
      } catch (error) {
        console.error("Error checking email verification:", error);
      } finally {
        setChecking(false);
      }
    };

    checkVerification();
  }, [user, navigate]);

  const handleResendVerification = async () => {
    if (!user?.email) return;

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
      });

      if (error) throw error;

      setVerificationSent(true);
      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification link",
      });
    } catch (error: any) {
      console.error("Failed to resend verification email:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          {verified === null ? (
            <div className="mx-auto w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-teal-600" />
            </div>
          ) : verified ? (
            <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          ) : (
            <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-amber-600" />
            </div>
          )}
          
          {verified ? (
            <CardTitle className="text-2xl">Email Verified</CardTitle>
          ) : (
            <CardTitle className="text-2xl">Verify your email</CardTitle>
          )}
          
          {verified ? (
            <CardDescription>
              Your email has been verified successfully. Redirecting you to the dashboard...
            </CardDescription>
          ) : (
            <CardDescription>
              We've sent you a verification link. Please check your email to verify your account.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {!verified && (
            <p className="text-sm text-gray-600">
              If you don't see the email in your inbox, please check your spam folder or request a new verification link.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {!verified && (
            <Button 
              onClick={handleResendVerification} 
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={verificationSent || checking}
            >
              {verificationSent ? "Email sent" : checking ? "Checking..." : "Resend verification email"}
            </Button>
          )}
          <Button asChild className={`w-full ${verified ? "bg-teal-600 hover:bg-teal-700" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}>
            <Link to={verified ? "/practice" : "/auth/login"}>
              {verified ? "Go to dashboard" : "Return to login"}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmail;
