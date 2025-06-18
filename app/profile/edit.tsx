import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SkillLevel } from '@/types/user';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const ProfileSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

const SKILL_LEVELS: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function EditProfileScreen() {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  
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

  // Education
  const [education, setEducation] = useState<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: Date;
    endDate?: Date;
    isOngoing: boolean;
    description: string;
  }[]>([{
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: new Date(),
    endDate: undefined,
    isOngoing: false,
    description: ''
  }]);

  // Work Experience
  const [workExperience, setWorkExperience] = useState<{
    company: string;
    position: string;
    startDate: Date;
    endDate?: Date;
    isOngoing: boolean;
    description: string;
  }[]>([{
    company: '',
    position: '',
    startDate: new Date(),
    endDate: undefined,
    isOngoing: false,
    description: ''
  }]);

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
            onPress={handleSave}
          >
            <ThemedText style={styles.saveButtonText}>Save</ThemedText>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

        <ProfileSection title="Contact Information">
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

        <ProfileSection title="Professional Links">
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

        <ProfileSection title="Skills">
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

        <ProfileSection title="Projects">
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

        <ProfileSection title="Achievements">
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

        <ProfileSection title="Education">
          {education.map((edu, index) => (
            <View key={index} style={styles.sectionItem}>
              <View style={styles.sectionItemHeader}>
                <ThemedText style={styles.sectionItemTitle}>Education {index + 1}</ThemedText>
                {index > 0 && (
                  <TouchableOpacity 
                    style={styles.removeButton} 
                    onPress={() => removeItem(education, setEducation, index)}
                  >
                    <IconSymbol name="minus.circle.fill" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Institution *</ThemedText>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Enter institution name"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  value={edu.institution}
                  onChangeText={(value) => updateItem(education, setEducation, index, 'institution', value)}
                />
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Degree *</ThemedText>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Enter degree"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  value={edu.degree}
                  onChangeText={(value) => updateItem(education, setEducation, index, 'degree', value)}
                />
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Field of Study</ThemedText>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Enter field of study"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  value={edu.fieldOfStudy}
                  onChangeText={(value) => updateItem(education, setEducation, index, 'fieldOfStudy', value)}
                />
              </View>
              <View style={styles.dateContainer}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <ThemedText style={styles.inputLabel}>Start Date *</ThemedText>
                  <TouchableOpacity
                    style={[styles.input, isDark && styles.inputDark]}
                    onPress={() => {/* TODO: Show date picker */}}
                  >
                    <ThemedText>{edu.startDate.toLocaleDateString()}</ThemedText>
                  </TouchableOpacity>
                </View>
                {!edu.isOngoing && (
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <ThemedText style={styles.inputLabel}>End Date</ThemedText>
                    <TouchableOpacity
                      style={[styles.input, isDark && styles.inputDark]}
                      onPress={() => {/* TODO: Show date picker */}}
                    >
                      <ThemedText>{edu.endDate?.toLocaleDateString() || 'Select date'}</ThemedText>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => updateItem(education, setEducation, index, 'isOngoing', !edu.isOngoing)}
                >
                  {edu.isOngoing && <IconSymbol name="checkmark" size={16} color={Colors.light.tint} />}
                </TouchableOpacity>
                <ThemedText style={styles.checkboxLabel}>Currently studying</ThemedText>
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Description</ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea, isDark && styles.inputDark]}
                  placeholder="Enter additional details"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  multiline
                  numberOfLines={4}
                  value={edu.description}
                  onChangeText={(value) => updateItem(education, setEducation, index, 'description', value)}
                />
              </View>
            </View>
          ))}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => addItem(education, setEducation, {
              institution: '',
              degree: '',
              fieldOfStudy: '',
              startDate: new Date(),
              endDate: undefined,
              isOngoing: false,
              description: ''
            })}
          >
            <IconSymbol name="plus.circle.fill" size={24} color={Colors.light.tint} />
            <ThemedText style={styles.addButtonText}>Add Education</ThemedText>
          </TouchableOpacity>
        </ProfileSection>

        <ProfileSection title="Work Experience">
          {workExperience.map((exp, index) => (
            <View key={index} style={styles.sectionItem}>
              <View style={styles.sectionItemHeader}>
                <ThemedText style={styles.sectionItemTitle}>Experience {index + 1}</ThemedText>
                {index > 0 && (
                  <TouchableOpacity 
                    style={styles.removeButton} 
                    onPress={() => removeItem(workExperience, setWorkExperience, index)}
                  >
                    <IconSymbol name="minus.circle.fill" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Company *</ThemedText>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Enter company name"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  value={exp.company}
                  onChangeText={(value) => updateItem(workExperience, setWorkExperience, index, 'company', value)}
                />
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Position *</ThemedText>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Enter position/title"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  value={exp.position}
                  onChangeText={(value) => updateItem(workExperience, setWorkExperience, index, 'position', value)}
                />
              </View>
              <View style={styles.dateContainer}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <ThemedText style={styles.inputLabel}>Start Date *</ThemedText>
                  <TouchableOpacity
                    style={[styles.input, isDark && styles.inputDark]}
                    onPress={() => {/* TODO: Show date picker */}}
                  >
                    <ThemedText>{exp.startDate.toLocaleDateString()}</ThemedText>
                  </TouchableOpacity>
                </View>
                {!exp.isOngoing && (
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <ThemedText style={styles.inputLabel}>End Date</ThemedText>
                    <TouchableOpacity
                      style={[styles.input, isDark && styles.inputDark]}
                      onPress={() => {/* TODO: Show date picker */}}
                    >
                      <ThemedText>{exp.endDate?.toLocaleDateString() || 'Select date'}</ThemedText>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => updateItem(workExperience, setWorkExperience, index, 'isOngoing', !exp.isOngoing)}
                >
                  {exp.isOngoing && <IconSymbol name="checkmark" size={16} color={Colors.light.tint} />}
                </TouchableOpacity>
                <ThemedText style={styles.checkboxLabel}>Currently working here</ThemedText>
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Description</ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea, isDark && styles.inputDark]}
                  placeholder="Enter job description"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  multiline
                  numberOfLines={4}
                  value={exp.description}
                  onChangeText={(value) => updateItem(workExperience, setWorkExperience, index, 'description', value)}
                />
              </View>
            </View>
          ))}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => addItem(workExperience, setWorkExperience, {
              company: '',
              position: '',
              startDate: new Date(),
              endDate: undefined,
              isOngoing: false,
              description: ''
            })}
          >
            <IconSymbol name="plus.circle.fill" size={24} color={Colors.light.tint} />
            <ThemedText style={styles.addButtonText}>Add Work Experience</ThemedText>
          </TouchableOpacity>
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
}); 