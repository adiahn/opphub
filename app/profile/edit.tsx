import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SkillLevel } from '@/types/user';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

const SKILL_LEVELS: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function EditProfileScreen() {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets();
  
  // Basic Information
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [bio, setBio] = useState('Software Engineer | React Native Developer');
  
  // Contact Information
  const [location, setLocation] = useState('San Francisco, CA');
  const [phone, setPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');

  // Skills
  const [skills, setSkills] = useState([
    { name: '', level: 'Beginner' as SkillLevel, yearsOfExperience: 0 }
  ]);

  // Projects
  const [projects, setProjects] = useState<{
    title: string;
    description: string;
    technologies: string[];
    projectUrl: string;
    startDate: Date;
    endDate?: Date;
    isOngoing: boolean;
  }[]>([{
    title: '',
    description: '',
    technologies: [],
    projectUrl: '',
    startDate: new Date(),
    endDate: undefined,
    isOngoing: false
  }]);

  // Achievements
  const [achievements, setAchievements] = useState<{
    title: string;
    description: string;
    date: Date;
    issuer: string;
    url: string;
  }[]>([{
    title: '',
    description: '',
    date: new Date(),
    issuer: '',
    url: ''
  }]);

  // Calculate completion status
  const completionStatus = useMemo(() => {
    return {
      basic: !!name && !!email && !!bio,
      contact: !!location && (!!phone || !!contactEmail),
      professional: !!website || !!github || !!linkedin,
      skills: skills.some(skill => !!skill.name && !!skill.level),
      projects: projects.some(project => !!project.title && !!project.description),
      achievements: achievements.some(achievement => !!achievement.title)
    };
  }, [name, email, bio, location, phone, contactEmail, website, github, linkedin, skills, projects, achievements]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const total = Object.keys(completionStatus).length;
    const completed = Object.values(completionStatus).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  }, [completionStatus]);

  // Add/Remove handlers for arrays
  const addItem = (
    array: any[],
    setArray: React.Dispatch<React.SetStateAction<any[]>>,
    template: any
  ) => {
    setArray([...array, { ...template }]);
  };

  const removeItem = (
    array: any[],
    setArray: React.Dispatch<React.SetStateAction<any[]>>,
    index: number
  ) => {
    setArray(array.filter((_, i) => i !== index));
  };

  const updateItem = (
    array: any[],
    setArray: React.Dispatch<React.SetStateAction<any[]>>,
    index: number,
    field: string,
    value: any
  ) => {
    const newArray = [...array];
    newArray[index] = { ...newArray[index], [field]: value };
    setArray(newArray);
  };

  // Add/Remove Skill handlers
  const addSkill = () => {
    setSkills([...skills, { name: '', level: 'Beginner', yearsOfExperience: 0 }]);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkill = (index: number, field: keyof typeof skills[0], value: string | SkillLevel | number) => {
    const newSkills = [...skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    setSkills(newSkills);
  };

  const handleSave = () => {
    // Validate required fields
    if (!name || !email) {
      Alert.alert('Error', 'Name and email are required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // TODO: Save profile data
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20 }}
      >
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${overallProgress}%` }]} />
          </View>
          <ThemedText style={styles.progressText}>{overallProgress}% Complete</ThemedText>
          <ThemedText style={styles.progressSubtext}>Complete your profile to stand out in the community</ThemedText>
        </View>

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

        <ProfileSection title="Basic Information" isComplete={completionStatus.basic}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Full Name *</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter your full name"
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={name}
              onChangeText={setName}
            />
          </View>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Email *</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter your email"
              placeholderTextColor={isDark ? '#666' : '#999'}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
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

        <ProfileSection title="Contact Information" isComplete={completionStatus.contact}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Location</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter your location"
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={location}
              onChangeText={setLocation}
            />
          </View>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Phone Number</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter your phone number"
              placeholderTextColor={isDark ? '#666' : '#999'}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Contact Email</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter contact email"
              placeholderTextColor={isDark ? '#666' : '#999'}
              keyboardType="email-address"
              value={contactEmail}
              onChangeText={setContactEmail}
              autoCapitalize="none"
            />
          </View>
        </ProfileSection>

        <ProfileSection title="Professional Links" isComplete={completionStatus.professional}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Website</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter your website URL"
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={website}
              onChangeText={setWebsite}
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>GitHub</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter your GitHub profile URL"
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={github}
              onChangeText={setGithub}
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>LinkedIn</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter your LinkedIn profile URL"
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={linkedin}
              onChangeText={setLinkedin}
              autoCapitalize="none"
            />
          </View>
        </ProfileSection>

        <ProfileSection title="Skills" isComplete={completionStatus.skills}>
          {skills.map((skill, index) => (
            <View key={index} style={styles.skillContainer}>
              <View style={styles.skillHeader}>
                <ThemedText style={styles.skillTitle}>Skill {index + 1}</ThemedText>
                {index > 0 && (
                  <TouchableOpacity 
                    style={styles.removeButton} 
                    onPress={() => removeSkill(index)}
                  >
                    <IconSymbol name="minus.circle.fill" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Skill Name *</ThemedText>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Enter skill name"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  value={skill.name}
                  onChangeText={(value) => updateSkill(index, 'name', value)}
                />
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Proficiency Level *</ThemedText>
                <View style={[styles.pickerContainer, isDark && styles.pickerContainerDark]}>
                  <Picker
                    selectedValue={skill.level}
                    onValueChange={(value) => updateSkill(index, 'level', value)}
                    style={[styles.picker, isDark && styles.pickerDark]}
                  >
                    {SKILL_LEVELS.map((level) => (
                      <Picker.Item key={level} label={level} value={level} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Years of Experience</ThemedText>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Enter years of experience"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  keyboardType="numeric"
                  value={skill.yearsOfExperience.toString()}
                  onChangeText={(value) => updateSkill(index, 'yearsOfExperience', parseInt(value) || 0)}
                />
              </View>
            </View>
          ))}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={addSkill}
          >
            <IconSymbol name="plus.circle.fill" size={24} color={Colors.light.tint} />
            <ThemedText style={styles.addButtonText}>Add Skill</ThemedText>
          </TouchableOpacity>
        </ProfileSection>

        <ProfileSection title="Projects" isComplete={completionStatus.projects}>
          {projects.map((project, index) => (
            <View key={index} style={styles.sectionItem}>
              <View style={styles.sectionItemHeader}>
                <ThemedText style={styles.sectionItemTitle}>Project {index + 1}</ThemedText>
                {index > 0 && (
                  <TouchableOpacity 
                    style={styles.removeButton} 
                    onPress={() => removeItem(projects, setProjects, index)}
                  >
                    <IconSymbol name="minus.circle.fill" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Title *</ThemedText>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Enter project title"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  value={project.title}
                  onChangeText={(value) => updateItem(projects, setProjects, index, 'title', value)}
                />
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Description *</ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea, isDark && styles.inputDark]}
                  placeholder="Enter project description"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  multiline
                  numberOfLines={4}
                  value={project.description}
                  onChangeText={(value) => updateItem(projects, setProjects, index, 'description', value)}
                />
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Technologies (comma separated)</ThemedText>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="e.g., React Native, TypeScript, Node.js"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  value={project.technologies.join(', ')}
                  onChangeText={(value) => updateItem(projects, setProjects, index, 'technologies', value.split(',').map(t => t.trim()))}
                />
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Project URL</ThemedText>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Enter project URL"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  value={project.projectUrl}
                  onChangeText={(value) => updateItem(projects, setProjects, index, 'projectUrl', value)}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.dateContainer}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <ThemedText style={styles.inputLabel}>Start Date</ThemedText>
                  <TouchableOpacity
                    style={[styles.input, isDark && styles.inputDark]}
                    onPress={() => {/* TODO: Show date picker */}}
                  >
                    <ThemedText>{project.startDate.toLocaleDateString()}</ThemedText>
                  </TouchableOpacity>
                </View>
                {!project.isOngoing && (
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <ThemedText style={styles.inputLabel}>End Date</ThemedText>
                    <TouchableOpacity
                      style={[styles.input, isDark && styles.inputDark]}
                      onPress={() => {/* TODO: Show date picker */}}
                    >
                      <ThemedText>{project.endDate?.toLocaleDateString() || 'Select date'}</ThemedText>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => updateItem(projects, setProjects, index, 'isOngoing', !project.isOngoing)}
                >
                  {project.isOngoing && <IconSymbol name="checkmark" size={16} color={Colors.light.tint} />}
                </TouchableOpacity>
                <ThemedText style={styles.checkboxLabel}>Ongoing project</ThemedText>
              </View>
            </View>
          ))}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => addItem(projects, setProjects, {
              title: '',
              description: '',
              technologies: [],
              projectUrl: '',
              startDate: new Date(),
              endDate: undefined,
              isOngoing: false
            })}
          >
            <IconSymbol name="plus.circle.fill" size={24} color={Colors.light.tint} />
            <ThemedText style={styles.addButtonText}>Add Project</ThemedText>
          </TouchableOpacity>
        </ProfileSection>

        <ProfileSection title="Achievements" isComplete={completionStatus.achievements}>
          {achievements.map((achievement, index) => (
            <View key={index} style={styles.sectionItem}>
              <View style={styles.sectionItemHeader}>
                <ThemedText style={styles.sectionItemTitle}>Achievement {index + 1}</ThemedText>
                {index > 0 && (
                  <TouchableOpacity 
                    style={styles.removeButton} 
                    onPress={() => removeItem(achievements, setAchievements, index)}
                  >
                    <IconSymbol name="minus.circle.fill" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Title *</ThemedText>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Enter achievement title"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  value={achievement.title}
                  onChangeText={(value) => updateItem(achievements, setAchievements, index, 'title', value)}
                />
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Description *</ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea, isDark && styles.inputDark]}
                  placeholder="Enter achievement description"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  multiline
                  numberOfLines={4}
                  value={achievement.description}
                  onChangeText={(value) => updateItem(achievements, setAchievements, index, 'description', value)}
                />
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Date *</ThemedText>
                <TouchableOpacity
                  style={[styles.input, isDark && styles.inputDark]}
                  onPress={() => {/* TODO: Show date picker */}}
                >
                  <ThemedText>{achievement.date.toLocaleDateString()}</ThemedText>
                </TouchableOpacity>
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Issuer</ThemedText>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Enter issuing organization"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  value={achievement.issuer}
                  onChangeText={(value) => updateItem(achievements, setAchievements, index, 'issuer', value)}
                />
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>URL</ThemedText>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Enter certificate/achievement URL"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  value={achievement.url}
                  onChangeText={(value) => updateItem(achievements, setAchievements, index, 'url', value)}
                  autoCapitalize="none"
                />
              </View>
            </View>
          ))}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => addItem(achievements, setAchievements, {
              title: '',
              description: '',
              date: new Date(),
              issuer: '',
              url: ''
            })}
          >
            <IconSymbol name="plus.circle.fill" size={24} color={Colors.light.tint} />
            <ThemedText style={styles.addButtonText}>Add Achievement</ThemedText>
          </TouchableOpacity>
        </ProfileSection>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity 
            style={styles.saveProfileButton}
            onPress={handleSave}
          >
            <ThemedText style={styles.saveProfileButtonText}>Save Profile</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  progressContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.tint,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  progressSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  profileImageSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImageContainer: {
    position: 'relative',
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
    marginTop: 8,
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27ae6020',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  completeBadgeText: {
    color: '#27ae60',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },
  incompleteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f39c1220',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  incompleteBadgeText: {
    color: '#f39c12',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputDark: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  skillContainer: {
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
    borderRadius: 8,
    padding: 16,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  skillTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    padding: 4,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  pickerContainerDark: {
    backgroundColor: '#2a2a2a',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  picker: {
    height: 50,
  },
  pickerDark: {
    color: '#fff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  sectionItem: {
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
    borderRadius: 8,
    padding: 16,
  },
  sectionItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.light.tint,
    borderRadius: 6,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    paddingHorizontal: 20,
  },
  saveProfileButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveProfileButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
}); 