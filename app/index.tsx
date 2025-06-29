import { Redirect } from 'expo-router';

export default function Index() {
  // Let AuthNavigator handle the routing based on onboarding and auth status
  return <Redirect href="/(tabs)/home" />;
} 