import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SkillLevel } from '@/types/user';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, updateProfile } from '../../services/profileSlice';
import type { AppDispatch, RootState } from '../../services/store';

// Define interfaces for API response
interface ProfileData {
  bio: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
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

const { width } = Dimensions.get('window');

const ProfileSection = ({ title, children, isComplete }: { title: string; children: React.ReactNode; isComplete: boolean }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      {isComplete ? (
        <View style={styles.completeBadge}>
          <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
          <ThemedText style={styles.completeBadgeText}>Complete</ThemedText>
        </View>
      ) : (
        <View style={styles.incompleteBadge}>
          <Ionicons name="time" size={20} color="#f39c12" />
          <ThemedText style={styles.incompleteBadgeText}>In Progress</ThemedText>
        </View>
      )}
    </View>
    <View style={styles.sectionContent}>
      {typeof children === 'string' ? <ThemedText>{children}</ThemedText> : children}
    </View>
  </View>
);

const SKILL_LEVELS: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

// Add selector type
const selectProfile = (state: RootState) => state.profile;

// Helper function for URL validation
function isValidUrl(url: string) {
  if (!url) return true; // Allow empty
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

const showToast = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    // For iOS, we'll use a more subtle notification method later
    // For now, just show the toast in the success container
  }
};

export default function EditProfileScreen() {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const colorSet = Colors[theme];
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  
  // Get profile data from Redux store with proper typing
  const { data: profile, loading, error: reduxError } = useSelector(selectProfile);
  
  // Local state for form fields
  const [skill, setSkill] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load profile data
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Update local state when profile data changes
  useEffect(() => {
    if (profile && profile.profile) {
      setSkill(profile.profile.bio || '');
      setLocation(profile.profile.location || '');
      setWebsite(profile.profile.website || '');
      setGithub(profile.profile.github || '');
      setLinkedin(profile.profile.linkedin || '');
    } else {
      setSkill('');
      setLocation('');
      setWebsite('');
      setGithub('');
      setLinkedin('');
    }
  }, [profile]);

  // Calculate completion percentage
  const completionFields = [
    skill.trim(),
    location.trim(),
    website.trim(),
    github.trim(),
    linkedin.trim(),
    (profile && profile.profile && profile.profile.skills && profile.profile.skills.length > 0) ? '1' : ''
  ];
  const filledFields = completionFields.filter(Boolean).length;
  const completionPercent = Number.isFinite(filledFields) && Number.isFinite(completionFields.length) && completionFields.length > 0
    ? (filledFields / completionFields.length) * 100
    : 0;

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (!skill.trim() || !location.trim()) {
      setError('Skill and location are required.');
      return;
    }
    if (!isValidUrl(website)) {
      setError('Please enter a valid website URL (including https://).');
      return;
    }
    if (!isValidUrl(github)) {
      setError('Please enter a valid GitHub URL (including https://).');
      return;
    }
    if (!isValidUrl(linkedin)) {
      setError('Please enter a valid LinkedIn URL (including https://).');
      return;
    }

    setIsSaving(true);
    try {
      // Structure the update data to match the API requirements
      const updateData = {
        bio: skill.trim(),
        location: location.trim(),
        website: website.trim() || null,
        github: github.trim() || null,
        linkedin: linkedin.trim() || null
      };

      const result = await dispatch(updateProfile(updateData)).unwrap();
      console.log('UpdateProfile API result:', result);
      
      // Update local state with the new data (now always complete)
      if (result && result.profile) {
        setSkill(result.profile.bio || '');
        setLocation(result.profile.location || '');
        setWebsite(result.profile.website || '');
        setGithub(result.profile.github || '');
        setLinkedin(result.profile.linkedin || '');
      }

      setSuccess('Profile updated successfully!');
      showToast('Profile updated successfully!');
      // No need to refetch profile, backend returns full object
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
      showToast('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !profile) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ThemedText>Loading profile...</ThemedText>
      </View>
    );
  }

  if (reduxError && !profile) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ThemedText style={styles.errorText}>{reduxError}</ThemedText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colorSet.background }]}
    >
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingTop: 40,
          paddingBottom: 40,
          paddingHorizontal: 0,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#222'} />
        </TouchableOpacity>
        <View style={[styles.section, { backgroundColor: colorSet.card }] }>
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: colorSet.text }]}>{'Profile Information'}</ThemedText>
            {completionPercent === 100 ? (
              <View style={styles.completeBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
                <ThemedText style={styles.completeBadgeText}>Complete</ThemedText>
              </View>
            ) : (
              <View style={styles.incompleteBadge}>
                <Ionicons name="time" size={20} color="#f39c12" />
                <ThemedText style={styles.incompleteBadgeText}>In Progress</ThemedText>
              </View>
            )}
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.formGroup}>
              <ThemedText style={[styles.label, { color: colorSet.text }]}>Name</ThemedText>
              <View style={[styles.nameField, { backgroundColor: isDark ? '#23272F' : '#f2f2f2' }]}><ThemedText style={[styles.value, { color: colorSet.text }]}>{profile?.name || ''}</ThemedText></View>
            </View>
            <View style={styles.formGroup}>
              <ThemedText style={[styles.label, { color: colorSet.text }]}>Skill</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colorSet.text,
                    backgroundColor: colorSet.card,
                    borderColor: isDark ? '#333' : '#e0e0e0',
                  },
                ]}
                value={skill}
                onChangeText={setSkill}
                placeholder="e.g., Graphic Designer, Web Developer, UI/UX Designer"
                placeholderTextColor={colorSet.textSecondary}
                accessibilityLabel="Skill or profession"
              />
            </View>
            <View style={styles.formGroup}>
              <ThemedText style={[styles.label, { color: colorSet.text }]}>Location</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colorSet.text,
                    backgroundColor: colorSet.card,
                    borderColor: isDark ? '#333' : '#e0e0e0',
                  },
                ]}
                value={location}
                onChangeText={setLocation}
                placeholder="City, Country"
                placeholderTextColor={colorSet.textSecondary}
                accessibilityLabel="Location"
              />
            </View>
            <View style={styles.formGroup}>
              <ThemedText style={[styles.label, { color: colorSet.text }]}>Website</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colorSet.text,
                    backgroundColor: colorSet.card,
                    borderColor: isDark ? '#333' : '#e0e0e0',
                  },
                ]}
                value={website}
                onChangeText={setWebsite}
                placeholder="https://your-website.com"
                placeholderTextColor={colorSet.textSecondary}
                autoCapitalize="none"
                keyboardType="url"
                accessibilityLabel="Website URL"
              />
            </View>
            <View style={styles.formGroup}>
              <ThemedText style={[styles.label, { color: colorSet.text }]}>GitHub</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colorSet.text,
                    backgroundColor: colorSet.card,
                    borderColor: isDark ? '#333' : '#e0e0e0',
                  },
                ]}
                value={github}
                onChangeText={setGithub}
                placeholder="github.com/username"
                placeholderTextColor={colorSet.textSecondary}
                autoCapitalize="none"
                accessibilityLabel="GitHub URL"
              />
            </View>
            <View style={styles.formGroup}>
              <ThemedText style={[styles.label, { color: colorSet.text }]}>LinkedIn</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colorSet.text,
                    backgroundColor: colorSet.card,
                    borderColor: isDark ? '#333' : '#e0e0e0',
                  },
                ]}
                value={linkedin}
                onChangeText={setLinkedin}
                placeholder="linkedin.com/in/username"
                placeholderTextColor={colorSet.textSecondary}
                autoCapitalize="none"
                accessibilityLabel="LinkedIn URL"
              />
            </View>
          </View>
        </View>
        {error && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}
        {success && (
          <View style={styles.successContainer}>
            <ThemedText style={styles.successText}>{success}</ThemedText>
          </View>
        )}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled, { backgroundColor: colorSet.tint }]}
          onPress={handleSave}
          disabled={isSaving}
          accessibilityLabel="Save changes to your profile"
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completeBadgeText: {
    color: '#27ae60',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  incompleteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  incompleteBadgeText: {
    color: '#f39c12',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  sectionContent: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputDark: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333',
    color: '#fff',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  successContainer: {
    backgroundColor: '#dcfce7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: '#16a34a',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: Colors.light.tint,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nameField: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
}); 