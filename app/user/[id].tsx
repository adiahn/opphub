import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../../services/apiClient';

interface UserProfile {
  profile: {
    bio?: string;
    location?: string;
    website?: string;
    github?: string;
    linkedin?: string;
    skills?: Array<{
      _id: string;
      name: string;
      level: string;
      yearsOfExperience: number;
    }>;
    projects?: Array<{
      _id: string;
      name: string;
      description: string;
      url?: string;
    }>;
    achievements?: Array<{
      _id: string;
      title: string;
      description: string;
      date: string;
    }>;
    education?: Array<{
      _id: string;
      institution: string;
      degree: string;
      field: string;
      startDate: string;
      endDate?: string;
    }>;
    workExperience?: Array<{
      _id: string;
      company: string;
      position: string;
      description: string;
      startDate: string;
      endDate?: string;
    }>;
  };
  streak: {
    current: number;
    longest: number;
    lastCheckIn: string;
  };
  _id: string;
  name: string;
  xp: number;
  level: string;
  stars: number;
  createdAt: string;
  updatedAt: string;
}

const levelColors: Record<string, { start: string; end: string }> = {
  'Newcomer': { start: '#d3d3d3', end: '#a9a9a9' },
  'Explorer': { start: '#5dade2', end: '#2e86c1' },
  'Contributor': { start: '#58d68d', end: '#229954' },
  'Collaborator': { start: '#f7dc6f', end: '#f1c40f' },
  'Achiever': { start: '#f5b041', end: '#d35400' },
  'Expert': { start: '#bb8fce', end: '#8e44ad' },
  'Legend': { start: '#ec7063', end: '#c0392b' },
};

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchUserProfile();
    }
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<UserProfile>(`/community/profile/${id}`);
      setUserProfile(response.data);
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </ThemedView>
    );
  }

  if (error || !userProfile) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.errorText}>{error || 'User not found'}</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const levelColor = levelColors[userProfile.level] || levelColors['Newcomer'];
  const robohashUrl = `https://robohash.org/${userProfile._id}?size=300x300&set=set4`;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.floatingBackButton} onPress={handleBackPress}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={[levelColor.start, levelColor.end]} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.profileSection}>
              <Image source={{ uri: robohashUrl }} style={styles.profileImage} />
              <View style={styles.profileInfo}>
                <ThemedText style={styles.userName}>{userProfile.name}</ThemedText>
                <View style={styles.levelBadge}>
                  <ThemedText style={styles.levelText}>{userProfile.level}</ThemedText>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Ionicons name="star" size={16} color="rgba(255,255,255,0.8)" />
                    <ThemedText style={styles.statText}>{userProfile.stars}</ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="flash" size={16} color="rgba(255,255,255,0.8)" />
                    <ThemedText style={styles.statText}>{userProfile.xp} XP</ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="flame" size={16} color="rgba(255,255,255,0.8)" />
                    <ThemedText style={styles.statText}>{userProfile.streak.current} days</ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          {/* Bio */}
          {userProfile.profile.bio && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>About</ThemedText>
              <ThemedText style={styles.bioText}>{userProfile.profile.bio}</ThemedText>
            </View>
          )}

          {/* Location */}
          {userProfile.profile.location && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Location</ThemedText>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color="#666" />
                <ThemedText style={styles.locationText}>{userProfile.profile.location}</ThemedText>
              </View>
            </View>
          )}

          {/* Social Links */}
          {(userProfile.profile.website || userProfile.profile.github || userProfile.profile.linkedin) && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Links</ThemedText>
              <View style={styles.linksContainer}>
                {userProfile.profile.website && (
                  <TouchableOpacity 
                    style={styles.linkButton}
                    onPress={() => handleLinkPress(userProfile.profile.website!)}
                  >
                    <Ionicons name="globe" size={16} color="#667eea" />
                    <ThemedText style={styles.linkText}>Website</ThemedText>
                  </TouchableOpacity>
                )}
                {userProfile.profile.github && (
                  <TouchableOpacity 
                    style={styles.linkButton}
                    onPress={() => handleLinkPress(userProfile.profile.github!)}
                  >
                    <Ionicons name="logo-github" size={16} color="#333" />
                    <ThemedText style={styles.linkText}>GitHub</ThemedText>
                  </TouchableOpacity>
                )}
                {userProfile.profile.linkedin && (
                  <TouchableOpacity 
                    style={styles.linkButton}
                    onPress={() => handleLinkPress(userProfile.profile.linkedin!)}
                  >
                    <Ionicons name="logo-linkedin" size={16} color="#0077b5" />
                    <ThemedText style={styles.linkText}>LinkedIn</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Skills */}
          {userProfile.profile.skills && userProfile.profile.skills.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Skills</ThemedText>
              <View style={styles.skillsContainer}>
                {userProfile.profile.skills.map((skill) => (
                  <View key={skill._id} style={styles.skillBadge}>
                    <ThemedText style={styles.skillName}>{skill.name}</ThemedText>
                    <ThemedText style={styles.skillLevel}>{skill.level}</ThemedText>
                    {skill.yearsOfExperience > 0 && (
                      <ThemedText style={styles.skillExperience}>
                        {skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'year' : 'years'}
                      </ThemedText>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Projects */}
          {userProfile.profile.projects && userProfile.profile.projects.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Projects</ThemedText>
              {userProfile.profile.projects.map((project) => (
                <View key={project._id} style={styles.projectCard}>
                  <ThemedText style={styles.projectName}>{project.name}</ThemedText>
                  <ThemedText style={styles.projectDescription}>{project.description}</ThemedText>
                  {project.url && (
                    <TouchableOpacity 
                      style={styles.projectLink}
                      onPress={() => handleLinkPress(project.url!)}
                    >
                      <Ionicons name="open-outline" size={14} color="#667eea" />
                      <ThemedText style={styles.projectLinkText}>View Project</ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Work Experience */}
          {userProfile.profile.workExperience && userProfile.profile.workExperience.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Work Experience</ThemedText>
              {userProfile.profile.workExperience.map((work) => (
                <View key={work._id} style={styles.experienceCard}>
                  <ThemedText style={styles.companyName}>{work.company}</ThemedText>
                  <ThemedText style={styles.positionName}>{work.position}</ThemedText>
                  <ThemedText style={styles.dateRange}>
                    {formatDate(work.startDate)} - {work.endDate ? formatDate(work.endDate) : 'Present'}
                  </ThemedText>
                  <ThemedText style={styles.description}>{work.description}</ThemedText>
                </View>
              ))}
            </View>
          )}

          {/* Education */}
          {userProfile.profile.education && userProfile.profile.education.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Education</ThemedText>
              {userProfile.profile.education.map((edu) => (
                <View key={edu._id} style={styles.educationCard}>
                  <ThemedText style={styles.institutionName}>{edu.institution}</ThemedText>
                  <ThemedText style={styles.degreeName}>{edu.degree} in {edu.field}</ThemedText>
                  <ThemedText style={styles.dateRange}>
                    {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}

          {/* Achievements */}
          {userProfile.profile.achievements && userProfile.profile.achievements.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Achievements</ThemedText>
              {userProfile.profile.achievements.map((achievement) => (
                <View key={achievement._id} style={styles.achievementCard}>
                  <ThemedText style={styles.achievementTitle}>{achievement.title}</ThemedText>
                  <ThemedText style={styles.achievementDescription}>{achievement.description}</ThemedText>
                  <ThemedText style={styles.achievementDate}>{formatDate(achievement.date)}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    paddingTop: 40,
    gap: 20,
  },
  floatingBackButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  levelBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  levelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: '#4a5568',
    lineHeight: 24,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#4a5568',
  },
  linksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 100,
  },
  skillName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 2,
  },
  skillLevel: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
    marginBottom: 2,
  },
  skillExperience: {
    fontSize: 11,
    color: '#718096',
  },
  projectCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  projectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
    marginBottom: 8,
  },
  projectLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  projectLinkText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  experienceCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 2,
  },
  positionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 4,
  },
  dateRange: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
  },
  educationCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  institutionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 2,
  },
  degreeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 4,
  },
  achievementCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 12,
    color: '#718096',
  },
  errorText: {
    fontSize: 16,
    color: '#e53e3e',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
}); 