import { Navigate, useLocation } from "react-router-dom";

/**
 * ProtectedRoute - Wraps routes that require authentication
 * Redirects to login page if user is not authenticated
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  
  if (!isAuthenticated) {
    // Redirect to login page, saving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}
