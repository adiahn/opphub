import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTheme } from '@/hooks/useTheme';
import { UserProfile } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, Alert, Dimensions, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../services/authSlice';
import { performCheckIn } from '../../services/checkInSlice';
import { fetchProfile } from '../../services/profileSlice';
import type { AppDispatch, RootState } from '../../services/store';

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

const ProfileDetailRow = ({ icon, title, content, onPress }: { icon: any, title: string, content: string | null, onPress?: () => void }) => {
  if (!content) return null;
  const { colors } = useTheme();

  const contentElement = (
    <View style={styles.detailRowContent}>
      <IconSymbol name={icon} size={20} color={colors.text} style={styles.detailRowIcon} />
      <ThemedText style={styles.detailRowTitle}>{title}</ThemedText>
      <ThemedText style={styles.detailRowText} numberOfLines={1} ellipsizeMode="tail">
        {content}
      </ThemedText>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.detailRow}>
        {contentElement}
        <IconSymbol name="chevron.right" size={16} color={colors.text} style={styles.detailRowChevron} />
      </TouchableOpacity>
    );
  }

  return <View style={styles.detailRow}>{contentElement}</View>;
};

export default function ProfileScreen() {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const dispatch = useDispatch<AppDispatch>();

  // Get profile data from Redux store with proper typing
  const profileState = useSelector((state: RootState): ProfileState => state.profile as ProfileState);
  const { data: userProfile, loading: profileLoading } = profileState;

  const checkInState = useSelector((state: RootState) => state.checkIn);
  const { loading: checkInLoading, todayCheckedIn, streak } = checkInState;

  const authState = useSelector((state: RootState) => state.auth);
  const { loading: logoutLoading } = authState;

  // Refresh profile data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Only fetch if we are not currently loading and if there is no profile data yet.
      // This prevents the infinite loop on repeated auth failures.
      if (!profileLoading && !userProfile) {
        dispatch(fetchProfile());
      }
    }, [dispatch, profileLoading, userProfile])
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

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(logout()).unwrap();
              Toast.show({
                type: 'success',
                text1: 'Logged out successfully',
              });
              // Navigate to login page after successful logout
              router.replace('/login');
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Logout failed',
                text2: 'Please try again',
              });
            }
          },
        },
      ]
    );
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
                {userProfile ? getInitials(userProfile.name) : ''}
              </ThemedText>
            </View>
          </View>
          <View style={styles.profileInfo}>
            {profileLoading ? (
              <ThemedText style={styles.name}>Loading...</ThemedText>
            ) : userProfile ? (
              <>
                <ThemedText style={styles.name}>{userProfile.name}</ThemedText>
                <View style={[styles.levelBadge, { backgroundColor: levelColors[userProfile.level] || '#A0A0A0' }]}> 
                  <ThemedText style={styles.levelText}>{userProfile.level}</ThemedText>
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
            Current Streak: <ThemedText style={styles.streakValue}>{userProfile?.streak?.current ?? 0} days</ThemedText>
          </ThemedText>
          <ThemedText style={styles.streakText}>
            Longest Streak: <ThemedText style={styles.streakValue}>{userProfile?.streak?.longest ?? 0} days</ThemedText>
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

      {/* Profile Details Card */}
      {userProfile?.profile ? (
        <View style={styles.infoCard}>
          <ProfileDetailRow icon="person.text.rectangle" title="Bio" content={userProfile.profile.bio} />
          <ProfileDetailRow icon="location.fill" title="Location" content={userProfile.profile.location} />
          <ProfileDetailRow icon="link" title="Website" content={userProfile.profile.website} onPress={() => handleOpenLink(userProfile.profile.website)} />
          <ProfileDetailRow icon="chevron.left.slash.chevron.right" title="GitHub" content={userProfile.profile.github} onPress={() => handleOpenLink(userProfile.profile.github)} />
          <ProfileDetailRow icon="network" title="LinkedIn" content={userProfile.profile.linkedin} onPress={() => handleOpenLink(userProfile.profile.linkedin)} />
        </View>
      ) : (
        <View style={styles.infoCard}>
          <ThemedText>No profile details available.</ThemedText>
        </View>
      )}

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
          onPress={handleLogout}
          disabled={logoutLoading}
          accessibilityLabel="Log out of your account"
        >
          {logoutLoading ? (
            <ActivityIndicator color="#FF3B30" size="small" />
          ) : (
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#FF3B30" />
          )}
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
    marginVertical: 12,
  },
  content: {
    padding: 16,
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
  streakValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  checkInButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  checkInButtonDisabled: {
    backgroundColor: Colors.light.tabIconDefault,
  },
  checkInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailRowIcon: {
    marginRight: 12,
  },
  detailRowTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  detailRowText: {
    flex: 1,
    color: '#666',
    textAlign: 'right',
    marginLeft: 16,
  },
  detailRowChevron: {
    marginLeft: 8,
    opacity: 0.6,
  },
}); 