import { router, usePathname, useRootNavigationState } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthStatus } from '../services/authSlice';
import type { AppDispatch, RootState } from '../services/store';

export function AuthNavigator() {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);
  const [hasNavigatedFromOnboarding, setHasNavigatedFromOnboarding] = useState(false);
  const rootNavigationState = useRootNavigationState();
  const pathname = usePathname();

  // Function to check onboarding status
  const checkOnboardingStatus = async () => {
    try {
      const onboardingCompleted = await SecureStore.getItemAsync('onboardingCompleted');
      const justCompletedOnboarding = await SecureStore.getItemAsync('justCompletedOnboarding');
      const userInfo = await SecureStore.getItemAsync('userInfo');
      
      let hasCompletedOnboarding = onboardingCompleted === 'true';
      
      // If user has ever logged in (has userInfo), mark onboarding as completed
      if (userInfo && !hasCompletedOnboarding) {
        console.log('AuthNavigator: User has logged in before, marking onboarding as completed');
        await SecureStore.setItemAsync('onboardingCompleted', 'true');
        hasCompletedOnboarding = true;
      }
      
      // Check if user just completed onboarding
      if (justCompletedOnboarding === 'true') {
        console.log('AuthNavigator: User just completed onboarding, setting flag');
        setHasNavigatedFromOnboarding(true);
        // Clear the flag after using it
        await SecureStore.deleteItemAsync('justCompletedOnboarding');
      }
      
      // DEBUG: Force onboarding to always show for now
      // hasCompletedOnboarding = false;
      // console.log('AuthNavigator: DEBUG - Forcing onboarding to show (hasCompletedOnboarding = false)');
      
      setIsOnboardingCompleted(hasCompletedOnboarding);
      console.log('AuthNavigator: hasCompletedOnboarding:', hasCompletedOnboarding);
      return hasCompletedOnboarding;
    } catch (error) {
      console.error('AuthNavigator: Error checking onboarding status:', error);
      return false;
    }
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
        }
      } catch (error) {
        console.log('No valid token found or token expired', error);
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
    console.log('AuthNavigator: current pathname:', pathname);
    console.log('AuthNavigator: hasNavigatedFromOnboarding:', hasNavigatedFromOnboarding);

    // If user just completed onboarding and is on login page, let them stay
    if (hasNavigatedFromOnboarding && pathname === '/login') {
      console.log('AuthNavigator: User just completed onboarding, allowing them to stay on login');
      return;
    }

    // If onboarding is not completed, show onboarding
    if (isOnboardingCompleted === false) {
      console.log('AuthNavigator: Redirecting to onboarding');
      if (pathname !== '/onboarding') {
        router.replace('/onboarding');
      }
      return;
    }

    // If onboarding is completed but user is not authenticated, go to login
    if (!isAuthenticated) {
      console.log('AuthNavigator: User not authenticated, redirecting to login');
      if (pathname !== '/login' && pathname !== '/signup') {
        router.replace('/login');
      }
      return;
    }

    // If authenticated, redirect to home from login/signup/onboarding
    if (isAuthenticated && (pathname === '/login' || pathname === '/signup' || pathname === '/onboarding')) {
      console.log('AuthNavigator: User authenticated, redirecting to home');
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, loading, isAuthInitialized, isOnboardingCompleted, hasNavigatedFromOnboarding, rootNavigationState?.key, pathname]);

  return null; // This component doesn't render anything
} 