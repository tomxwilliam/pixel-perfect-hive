import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireCodeLabEmail?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false,
  requireCodeLabEmail = false 
}) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Show loading only when truly loading (no user data at all)
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If we have a user but no roles yet, allow render to continue
  // The auth hook will handle role loading
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireCodeLabEmail && user && !user.email?.endsWith('@404codelab.com')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};