import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

const MENU_ITEMS = [
  {
    id: 'profile',
    title: 'Profile',
    icon: 'person.fill',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: 'bell.fill',
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'gearshape.fill',
  },
  {
    id: 'help',
    title: 'Help & Support',
    icon: 'questionmark.circle.fill',
  },
  {
    id: 'about',
    title: 'About',
    icon: 'info.circle.fill',
  },
];

export default function MoreScreen() {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';

  const handleMenuItemPress = (id: string) => {
    // Handle menu item press
    console.log('Menu item pressed:', id);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>More</ThemedText>
      </ThemedView>

      <ScrollView style={styles.content}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleMenuItemPress(item.id)}
          >
            <ThemedView style={styles.menuItemContent}>
              <IconSymbol
                name={item.icon}
                size={24}
                color={isDark ? Colors.dark.icon : Colors.light.icon}
                style={styles.menuItemIcon}
              />
              <ThemedText style={styles.menuItemTitle}>{item.title}</ThemedText>
            </ThemedView>
            <IconSymbol
              name="chevron.right"
              size={20}
              color={isDark ? Colors.dark.icon : Colors.light.icon}
            />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutButton}>
          <ThemedText style={styles.logoutText}>Log Out</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    marginRight: 12,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 32,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 