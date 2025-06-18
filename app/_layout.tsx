import { useColorScheme } from '@/hooks/useColorScheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import React from 'react';

const queryClient = new QueryClient();

export default function RootLayout() {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';

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
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Back' }} />
        <Stack.Screen 
          name="profile/edit" 
          options={{ 
            headerShown: true,
            title: 'Edit Profile',
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="post/[id]" 
          options={{ 
            headerShown: false,
            presentation: 'card',
          }} 
        />
      </Stack>
    </QueryClientProvider>
  );
}
