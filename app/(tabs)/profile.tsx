import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const QuickAction = ({ icon, title, onPress }: { icon: string; title: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress}>
    <View style={styles.quickActionIcon}>
      <IconSymbol name={icon} size={24} color={Colors.light.tint} />
    </View>
    <ThemedText style={styles.quickActionTitle}>{title}</ThemedText>
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';

  return (
    <ScrollView style={styles.container} bounces={false}>
      <LinearGradient
        colors={isDark ? ['#1a1a1a', '#2a2a2a'] : ['#f8f9fa', '#e9ecef']}
        style={styles.header}
      >
        <View style={styles.profileHeader}>
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={() => router.push('/profile/edit')}
          >
            <Image
              source={{ uri: 'https://via.placeholder.com/150' }}
              style={styles.profileImage}
            />
            <View style={styles.editOverlay}>
              <IconSymbol name="camera.fill" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <ThemedText style={styles.name}>Adnan Mukhtar</ThemedText>
            <ThemedText style={styles.bio}>Software Engineer | React Native Developer</ThemedText>
            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={() => router.push('/profile/edit')}
            >
              <ThemedText style={styles.editProfileText}>Edit Profile</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.quickActions}>
          <QuickAction 
            icon="heart.fill" 
            title="Favorites" 
            onPress={() => router.push('/(tabs)/favourites')} 
          />
          <QuickAction 
            icon="person.2.fill" 
            title="Connections" 
            onPress={() => console.log('Connections')} 
          />
          <QuickAction 
            icon="bell.fill" 
            title="Notifications" 
            onPress={() => console.log('Notifications')} 
          />
          <QuickAction 
            icon="gear" 
            title="Settings" 
            onPress={() => console.log('Settings')} 
          />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>245</ThemedText>
            <ThemedText style={styles.statLabel}>Connections</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>12</ThemedText>
            <ThemedText style={styles.statLabel}>Projects</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>89</ThemedText>
            <ThemedText style={styles.statLabel}>Favorites</ThemedText>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#FF3B30" />
          <ThemedText style={styles.logoutText}>Log Out</ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.light.tint,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 16,
  },
  editProfileButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.tint,
  },
  editProfileText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickAction: {
    alignItems: 'center',
    width: (width - 40) / 4,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 