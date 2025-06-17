import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const ProfileSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

export default function EditProfileScreen() {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const [bio, setBio] = useState('Software Engineer | React Native Developer');

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={isDark ? ['#1a1a1a', '#2a2a2a'] : ['#f8f9fa', '#e9ecef']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Edit Profile</ThemedText>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.saveButtonText}>Save</ThemedText>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} bounces={false}>
        <View style={styles.profileImageSection}>
          <TouchableOpacity style={styles.profileImageContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/150' }}
              style={styles.profileImage}
            />
            <View style={styles.editOverlay}>
              <IconSymbol name="camera.fill" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <ThemedText style={styles.changePhotoText}>Change Photo</ThemedText>
        </View>

        <ProfileSection title="Basic Information">
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Full Name</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter your full name"
              placeholderTextColor={isDark ? '#666' : '#999'}
              defaultValue="John Doe"
            />
          </View>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Professional Title</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="e.g., Senior Software Engineer"
              placeholderTextColor={isDark ? '#666' : '#999'}
              defaultValue="Software Engineer"
            />
          </View>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Bio</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea, isDark && styles.inputDark]}
              placeholder="Tell us about yourself"
              placeholderTextColor={isDark ? '#666' : '#999'}
              multiline
              numberOfLines={4}
              value={bio}
              onChangeText={setBio}
            />
          </View>
        </ProfileSection>

        <ProfileSection title="Contact Information">
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Email</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter your email"
              placeholderTextColor={isDark ? '#666' : '#999'}
              keyboardType="email-address"
              defaultValue="john.doe@example.com"
            />
          </View>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Location</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter your location"
              placeholderTextColor={isDark ? '#666' : '#999'}
              defaultValue="San Francisco, CA"
            />
          </View>
        </ProfileSection>

        <ProfileSection title="Professional Links">
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>LinkedIn</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter your LinkedIn profile URL"
              placeholderTextColor={isDark ? '#666' : '#999'}
              defaultValue="linkedin.com/in/johndoe"
            />
          </View>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>GitHub</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter your GitHub profile URL"
              placeholderTextColor={isDark ? '#666' : '#999'}
              defaultValue="github.com/johndoe"
            />
          </View>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Portfolio</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter your portfolio website"
              placeholderTextColor={isDark ? '#666' : '#999'}
              defaultValue="johndoe.dev"
            />
          </View>
        </ProfileSection>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.tint,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  profileImageSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 12,
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
  changePhotoText: {
    fontSize: 14,
    color: Colors.light.tint,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionContent: {
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  inputDark: {
    backgroundColor: '#2a2a2a',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
}); 