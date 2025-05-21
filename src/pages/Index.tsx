
import { useState, useEffect } from "react";
import LandingPage from "./LandingPage";
import { Spinner } from "@/components/Spinner";

const Index = () => {
  // In a real implementation, this would check authentication
  // For now we'll just simulate a loading state
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Simulate authentication check
    const timer = setTimeout(() => {
      setLoading(false);
      setAuthenticated(false); // Always show the landing page for now
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner />
      </div>
    );
  }

  // If not authenticated, show landing page
  if (!authenticated) {
    return <LandingPage />;
  }

  // In the future, this would redirect based on user role
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">EmpathTech Workspace System</h1>
        <div className="space-x-4">
          <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded">
            Log In
          </button>
          <button className="border border-teal-500 text-teal-500 hover:bg-teal-50 px-4 py-2 rounded">
            Admin Setup
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
