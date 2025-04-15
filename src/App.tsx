import React, { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { isAuthenticated } from './api';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Predict from './pages/Predict';
import Statistics from './pages/Statistics';

// Components
import Layout from './components/Layout';

interface ProtectedRouteProps {
  children: ReactNode;
}

// Protected route component
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{
        className: 'dark:bg-gray-800 dark:text-white',
      }} />
      
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/predict" 
            element={
              <ProtectedRoute>
                <Predict />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/statistics" 
            element={
              <ProtectedRoute>
                <Statistics />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect root to predict or login based on auth state */}
          <Route 
            path="/" 
            element={
              isAuthenticated() ? 
              <Navigate to="/predict" /> : 
              <Navigate to="/login" />
            } 
          />

          {/* Catch-all route for 404 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;