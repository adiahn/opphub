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
  const rootNavigationState = useRootNavigationState();
  const pathname = usePathname();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have a stored token
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
          // Token exists, dispatch checkAuthStatus to validate it
          await dispatch(checkAuthStatus()).unwrap();
        }
      } catch (error) {
        console.log('No valid token found or token expired', error);
      } finally {
        setIsAuthInitialized(true);
      }
    };

    initializeAuth();
  }, [dispatch]);

  useEffect(() => {
    // Wait for auth to be initialized and navigation to be ready
    if (!isAuthInitialized || !rootNavigationState?.key || loading) {
      return;
    }

    if (isAuthenticated) {
      // If authenticated, redirect to home from login/signup
      if (pathname === '/login' || pathname === '/signup') {
        router.replace('/(tabs)/home');
      }
    } else {
      // If not authenticated, redirect to login unless already there
      if (pathname !== '/login' && pathname !== '/signup') {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, loading, isAuthInitialized, rootNavigationState?.key, pathname]);

  return null; // This component doesn't render anything
} 