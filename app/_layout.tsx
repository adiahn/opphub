import { useColorScheme } from '@/hooks/useColorScheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import React, { useState } from 'react';

const queryClient = new QueryClient();

export default function RootLayout() {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen 
              name="post/[id]" 
              options={{ 
                headerShown: true,
                headerTitle: 'Post Details',
                headerBackTitle: 'Back'
              }} 
            />
          </>
        )}
      </Stack>
    </QueryClientProvider>
  );
}
