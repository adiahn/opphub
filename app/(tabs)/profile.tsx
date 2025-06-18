import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface UserProfile {
  name: string;
  bio: string;
  location: string;
  stars: number;
}

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

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) throw new Error('No token found');
        const response = await fetch('https://oppotunitieshubbackend.onrender.com/api/profile/basic', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setProfile(data);
      } catch (e) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  function getInitials(name: string) {
    if (!name) return '';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  }

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
            <View style={styles.initialsCircle}>
              <ThemedText style={styles.initialsText}>
                {profile ? getInitials(profile.name) : ''}
              </ThemedText>
            </View>
            <View style={styles.editOverlay}>
              <IconSymbol name="camera.fill" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            {loading ? (
              <ThemedText style={styles.name}>Loading...</ThemedText>
            ) : profile ? (
              <>
                <ThemedText style={styles.name}>{profile.name}</ThemedText>
                {profile.bio && <ThemedText style={styles.bio}>{profile.bio}</ThemedText>}
                {profile.location && (
                  <ThemedText style={styles.location}>{profile.location}</ThemedText>
                )}
                <View style={styles.levelBadge}>
                  <ThemedText style={styles.levelText}>Level {profile.stars}</ThemedText>
                </View>
              </>
            ) : (
              <ThemedText style={styles.name}>Profile not found</ThemedText>
            )}
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
  location: {
    fontSize: 15,
    color: '#888',
    marginBottom: 8,
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
  initialsCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  initialsText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '700',
  },
  levelBadge: {
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'center',
    marginBottom: 12,
  },
  levelText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
}); 