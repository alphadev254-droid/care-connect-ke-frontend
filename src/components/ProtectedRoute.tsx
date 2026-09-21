import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAll?: boolean;
  fallbackPath?: string;
}

const ProtectedRoute = ({ 
  children, 
  requiredPermission, 
  requiredPermissions = [], 
  requireAll = false,
  fallbackPath = '/dashboard'
}: ProtectedRouteProps) => {
  const { loading: authLoading, isAuthenticated, user } = useAuth();
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading: permissionsLoading } = usePermissions();
  const location = useLocation();

  // Show loading while authentication or permissions are loading
  if (authLoading || permissionsLoading) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const caregiverStatus = user?.Caregiver?.verificationStatus;
  if (
    user?.role === 'caregiver' &&
    caregiverStatus !== 'verified' &&
    location.pathname !== '/dashboard/verification'
  ) {
    return <Navigate to="/dashboard/verification" replace />;
  }

  // Check single permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <AccessDenied fallbackPath={fallbackPath} />;
  }

  // Check multiple permissions
  if (requiredPermissions.length > 0) {
    const hasAccess = requireAll 
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);
    
    if (!hasAccess) {
      return <AccessDenied fallbackPath={fallbackPath} />;
    }
  }

  return <>{children}</>;
};



const AccessDenied = ({ fallbackPath }: { fallbackPath: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-muted/30">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <Shield className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle>Access Denied</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          You don't have permission to access this page.
        </p>
        <Button onClick={() => window.location.href = fallbackPath}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </CardContent>
    </Card>
  </div>
);

export default ProtectedRoute;
