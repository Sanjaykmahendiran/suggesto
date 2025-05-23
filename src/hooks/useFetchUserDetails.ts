import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

interface UserData {
  user_id: number;
  name: string;
  location: string;
  pincode: string | null;
  email: string;
  imgname: string;
  mobilenumber: string;
  register_level_status: number;
  dob: string | null;
  status: string;
  otp: string;
  otp_status: string;
  created_date: string;
  modified_date: string;
}

interface UseFetchUserDetailsReturn {
  user: UserData | null;
  loading: boolean;
  isPageValid: boolean;
  error: string | null;
  isRedirecting: boolean; // New loading state for redirects
}

const useFetchUserDetails = (): UseFetchUserDetailsReturn => {
  // Always declare ALL hooks at the top level - never conditional
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPageValid, setIsPageValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false); // New state
  
  const router = useRouter();
  const pathname = usePathname();

  // Memoize helper function to prevent unnecessary re-renders
  const getAccessiblePages = useCallback((registerLevelStatus: number): string[] => {
    switch (registerLevelStatus) {
      case 0:
        return ['/', '/auth/create-account'];
      case 1:
        return ['/', '/auth/create-account', '/auth/complete-account'];
      case 2:
        return ['/home'];
      default:
        return ['/'];
    }
  }, []);

  // Memoize fetch function to prevent unnecessary re-renders
  const fetchUserDetails = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://suggesto.xyz/App/api.php?gofor=userget&user_id=${userId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const userData: UserData = await response.json();
      setUser(userData);

      return userData;
    } catch (err) {
      console.error('Error fetching user details:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle initial page load and authentication check
  useEffect(() => {
    if (hasInitialized) return;

    const userId = Cookies.get('userID');
    
    if (!userId) {
      // No user logged in
      const publicPages = ['/', '/auth/create-account'];
      setIsPageValid(publicPages.includes(pathname));
      setUser(null);
      setLoading(false);
      setError(null);
      setHasInitialized(true);
      setIsRedirecting(false);
    } else {
      // User is logged in - fetch details
      fetchUserDetails(userId).then(() => {
        setHasInitialized(true);
      });
    }
  }, [pathname, fetchUserDetails, hasInitialized]);

  // Handle routing logic after user data is loaded
  useEffect(() => {
    if (!hasInitialized || loading) return;

    const userId = Cookies.get('userID');

    if (!userId) {
      // Handle logged out state
      const publicPages = ['/', '/auth/create-account'];
      const pageValid = publicPages.includes(pathname);
      setIsPageValid(pageValid);
      setIsRedirecting(false);
      
      if (!pageValid) {
        setIsRedirecting(true);
        router.push('/');
      }
      return;
    }

    if (!user) return; // Still loading user data

    // Handle logged in state - get pages accessible to this user level
    const accessiblePages = getAccessiblePages(user.register_level_status);
    const pageValid = accessiblePages.includes(pathname);

    // CRITICAL FIX: For register_level_status 2, immediately set redirecting state
    if (user.register_level_status === 2) {
      const authPages = ['/', '/auth/create-account', '/auth/complete-account', '/auth/success'];
      if (authPages.includes(pathname)) {
        setIsPageValid(false);
        setIsRedirecting(true); // Show redirecting state
        router.push('/home');
        return;
      }
    }

    // Set page validity and clear redirecting state for valid pages
    setIsPageValid(pageValid);
    setIsRedirecting(false);

    // Handle other redirect scenarios
    if (!pageValid) {
      setIsRedirecting(true);
      if (user.register_level_status === 0) {
        router.push('/');
      } else if (user.register_level_status === 1) {
        router.push('/auth/complete-account');
      } else if (user.register_level_status === 2) {
        router.push('/home');
      }
    }
  }, [hasInitialized, loading, user, pathname, router, getAccessiblePages]);

  // Reset initialization on pathname change to handle navigation
  useEffect(() => {
    setHasInitialized(false);
    setIsRedirecting(false);
  }, [pathname]);

  return {
    user,
    loading,
    isPageValid,
    error,
    isRedirecting
  };
};

export default useFetchUserDetails;