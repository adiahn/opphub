import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs, useRouter } from 'expo-router';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '../../services/store';

const AUTHENTICATED_TAB_CONFIG = [
  { name: 'home', label: 'Home', icon: 'home-outline' },
  { name: 'search', label: 'Search', icon: 'search-outline' },
  { name: 'community', label: 'Skills Bank', icon: 'people-outline' },
  { name: 'profile', label: 'Profile', icon: 'person-outline' },
];

const GUEST_TAB_CONFIG = [
  { name: 'home', label: 'Home', icon: 'home-outline' },
  { name: 'search', label: 'Search', icon: 'search-outline' },
  { name: 'login', label: 'Sign In', icon: 'log-in-outline' },
];

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const colorSet = Colors[theme];
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Use different tab config based on authentication status
  const tabConfig = isAuthenticated ? AUTHENTICATED_TAB_CONFIG : GUEST_TAB_CONFIG;

  const handleTabPress = (routeName: string) => {
    if (routeName === 'login') {
      // Navigate to login screen
      router.push('/login');
      return;
    }
    
    // For other tabs, use normal navigation
    const event = navigation.emit({
      type: 'tabPress',
      target: routeName,
      canPreventDefault: true,
    });
    
    if (!event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  return (
    <View style={styles.tabBarContainer}>
      <View style={[styles.tabBar, { backgroundColor: colorSet.card, shadowColor: colorSet.icon }] }>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;
          const isFocused = state.index === index;
          const tabConfigItem = tabConfig.find(tab => tab.name === route.name);
          const tabLabel = typeof tabConfigItem?.label === 'string' ? tabConfigItem.label : (typeof label === 'string' ? label : '');
          const iconName = tabConfigItem?.icon || 'ellipse-outline';
          
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={() => handleTabPress(route.name)}
              style={styles.tabItem}
              activeOpacity={0.8}
            >
              <Ionicons
                name={iconName as any}
                size={24}
                color={isFocused ? (isDark ? '#4A90E2' : colorSet.tint) : colorSet.textSecondary}
                style={isFocused ? styles.tabIconActive : styles.tabIcon}
              />
              <ThemedText style={[
                styles.tabLabel,
                { color: isFocused ? (isDark ? '#4A90E2' : colorSet.tint) : colorSet.textSecondary },
                isFocused && styles.tabLabelActive,
              ]}>{tabLabel}</ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="search" />
      {isAuthenticated ? (
        <>
          <Tabs.Screen name="community" />
          <Tabs.Screen name="profile" />
        </>
      ) : (
        <Tabs.Screen 
          name="login" 
          options={{
            href: null, // This prevents the tab from being rendered as a screen
          }}
        />
      )}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: Platform.OS === 'ios' ? 32 : 16,
    zIndex: 100,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minWidth: 60,
  },
  tabIcon: {
    marginBottom: 2,
  },
  tabIconActive: {
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
});
