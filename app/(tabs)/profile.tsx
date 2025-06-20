import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, Dimensions, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { performCheckIn } from '../../services/checkInSlice';
import { fetchProfile } from '../../services/profileSlice';
import type { AppDispatch, RootState } from '../../services/store';

interface ProfileData {
  bio: string;
  location: string;
  website: string | null;
  github: string | null;
  linkedin: string | null;
  skills: any[];
  projects: any[];
  achievements: any[];
  education: any[];
  workExperience: any[];
}

interface UserProfile {
  profile: ProfileData;
  streak: {
    current: number;
    longest: number;
    lastCheckIn: string | null;
  };
  _id: string;
  email: string;
  name: string;
  xp: number;
  level: string;
  stars: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ProfileState {
  data: UserProfile | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const { width } = Dimensions.get('window');

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

export default function ProfileScreen() {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const dispatch = useDispatch<AppDispatch>();

  // Get profile data from Redux store with proper typing
  const profileState = useSelector((state: RootState): ProfileState => state.profile as ProfileState);
  const { data: profile, loading: profileLoading } = profileState;

  const checkInState = useSelector((state: RootState) => state.checkIn);
  const { loading: checkInLoading, todayCheckedIn, streak } = checkInState;

  // Load profile data if not already loaded
  React.useEffect(() => {
    if (!profile) {
      dispatch(fetchProfile());
    }
  }, [dispatch, profile]);

  // Refresh profile data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchProfile());
    }, [dispatch])
  );

  function getInitials(name: string) {
    if (!name) return '';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  }

  const handleOpenLink = async (url: string | null) => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  const handleCheckIn = async () => {
    try {
      const result = await dispatch(performCheckIn()).unwrap();
      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: result.message,
      });
      // Refresh profile data after successful check-in
      dispatch(fetchProfile());
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'Failed to check in',
      });
    }
  };

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
            {profileLoading ? (
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

      {/* Check-in Card */}
      <View style={styles.infoCard}>
        <View style={styles.streakContainer}>
          <ThemedText style={styles.streakText}>
            Current Streak: {streak.current} days
          </ThemedText>
          <ThemedText style={styles.streakText}>
            Longest Streak: {streak.longest} days
          </ThemedText>
        </View>
        <TouchableOpacity
          style={[
            styles.checkInButton,
            todayCheckedIn && styles.checkInButtonDisabled
          ]}
          onPress={handleCheckIn}
          disabled={todayCheckedIn || checkInLoading}
          accessibilityLabel={todayCheckedIn ? "You've already checked in today" : "Check in for today"}
        >
          {checkInLoading ? (
            <ActivityIndicator color={Colors.light.background} />
          ) : (
            <ThemedText style={styles.checkInButtonText}>
              {todayCheckedIn ? "Already Checked In" : "Daily Check-in"}
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>

      {/* Bio and Location Card */}
      <View style={styles.infoCard}>
        <ThemedText style={styles.sectionTitle}>Bio</ThemedText>
        <ThemedText style={styles.sectionContent}>
          {profile?.profile?.bio ? profile.profile.bio : 'No bio provided yet. Add your bio to let others know more about you!'}
        </ThemedText>
        <View style={styles.divider} />
        <ThemedText style={styles.sectionTitle}>Location</ThemedText>
        <ThemedText style={styles.sectionContent}>
          {profile?.profile?.location ? profile.profile.location : 'No location set. Add your location to connect with others nearby!'}
        </ThemedText>
      </View>

      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.editProfileButton} 
          onPress={() => router.push('/profile/edit')}
          accessibilityLabel="Edit your profile"
        >
          <ThemedText style={styles.editProfileText}>Edit Profile</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.logoutButton}
          accessibilityLabel="Log out of your account"
        >
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
  initialsShadowWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 12,
  },
  initialsCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  profileInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  content: {
    padding: 20,
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
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '600',
  },
  checkInButton: {
    backgroundColor: Colors.light.tint,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInButtonDisabled: {
    backgroundColor: Colors.light.tabIconDefault,
  },
  checkInButtonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: '600',
  },
}); 