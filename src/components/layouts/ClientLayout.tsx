
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, 
  FileText, 
  Settings, 
  Clock,
  LogOut,
  Upload 
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  
  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/client', 
      icon: <Clock className="w-5 h-5" /> 
    },
    { 
      name: 'Book Session', 
      path: '/client/book', 
      icon: <Calendar className="w-5 h-5" /> 
    },
    { 
      name: 'My Sessions', 
      path: '/client/sessions', 
      icon: <FileText className="w-5 h-5" /> 
    },
    { 
      name: 'Documents', 
      path: '/client/documents', 
      icon: <Upload className="w-5 h-5" /> 
    },
    { 
      name: 'Settings', 
      path: '/client/settings', 
      icon: <Settings className="w-5 h-5" /> 
    },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 bg-white border-r shadow-sm">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-purple-600">Client Portal</h1>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'bg-purple-50 text-purple-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarFallback className="bg-purple-100 text-purple-800">
                  {user?.email?.charAt(0).toUpperCase() || 'C'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium truncate max-w-[120px]">
                {user?.email}
              </span>
            </div>
            <button 
              onClick={() => signOut()} 
              className="text-gray-500 hover:text-gray-700"
              aria-label="Log out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b z-10 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-purple-600">Client Portal</h1>
          {/* Mobile menu button would go here */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
