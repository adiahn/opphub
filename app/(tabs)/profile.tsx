import { ThemedText } from '@/components/ThemedText';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { UserProfile } from '@/types';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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

// Helper function to extract username from URL
function extractUsername(url) {
  if (!url) return '';
  const parts = url.split('/').filter(Boolean);
  return parts[parts.length - 1] || url;
}

export default function ProfileScreen() {
    const { colors, theme } = useTheme();
    const isDark = theme === 'dark';
    const dispatch = useDispatch<AppDispatch>();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);

    const profileState = useSelector((state: RootState): ProfileState => state.profile as ProfileState);
    const { data: userProfile, loading: profileLoading } = profileState;

    const checkInState = useSelector((state: RootState) => state.checkIn);
    const { loading: checkInLoading, todayCheckedIn } = checkInState;

    const authState = useSelector((state: RootState) => state.auth);
    const { loading: logoutLoading, isAuthenticated } = authState;

    useFocusEffect(
        useCallback(() => {
          if (isAuthenticated && !profileLoading && !userProfile) {
            dispatch(fetchProfile());
          }
        }, [dispatch, isAuthenticated, profileLoading, userProfile])
    );

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            if (isAuthenticated) {
                await dispatch(fetchProfile()).unwrap();
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Failed to refresh profile',
            });
        } finally {
            setIsRefreshing(false);
        }
    }, [dispatch, isAuthenticated]);

    const handleCheckIn = async () => {
        try {
            const result = await dispatch(performCheckIn()).unwrap();
            Toast.show({
                type: 'success',
                text1: 'Success!',
                text2: result.message,
            });
        } catch (error: any) {
            const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to check in';

            if (errorMessage.toLowerCase().includes('already checked in')) {
                Toast.show({
                    type: 'info',
                    text1: 'Already Committed',
                    text2: 'You have already committed for today, come back tomorrow.',
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: errorMessage,
                });
            }
        }
    };

    const handleLogout = () => {
        setLogoutModalVisible(true);
    };

    const executeLogout = async () => {
        setLogoutModalVisible(false);
        try {
            await dispatch(logout()).unwrap();
            Toast.show({
              type: 'success',
              text1: 'Logged out successfully',
            });
            router.replace('/login');
        } catch (error) {
            Toast.show({ 
                type: 'error', 
                text1: 'Logout failed',
                text2: 'Please try again'
            });
        }
    };

    // Calculate completion percentage
    const completionFields = [
        userProfile?.profile?.bio?.trim(),
        userProfile?.profile?.location?.trim(),
        userProfile?.profile?.website?.trim(),
        userProfile?.profile?.github?.trim(),
        userProfile?.profile?.linkedin?.trim(),
        (userProfile?.profile?.skills && userProfile.profile.skills.length > 0) ? '1' : ''
    ];
    const filledFields = completionFields.filter(Boolean).length;
    const completionPercent = Number.isFinite(filledFields) && Number.isFinite(completionFields.length) && completionFields.length > 0
      ? (filledFields / completionFields.length) * 100
      : 0;

    // Find the card that shows the user's name and streak count
    const levelColors = {
      'Newcomer': { start: '#d3d3d3', end: '#a9a9a9' },
      'Explorer': { start: '#5dade2', end: '#2e86c1' },
      'Contributor': { start: '#58d68d', end: '#229954' },
      'Collaborator': { start: '#f7dc6f', end: '#f1c40f' },
      'Achiever': { start: '#f5b041', end: '#d35400' },
      'Expert': { start: '#bb8fce', end: '#8e44ad' },
      'Legend': { start: '#ec7063', end: '#c0392b' },
    };
    const levelColor = levelColors[userProfile?.level] || levelColors['Newcomer'];

    // Guard: if userProfile or userProfile.profile is missing, show loading spinner
    if (profileLoading || !userProfile || !userProfile.profile) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }] }>
                <ActivityIndicator size="large" color={isDark ? '#4A90E2' : colors.primary} />
            </View>
        );
    }

    // Use lighter blue for all blue accents in dark mode
    const blue = isDark ? '#4A90E2' : colors.tint;
    const bluePrimary = isDark ? '#4A90E2' : colors.primary;

    return (
        <View style={{flex: 1, backgroundColor: colors.background}}>
            <ScrollView 
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                    />
                }
            >
                <LinearGradient colors={[levelColor.start, levelColor.end]} style={styles.profileCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.avatarNoBg}>
                            {userProfile?.name ? (
                                <Image
                                    source={{ uri: `https://robohash.org/${userProfile.name}.png?set=set4` }}
                                    style={styles.avatarImageFull}
                                />
                            ) : null}
                        </View>
                        <View style={styles.userInfo}>
                            <ThemedText style={[styles.name, { color: '#fff' }]}>{userProfile?.name}</ThemedText>
                            <ThemedText style={[styles.levelText, { color: '#fff' }]}>{userProfile?.level}</ThemedText>
                            <ThemedText style={[styles.xpText, { color: '#fff' }]}>XP: {userProfile?.xp ?? 0}</ThemedText>
                        </View>
                    </View>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <ThemedText style={[styles.statValue, { color: '#fff' }]}>{userProfile?.streak?.current ?? 0}</ThemedText>
                            <ThemedText style={[styles.statTitle, { color: '#fff' }]}>Current Streak</ThemedText>
                        </View>
                        <View style={[styles.statSeparator, { backgroundColor: isDark ? '#23272F' : '#E0E0E0' }]} />
                        <View style={styles.statItem}>
                            <ThemedText style={[styles.statValue, { color: '#fff' }]}>{userProfile?.streak?.longest ?? 0}</ThemedText>
                            <ThemedText style={[styles.statTitle, { color: '#fff' }]}>Longest Streak</ThemedText>
                        </View>
                    </View>
                </LinearGradient>

                <View style={[styles.detailsCard, { backgroundColor: colors.card }] }>
                    <View style={styles.detailRow}>
                        <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>State</ThemedText>
                        <ThemedText style={[styles.detailValue, { color: colors.text }]}>{userProfile?.profile?.location || 'Not specified'}</ThemedText>
                    </View>
                    <View style={styles.detailRow}>
                        <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>Website</ThemedText>
                        <ThemedText style={[styles.detailValue, { color: colors.text }]}>{userProfile?.profile?.website ? extractUsername(userProfile.profile.website) : 'Not specified'}</ThemedText>
                    </View>
                    <View style={styles.detailRow}>
                        <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>GitHub</ThemedText>
                        <ThemedText style={[styles.detailValue, { color: colors.text }]}>{userProfile?.profile?.github ? extractUsername(userProfile.profile.github) : 'Not specified'}</ThemedText>
                    </View>
                    <View style={styles.detailRow}>
                        <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>LinkedIn</ThemedText>
                        <ThemedText style={[styles.detailValue, { color: colors.text }]}>{userProfile?.profile?.linkedin ? extractUsername(userProfile.profile.linkedin) : 'Not specified'}</ThemedText>
                    </View>
                </View>

                <View style={[styles.actionsCard, { backgroundColor: colors.card }] }>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/profile/edit')}>
                            <FontAwesome5 name="user-edit" size={20} color={blue} style={styles.actionIcon} />
                            <ThemedText style={[styles.actionText, { color: blue }]}>Edit Profile</ThemedText>
                            <FontAwesome5 name="chevron-right" size={16} color={blue} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/about')}>
                            <FontAwesome5 name="info-circle" size={20} color={blue} style={styles.actionIcon} />
                            <ThemedText style={[styles.actionText, { color: blue }]}>About Us</ThemedText>
                            <FontAwesome5 name="chevron-right" size={16} color={blue} />
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.actionSeparator, {backgroundColor: colors.background}]} />
                    <TouchableOpacity style={styles.actionRow} onPress={handleLogout} disabled={logoutLoading}>
                         {logoutLoading ? <ActivityIndicator color="#FF3B30" /> : (
                             <>
                                <FontAwesome5 name="sign-out-alt" size={20} color="#FF3B30" style={styles.actionIcon} />
                                <ThemedText style={[styles.actionText, {color: "#FF3B30"}]}>Log Out</ThemedText>
                             </>
                         )}
                    </TouchableOpacity>
                </View>

            </ScrollView>

            <ConfirmationModal
                visible={isLogoutModalVisible}
                onClose={() => setLogoutModalVisible(false)}
                onConfirm={executeLogout}
                title="Confirm Logout"
                message="Are you sure you want to log out?"
                confirmText="Log Out"
                isDestructive
            />

            <TouchableOpacity
                style={[
                  styles.fab,
                  { backgroundColor: blue, shadowColor: colors.icon, shadowOpacity: isDark ? 0 : 0.2, shadowRadius: isDark ? 0 : 6, elevation: isDark ? 0 : 8 },
                  (todayCheckedIn || checkInLoading) && styles.fabDisabled
                ]}
                onPress={handleCheckIn}
                disabled={todayCheckedIn || checkInLoading}
            >
                {checkInLoading ? <ActivityIndicator color="#FFFFFF" /> : (
                    <>
                        <FontAwesome5 name="hammer" size={20} color="#FFFFFF" />
                        <ThemedText style={styles.fabText}>Commit</ThemedText>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingTop: 80,
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    profileCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarNoBg: {
        marginRight: 20,
    },
    avatarImageFull: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
    },
    userInfo: {
        flex: 1,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    levelText: {
        fontSize: 14,
        fontWeight: '500',
    },
    xpText: {
        fontSize: 14,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingTop: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    statTitle: {
        fontSize: 12,
        textTransform: 'uppercase',
    },
    statSeparator: {
        width: 1,
        backgroundColor: '#E0E0E0',
    },
    detailsCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    detailLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 16,
        flexShrink: 1,
        textAlign: 'right',
    },
    skillsContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
    },
    skillBadge: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        marginLeft: 8,
        marginTop: 8,
    },
    skillText: {
        fontSize: 14,
        fontWeight: '500',
    },
    separator: {
        height: 1,
        marginVertical: 10,
    },
    actionsCard: {
        borderRadius: 20,
        paddingHorizontal: 10,
        marginBottom: 24,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 10,
    },
    actionIcon: {
        marginRight: 16,
        width: 24,
        textAlign: 'center',
    },
    actionText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    actionSeparator: {
        height: 1,
    },
    fab: {
        position: 'absolute',
        bottom: 150,
        right: 20,
        borderRadius: 30,
        paddingVertical: 14,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 8,
    },
    fabDisabled: {
        backgroundColor: Colors.light.textSecondary,
    },
    fabText: {
        color: Colors.light.card,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    }
}); 