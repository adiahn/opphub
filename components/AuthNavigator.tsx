import { router, usePathname, useRootNavigationState } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthStatus } from '../services/authSlice';
import type { AppDispatch, RootState } from '../services/store';
import { AuthPrompt } from './AuthPrompt';

export function AuthNavigator() {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authPromptConfig, setAuthPromptConfig] = useState({
    title: '',
    message: '',
    icon: ''
  });
  const rootNavigationState = useRootNavigationState();
  const pathname = usePathname();

  // Function to check onboarding status
  const checkOnboardingStatus = async () => {
    try {
      const onboardingCompleted = await SecureStore.getItemAsync('onboardingCompleted');
      const userInfo = await SecureStore.getItemAsync('userInfo');
      
      let hasCompletedOnboarding = onboardingCompleted === 'true';
      
      // If user has ever logged in (has userInfo), mark onboarding as completed
      if (userInfo && !hasCompletedOnboarding) {
        console.log('AuthNavigator: User has logged in before, marking onboarding as completed');
        await SecureStore.setItemAsync('onboardingCompleted', 'true');
        hasCompletedOnboarding = true;
      }
      
      setIsOnboardingCompleted(hasCompletedOnboarding);
      console.log('AuthNavigator: hasCompletedOnboarding:', hasCompletedOnboarding);
      return hasCompletedOnboarding;
    } catch (error) {
      console.error('AuthNavigator: Error checking onboarding status:', error);
      return false;
    }
  };

  // Function to check if current route requires authentication
  const requiresAuth = (path: string): boolean => {
    const authRequiredRoutes = [
      '/profile',
      '/profile/edit',
      '/community', // Skills bank - requires user profile
    ];
    
    // Check if current path requires authentication
    return authRequiredRoutes.some(route => path.startsWith(route));
  };

  // Function to get auth prompt configuration based on route
  const getAuthPromptConfig = (path: string) => {
    if (path.startsWith('/profile')) {
      return {
        title: 'Profile Access Required',
        message: 'You need to log in to view and manage your profile.',
        icon: 'person-outline'
      };
    } else if (path.startsWith('/community')) {
      return {
        title: 'Skills Bank Access Required',
        message: 'You need to log in to access the Skills Bank and connect with other users.',
        icon: 'people-outline'
      };
    } else {
      return {
        title: 'Authentication Required',
        message: 'You need to log in to access this feature.',
        icon: 'lock-closed-outline'
      };
    }
  };

  // Function to check if current route is auth-related
  const isAuthRoute = (path: string): boolean => {
    const authRoutes = ['/login', '/signup', '/onboarding'];
    return authRoutes.includes(path);
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('AuthNavigator: Initializing app...');
        
        const hasCompletedOnboarding = await checkOnboardingStatus();

        // If onboarding is not completed, don't proceed with auth check
        if (!hasCompletedOnboarding) {
          console.log('AuthNavigator: Onboarding not completed, stopping here');
          setIsAuthInitialized(true);
          return;
        }

        // Check if we have a stored token
        const token = await SecureStore.getItemAsync('accessToken');
        console.log('AuthNavigator: Token exists:', !!token);
        if (token) {
          // Token exists, dispatch checkAuthStatus to validate it
          await dispatch(checkAuthStatus()).unwrap();
        } else {
          // No token found, user will be in guest mode
          setIsGuestMode(true);
        }
      } catch (error) {
        console.log('No valid token found or token expired', error);
        setIsGuestMode(true);
      } finally {
        setIsAuthInitialized(true);
        console.log('AuthNavigator: Initialization complete');
      }
    };

    initializeApp();
  }, [dispatch]);

  // Re-check onboarding status when pathname changes
  useEffect(() => {
    const recheckOnboarding = async () => {
      await checkOnboardingStatus();
    };
    
    recheckOnboarding();
  }, [pathname]);

  useEffect(() => {
    // Wait for auth to be initialized and navigation to be ready
    if (!isAuthInitialized || !rootNavigationState?.key || loading) {
      return;
    }

    console.log('AuthNavigator: Making routing decision...');
    console.log('AuthNavigator: isOnboardingCompleted:', isOnboardingCompleted);
    console.log('AuthNavigator: isAuthenticated:', isAuthenticated);
    console.log('AuthNavigator: isGuestMode:', isGuestMode);
    console.log('AuthNavigator: current pathname:', pathname);

    // If onboarding is not completed, show onboarding
    if (isOnboardingCompleted === false) {
      console.log('AuthNavigator: Redirecting to onboarding');
      if (pathname !== '/onboarding') {
        router.replace('/onboarding');
      }
      return;
    }

    // Check if current route requires authentication
    if (requiresAuth(pathname)) {
      if (!isAuthenticated) {
        console.log('AuthNavigator: Route requires auth but user not authenticated, showing auth prompt');
        const config = getAuthPromptConfig(pathname);
        setAuthPromptConfig(config);
        setShowAuthPrompt(true);
        return;
      }
    }

    // If user is trying to access auth routes while authenticated, redirect to home
    if (isAuthenticated && isAuthRoute(pathname)) {
      console.log('AuthNavigator: User authenticated, redirecting to home');
      router.replace('/(tabs)/home');
      return;
    }

    // If user is not authenticated and trying to access auth routes, let them stay
    if (!isAuthenticated && isAuthRoute(pathname)) {
      console.log('AuthNavigator: User not authenticated on auth route, allowing access');
      return;
    }

    // For all other cases, allow access (guest mode for content browsing)
    console.log('AuthNavigator: Allowing access to route:', pathname);
    setShowAuthPrompt(false);
  }, [isAuthenticated, loading, isAuthInitialized, isOnboardingCompleted, isGuestMode, rootNavigationState?.key, pathname]);

  // Show auth prompt if needed
  if (showAuthPrompt) {
    return (
      <AuthPrompt
        title={authPromptConfig.title}
        message={authPromptConfig.message}
        icon={authPromptConfig.icon}
      />
    );
  }

  return null; // This component doesn't render anything
} 