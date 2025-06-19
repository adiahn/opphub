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
  level: string;
}

export default function ProfileScreen() {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Level color mapping
  const levelColors: Record<string, string> = {
    'Newcomer': '#A0A0A0',      // Gray
    'Explorer': '#3498db',      // Blue
    'Contributor': '#27ae60',   // Green
    'Collaborator': '#f1c40f',  // Yellow
    'Achiever': '#e67e22',      // Orange
    'Expert': '#9b59b6',        // Purple
    'Legend': '#e74c3c',        // Red
  };

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        // First, try to load cached profile for instant display
        const cachedProfile = await SecureStore.getItemAsync('userProfile');
        if (cachedProfile) {
          setProfile(JSON.parse(cachedProfile));
          setLoading(false);
        }
        
        // Then fetch fresh data in background
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) throw new Error('No token found');
        
        const response = await fetch('https://oppotunitieshubbackend.onrender.com/api/profile/basic', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          // Update cached profile
          await SecureStore.setItemAsync('userProfile', JSON.stringify(data));
        }
      } catch (e) {
        console.error('Profile fetch error:', e);
        // Don't clear profile if we have cached data
        if (!profile) {
          setProfile(null);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
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
          <View style={styles.initialsShadowWrapper}>
            <View style={styles.initialsCircle}>
              <ThemedText style={styles.initialsText} numberOfLines={1} adjustsFontSizeToFit>
                {profile ? getInitials(profile.name) : ''}
              </ThemedText>
            </View>
          </View>
          <View style={styles.profileInfo}>
            {loading ? (
              <ThemedText style={styles.name}>Loading...</ThemedText>
            ) : profile ? (
              <>
                <ThemedText style={styles.name}>{profile.name}</ThemedText>
                <View style={[styles.levelBadge, { backgroundColor: levelColors[profile.level] || '#A0A0A0' }]}> 
                  <ThemedText style={styles.levelText}>{profile.level}</ThemedText>
                </View>
              </>
            ) : (
              <ThemedText style={styles.name}>Profile not found</ThemedText>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Bio and Location Card */}
      <View style={styles.infoCard}>
        <ThemedText style={styles.sectionTitle}>Bio</ThemedText>
        <ThemedText style={styles.sectionContent}>
          {profile?.bio ? profile.bio : 'No bio provided yet. Add your bio to let others know more about you!'}
        </ThemedText>
        <View style={styles.divider} />
        <ThemedText style={styles.sectionTitle}>Location</ThemedText>
        <ThemedText style={styles.sectionContent}>
          {profile?.location ? profile.location : 'No location set. Add your location to connect with others nearby!'}
        </ThemedText>
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.editProfileButton} onPress={() => router.push('/profile/edit')}>
          <ThemedText style={styles.editProfileText}>Edit Profile</ThemedText>
        </TouchableOpacity>
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
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: Colors.light.tint,
    alignItems: 'center',
    marginBottom: 16,
  },
  editProfileText: {
    color: '#fff',
    fontSize: 15,
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
  initialsShadowWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 12,
  },
  initialsCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    display: 'flex',
  },
  initialsText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
    height: undefined,
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
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 20,
    marginTop: -30,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.tint,
    marginBottom: 4,
  },
  sectionContent: {
    fontSize: 15,
    color: '#222',
    marginBottom: 12,
    opacity: 0.85,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
}); 