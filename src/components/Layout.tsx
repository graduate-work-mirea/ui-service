import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Brain, BarChart3, LogOut, Moon, Sun, User } from 'lucide-react';
import { logout, isAuthenticated } from '../api';
import { toast } from 'react-hot-toast';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const authenticated = isAuthenticated();

  // Function to apply theme to document
  const applyTheme = (darkMode: boolean) => {
    // Get the HTML element (document root)
    const htmlElement = document.documentElement;
    
    if (darkMode) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  };

  // Initialize theme on component mount
  useEffect(() => {
    // Check for saved preference in localStorage
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      applyTheme(true);
    } else if (savedTheme === 'light') {
      setIsDarkMode(false);
      applyTheme(false);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // If no saved preference, use system preference
      setIsDarkMode(true);
      applyTheme(true);
    } else {
      // Default to light mode if no preference and system is not dark
      setIsDarkMode(false);
      applyTheme(false);
    }
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      applyTheme(newMode);
      return newMode;
    });
  };

  const handleLogout = () => {
    logout();
    toast.success('Выход выполнен успешно');
    navigate('/login');
  };

  // Don't show navbar on login/register pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Brain className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                <h1 className="ml-3 text-2xl font-bold text-gray-900 dark:text-white">
                  Система прогнозирования спроса
                </h1>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {authenticated && (
                <>
                  <Link
                    to="/predict"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/predict'
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    Прогнозирование
                  </Link>
                  
                  <Link
                    to="/statistics"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/statistics'
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <BarChart3 className="h-5 w-5 inline-block mr-1" />
                    История прогнозов
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                  >
                    <LogOut className="h-5 w-5 inline-block mr-1" />
                    Выйти
                  </button>
                </>
              )}
              
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-200 hover:bg-gray-600' : 'bg-gray-200 text-indigo-700 hover:bg-gray-300'}`}
                aria-label="Toggle dark mode"
                title={isDarkMode ? "Включить светлую тему" : "Включить темную тему"}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 py-6 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Система прогнозирования спроса
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 