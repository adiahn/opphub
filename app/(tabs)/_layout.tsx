import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TAB_CONFIG = [
  { name: 'home', label: 'Home', icon: 'home-outline' },
  { name: 'search', label: 'Search', icon: 'search-outline' },
  { name: 'community', label: 'Community', icon: 'people-outline' },
  { name: 'profile', label: 'Profile', icon: 'person-outline' },
];

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;
          const isFocused = state.index === index;
          const tabConfig = TAB_CONFIG.find(tab => tab.name === route.name);
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              style={styles.tabItem}
              activeOpacity={0.8}
            >
              <Ionicons
                name={tabConfig?.icon as any || 'ellipse-outline'}
                size={24}
                color={isFocused ? Colors.light.tint : '#b0b8c1'}
                style={isFocused ? styles.tabIconActive : styles.tabIcon}
              />
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{typeof (tabConfig?.label) === 'string' ? tabConfig.label : ''}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="community" />
      <Tabs.Screen name="profile" />
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
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 8,
    shadowColor: '#000',
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
    color: '#b0b8c1',
    fontWeight: '500',
    marginTop: 2,
  },
  tabLabelActive: {
    color: Colors.light.tint,
    fontWeight: '700',
  },
});
