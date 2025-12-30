import React, { useEffect, useState } from 'react';
import { Route, useHistory } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import NotAuthenticated from './NotAuthenticated';

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  path: string;
  exact?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, ...rest }) => {
  const { isAuthenticated, isLoading, user, getAccessTokenSilently, logout } = useAuth0();
  const [isChecking, setIsChecking] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const checkUser = async () => {
      if (isLoading) return;
      if (!isAuthenticated || !user?.email) {
        setIsChecking(false);
        return;
      }

      try {
        // Try to get token and check user status
        const token = await getAccessTokenSilently();
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/checkUser`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: user.email }),
        });

        if (response.status === 401) {
          // Token issue - check user status without auth
          await checkUserWithoutAuth(user.email);
          return;
        }

        const data = await response.json();
        
        if (response.status === 200) {
          if (data.exists && data.approvedByAdmin) {
            // User is approved, continue normally
          } else if (data.exists && !data.approvedByAdmin) {
            history.push('/approval-pending');
          } else {
            history.push('/register');
          }
        } else {
          // API returned error - check user status without auth
          await checkUserWithoutAuth(user.email);
        }
      } catch (error: any) {
        console.error("Auth error:", error);
        
        // For all token-related errors, check user without auth
        const isAuthError = 
          error.message?.includes('expired') || 
          error.error?.includes('expired') ||
          error.message?.toLowerCase().includes('refresh token') || 
          error.message?.toLowerCase().includes('offline access') ||
          (typeof error.error === 'string' && 
            (error.error.toLowerCase().includes('refresh token') || 
             error.error.toLowerCase().includes('offline access')));
            
        if (isAuthError) {
          console.log("Authentication error detected, checking user status without token");
          await checkUserWithoutAuth(user.email);
          return;
        }
        
        // For all other errors, still check user without auth rather than defaulting to register
        await checkUserWithoutAuth(user.email);
      }
      
      setIsChecking(false);
    };
    
    // Helper function to check user without authentication
    const checkUserWithoutAuth = async (email: string) => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/checkUserNoAuth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.exists) {
            if (data.approvedByAdmin) {
              // User exists and is approved - send to home
              history.push('/');
            } else {
              // User exists but not approved - keep on approval pending
              history.push('/approval-pending');
            }
          } else {
            // User doesn't exist - send to register
            history.push('/register');
          }
        } else {
          // API error - send to register as fallback
          history.push('/register');
        }
      } catch (error) {
        console.error("Backend user check failed:", error);
        // API error - send to register as fallback
        history.push('/register');
      }
      
      setIsChecking(false);
    };

    checkUser();
  }, [isAuthenticated, isLoading, user, getAccessTokenSilently, history, logout]);

  if (isLoading || isChecking) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? <Component {...props} /> : <NotAuthenticated />
      }
    />
  );
};

export default ProtectedRoute;