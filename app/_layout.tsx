import { useColorScheme } from '@/hooks/useColorScheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';

const queryClient = new QueryClient();

export default function RootLayout() {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      setIsValidating(true);
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) {
          setIsValidating(false);
          return;
        }
        
        const response = await fetch('https://oppotunitieshubbackend.onrender.com/api/auth/validate', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
        });
        
        if (response.ok) {
          setIsAuthenticated(true);
          // Redirect to home if user is on login page
          router.replace('/(tabs)/home');
        } else {
          // Clear invalid token
          await SecureStore.deleteItemAsync('userToken');
          await SecureStore.deleteItemAsync('userInfo');
        }
      } catch (e) {
        // Silent fail - user stays on current page
        console.log('Session validation failed:', e);
      } finally {
        setIsValidating(false);
      }
    };
    
    validateSession();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: isDark ? '#1a1a1a' : '#fff',
          },
          headerTintColor: isDark ? '#fff' : '#000', 
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
