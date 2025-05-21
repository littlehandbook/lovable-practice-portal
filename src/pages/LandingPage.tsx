
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Computer, User, Users } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-teal-700">EmpathTech</h1>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <a href="/admin" className="text-gray-600 hover:text-teal-600 text-sm font-medium">
                  Admin Portal
                </a>
              </li>
              <li>
                <a href="/practice" className="text-gray-600 hover:text-teal-600 text-sm font-medium">
                  Practice Portal
                </a>
              </li>
              <li>
                <a href="/client" className="text-gray-600 hover:text-teal-600 text-sm font-medium">
                  Client Login
                </a>
              </li>
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
          <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white">
            For Therapists
          </Button>
          <Button size="lg" variant="outline" className="border-teal-500 text-teal-500 hover:bg-teal-50">
            Client Portal
          </Button>
        </div>
      </section>

      {/* Portal Cards */}
      <section className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Admin Portal Card */}
          <Card className="flex flex-col">
            <CardContent className="pt-6 flex-grow flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                <Computer className="h-8 w-8 text-teal-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-slate-800">Admin Portal</h2>
              <p className="text-slate-600">
                System administration and oversight for platform managers.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center pt-2 pb-6">
              <a
                href="/admin"
                className="text-teal-500 hover:text-teal-700 font-medium flex items-center"
              >
                Access Admin Portal
              </a>
            </CardFooter>
          </Card>

          {/* Therapist Portal Card */}
          <Card className="flex flex-col">
            <CardContent className="pt-6 flex-grow flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-teal-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-slate-800">Therapist Portal</h2>
              <p className="text-slate-600">
                Complete practice management for therapy professionals.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center pt-2 pb-6">
              <a
                href="/practice"
                className="text-teal-500 hover:text-teal-700 font-medium flex items-center"
              >
                Access Therapist Portal
              </a>
            </CardFooter>
          </Card>

          {/* Client Portal Card */}
          <Card className="flex flex-col">
            <CardContent className="pt-6 flex-grow flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-teal-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-slate-800">Client Portal</h2>
              <p className="text-slate-600">
                Secure access to appointments, documents, and messaging for clients.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center pt-2 pb-6">
              <a
                href="/client"
                className="text-teal-500 hover:text-teal-700 font-medium flex items-center"
              >
                Access Client Portal
              </a>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-slate-600 text-sm">
        <p>© 2025 EmpathTech. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
