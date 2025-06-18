import { Colors } from '@/constants/Colors';
import { Achievement, Education, Project, Skill, WorkExperience } from '@/types/user';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Mock user data
interface MockUser {
  id: string;
  name: string;
  skill: string;
  profession: string;
  age: number;
  avatar: string;
  xp: number;
  email: string;
  location?: string;
  skills: Skill[];
  projects: Project[];
  education: Education[];
  workExperience: WorkExperience[];
  achievements: Achievement[];
}

// Level system
const LEVELS = [
  { name: 'Newcomer', stars: 1, xp: 0 },
  { name: 'Explorer', stars: 2, xp: 20 },
  { name: 'Contributor', stars: 3, xp: 50 },
  { name: 'Collaborator', stars: 4, xp: 100 },
  { name: 'Achiever', stars: 5, xp: 200 },
  { name: 'Expert', stars: 6, xp: 400 },
  { name: 'Legend', stars: 7, xp: 700 },
];

function getLevel(xp: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) return LEVELS[i];
  }
  return LEVELS[0];
}

// Mock user data
const MOCK_USERS: MockUser[] = [
  {
    id: '1',
    name: 'Ada Lovelace',
    skill: 'Backend Developer',
    profession: 'Software Engineer',
    age: 28,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    xp: 120,
    email: 'ada.lovelace@email.com',
    location: 'London, UK',
    skills: [
      { name: 'Node.js', level: 'Expert', yearsOfExperience: 5 },
      { name: 'Python', level: 'Advanced', yearsOfExperience: 3 },
      { name: 'PostgreSQL', level: 'Expert', yearsOfExperience: 4 },
    ],
    achievements: [
      { 
        title: 'Top Backend Dev 2023',
        description: 'Recognized as the top backend developer',
        date: new Date('2023-12-01'),
        issuer: 'TechAwards'
      },
      {
        title: 'Hackathon Winner',
        description: 'First place in Global Hackathon 2023',
        date: new Date('2023-06-15'),
        issuer: 'GlobalHack'
      }
    ],
    projects: [
      { 
        title: 'Payment API',
        description: 'Built a scalable payment API for fintech.',
        technologies: ['Node.js', 'Express', 'PostgreSQL'],
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-06-30'),
        isOngoing: false
      },
      {
        title: 'Data Pipeline',
        description: 'Automated ETL for big data.',
        technologies: ['Python', 'Apache Spark', 'AWS'],
        startDate: new Date('2022-07-01'),
        isOngoing: true
      }
    ],
    education: [
      {
        institution: 'Oxford University',
        degree: 'BSc Computer Science',
        startDate: new Date('2013-09-01'),
        endDate: new Date('2017-06-30'),
        isOngoing: false
      }
    ],
    workExperience: [
      {
        company: 'FinTech Ltd',
        position: 'Backend Engineer',
        startDate: new Date('2018-01-01'),
        endDate: new Date('2022-12-31'),
        isOngoing: false,
        description: 'Led the development of core payment processing systems.'
      },
      {
        company: 'DataWorks',
        position: 'Software Engineer',
        startDate: new Date('2023-01-01'),
        isOngoing: true,
        description: 'Building next-gen data processing pipelines.'
      }
    ]
  },
  {
    id: '2',
    name: 'Grace Hopper',
    skill: 'DevOps Engineer',
    profession: 'DevOps',
    age: 35,
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    xp: 60,
    email: 'grace.hopper@email.com',
    location: 'New York, USA',
    skills: [
      { name: 'Docker', level: 'Expert', yearsOfExperience: 4 },
      { name: 'Kubernetes', level: 'Advanced', yearsOfExperience: 3 },
      { name: 'AWS', level: 'Expert', yearsOfExperience: 5 },
    ],
    achievements: [
      {
        title: 'Automation Guru',
        description: 'Recognized for exceptional automation solutions',
        date: new Date('2023-03-15'),
        issuer: 'DevOps Awards'
      }
    ],
    projects: [
      {
        title: 'CI/CD Pipeline',
        description: 'Implemented robust CI/CD for SaaS.',
        technologies: ['Jenkins', 'Docker', 'Kubernetes'],
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-06-30'),
        isOngoing: false
      }
    ],
    education: [
      {
        institution: 'Yale University',
        degree: 'MSc Mathematics',
        startDate: new Date('2008-09-01'),
        endDate: new Date('2010-06-30'),
        isOngoing: false
      }
    ],
    workExperience: [
      {
        company: 'CloudOps',
        position: 'DevOps Engineer',
        startDate: new Date('2015-01-01'),
        isOngoing: true,
        description: 'Leading cloud infrastructure and automation initiatives.'
      }
    ]
  },
  {
    id: '3',
    name: 'Alan Turing',
    skill: 'AI Researcher',
    profession: 'Researcher',
    age: 41,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    xp: 350,
    email: 'alan.turing@email.com',
    location: 'Cambridge, UK',
    skills: [
      { name: 'Machine Learning', level: 'Expert', yearsOfExperience: 10 },
      { name: 'Python', level: 'Expert', yearsOfExperience: 8 },
      { name: 'TensorFlow', level: 'Expert', yearsOfExperience: 5 },
    ],
    achievements: [
      {
        title: 'AI Pioneer Award',
        description: 'For groundbreaking contributions to AI research',
        date: new Date('2023-05-20'),
        issuer: 'AI Research Institute'
      },
      {
        title: 'Research Excellence',
        description: 'Published 10+ high-impact papers',
        date: new Date('2023-01-10'),
        issuer: 'Computer Science Journal'
      }
    ],
    projects: [
      {
        title: 'Neural Network Framework',
        description: 'Developed a novel neural network architecture.',
        technologies: ['Python', 'TensorFlow', 'CUDA'],
        startDate: new Date('2022-01-01'),
        isOngoing: true
      }
    ],
    education: [
      {
        institution: 'Cambridge University',
        degree: 'PhD Mathematics',
        startDate: new Date('1934-09-01'),
        endDate: new Date('1938-06-30'),
        isOngoing: false
      }
    ],
    workExperience: [
      {
        company: 'AI Research Lab',
        position: 'Lead Researcher',
        startDate: new Date('2015-01-01'),
        isOngoing: true,
        description: 'Leading cutting-edge AI research projects.'
      }
    ]
  },
  {
    id: '4',
    name: 'Margaret Hamilton',
    skill: 'Fullstack Developer',
    profession: 'Software Engineer',
    age: 32,
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    xp: 800,
    email: 'margaret.hamilton@email.com',
    location: 'Boston, USA',
    skills: [
      { name: 'JavaScript', level: 'Expert', yearsOfExperience: 8 },
      { name: 'React', level: 'Expert', yearsOfExperience: 5 },
      { name: 'Node.js', level: 'Advanced', yearsOfExperience: 4 },
    ],
    achievements: [
      {
        title: 'NASA Distinguished Service Medal',
        description: 'For exceptional contribution to space software',
        date: new Date('2023-07-20'),
        issuer: 'NASA'
      }
    ],
    projects: [
      {
        title: 'Mission Control Dashboard',
        description: 'Built real-time mission control interface.',
        technologies: ['React', 'Node.js', 'WebSocket'],
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-06-30'),
        isOngoing: false
      }
    ],
    education: [
      {
        institution: 'MIT',
        degree: 'BSc Mathematics',
        startDate: new Date('1954-09-01'),
        endDate: new Date('1958-06-30'),
        isOngoing: false
      }
    ],
    workExperience: [
      {
        company: 'Space Systems',
        position: 'Lead Software Engineer',
        startDate: new Date('2015-01-01'),
        isOngoing: true,
        description: 'Leading development of mission-critical software systems.'
      }
    ]
  },
  {
    id: '5',
    name: 'Tim Berners-Lee',
    skill: 'Frontend Developer',
    profession: 'Web Developer',
    age: 29,
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    xp: 15,
    email: 'tim.berners-lee@email.com',
    location: 'Geneva, Switzerland',
    skills: [
      { name: 'HTML', level: 'Expert', yearsOfExperience: 3 },
      { name: 'CSS', level: 'Advanced', yearsOfExperience: 2 },
      { name: 'JavaScript', level: 'Intermediate', yearsOfExperience: 1 },
    ],
    achievements: [
      {
        title: 'Web Standards Pioneer',
        description: 'Contributed to modern web standards',
        date: new Date('2023-04-15'),
        issuer: 'W3C'
      }
    ],
    projects: [
      {
        title: 'Modern Web Framework',
        description: 'Developed a lightweight web framework.',
        technologies: ['HTML', 'CSS', 'JavaScript'],
        startDate: new Date('2023-01-01'),
        isOngoing: true
      }
    ],
    education: [
      {
        institution: 'Oxford University',
        degree: 'BSc Physics',
        startDate: new Date('1973-09-01'),
        endDate: new Date('1976-06-30'),
        isOngoing: false
      }
    ],
    workExperience: [
      {
        company: 'CERN',
        position: 'Web Developer',
        startDate: new Date('2020-01-01'),
        isOngoing: true,
        description: 'Developing modern web applications and standards.'
      }
    ]
  },
  // Add more users as needed
];

const CURRENT_USER_ID = '1';

const getUniqueProfessions = (users: typeof MOCK_USERS) => {
  return Array.from(new Set(users.map(u => u.profession)));
};

const isCurrentUser = (id: string) => id === CURRENT_USER_ID;

export default function CommunityScreen() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [ageFilter, setAgeFilter] = useState('');
  const [professionFilter, setProfessionFilter] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof MOCK_USERS[0] | null>(null);
  const [lastCommitDate, setLastCommitDate] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const hasCommittedToday = lastCommitDate === todayStr;

  const handleCommit = () => {
    if (hasCommittedToday) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === CURRENT_USER_ID ? { ...u, xp: u.xp + 10 } : u
      )
    );
    setLastCommitDate(todayStr);
    Alert.alert('Streak!', 'You\'ve marked today! Come back tomorrow to keep your streak going.');
  };

  // Filtering and search
  const filteredUsers = useMemo(() => {
    let filtered = [...users];
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(
        u => u.name.toLowerCase().includes(s) || u.skill.toLowerCase().includes(s)
      );
    }
    if (ageFilter.trim()) {
      const age = parseInt(ageFilter, 10);
      if (!isNaN(age)) {
        filtered = filtered.filter(u => u.age === age);
      }
    }
    if (professionFilter.trim()) {
      filtered = filtered.filter(u => u.profession === professionFilter);
    }
    // Sort by level (highest first)
    filtered.sort((a, b) => getLevel(b.xp).stars - getLevel(a.xp).stars);
    return filtered;
  }, [users, search, ageFilter, professionFilter]);

  // Profession options
  const professions = getUniqueProfessions(users);

  const renderUser = ({ item }: { item: typeof MOCK_USERS[0] }) => {
    const level = getLevel(item.xp);
    return (
      <TouchableOpacity style={styles.card} onPress={() => setSelectedUser(item)} activeOpacity={0.85}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.skill}>{item.skill}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelName}>{level.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search and Filter Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#b0b4bb" style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or skill..."
            placeholderTextColor="#b0b4bb"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterModalVisible(true)}>
          <Ionicons name="filter" size={22} color="#4a90e2" />
        </TouchableOpacity>
      </View>
      <Text style={styles.header}>Community</Text>
      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
      {isCurrentUser(CURRENT_USER_ID) && (
        <TouchableOpacity
          style={[styles.fab, hasCommittedToday && styles.fabDisabled]}
          onPress={handleCommit}
          activeOpacity={hasCommittedToday ? 1 : 0.85}
          disabled={hasCommittedToday}
        >
          <Ionicons name="flash" size={22} color={hasCommittedToday ? '#b0b8c1' : '#fff'} />
          <Text style={[styles.fabText, hasCommittedToday && styles.fabTextDisabled]}>
            {hasCommittedToday ? 'Marked' : 'Commit'}
          </Text>
        </TouchableOpacity>
      )}
      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter</Text>
            <Text style={styles.modalLabel}>Age</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter age"
              placeholderTextColor="#b0b4bb"
              keyboardType="numeric"
              value={ageFilter}
              onChangeText={setAgeFilter}
            />
            <Text style={styles.modalLabel}>Profession</Text>
            <View style={styles.professionList}>
              {professions.map((prof) => (
                <TouchableOpacity
                  key={prof}
                  style={[styles.professionChip, professionFilter === prof && styles.professionChipSelected]}
                  onPress={() => setProfessionFilter(professionFilter === prof ? '' : prof)}
                >
                  <Text style={[styles.professionChipText, professionFilter === prof && styles.professionChipTextSelected]}>{prof}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => { setAgeFilter(''); setProfessionFilter(''); }}>
                <Text style={styles.modalBtnText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={() => setFilterModalVisible(false)}>
                <Text style={[styles.modalBtnText, styles.modalBtnPrimaryText]}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* User Detail Modal */}
      <Modal
        visible={!!selectedUser}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedUser(null)}
      >
        <View style={styles.detailOverlay}>
          <View style={[styles.detailModal, { height: '90%' }]}>
            {selectedUser && (
              <View style={{ flex: 1, width: '100%' }}>
                {/* Close Button */}
                <TouchableOpacity 
                  style={styles.detailCloseButton} 
                  onPress={() => setSelectedUser(null)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <View style={styles.detailCloseIconWrapper}>
                    <Ionicons name="close" size={24} color={Colors.light.tint} />
                  </View>
                </TouchableOpacity>

                {/* Profile Header */}
                <View style={styles.detailHeader}>
                  <View style={styles.detailAvatarWrapper}>
                    <Image source={{ uri: selectedUser.avatar }} style={styles.detailAvatar} />
                    <View style={styles.levelIndicator}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                    </View>
                  </View>
                  <Text style={styles.detailName}>{selectedUser.name}</Text>
                  <Text style={styles.detailSkill}>{selectedUser.skill}</Text>
                  <View style={styles.levelBadgeDetail}>
                    <Text style={styles.levelNameDetail}>{getLevel(selectedUser.xp).name}</Text>
                    <View style={styles.xpBadge}>
                      <Ionicons name="flash" size={14} color={Colors.light.tint} />
                      <Text style={styles.xpText}>{selectedUser.xp} XP</Text>
                    </View>
                  </View>
                </View>

                <ScrollView 
                  style={{ flex: 1 }}
                  contentContainerStyle={styles.detailScrollContent}
                  showsVerticalScrollIndicator={true}
                  scrollEventThrottle={16}
                  onStartShouldSetResponder={() => true}
                  onMoveShouldSetResponder={() => true}
                  onResponderTerminationRequest={() => true}
                >
                  {/* Contact Info */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Contact Information</Text>
                    <View style={styles.detailInfoGrid}>
                      {selectedUser.email && (
                        <View style={styles.detailInfoItem}>
                          <View style={styles.detailInfoIconWrapper}>
                            <Ionicons name="mail-outline" size={20} color={Colors.light.tint} />
                          </View>
                          <Text style={styles.detailInfoText}>{selectedUser.email}</Text>
                        </View>
                      )}
                      {selectedUser.location && (
                        <View style={styles.detailInfoItem}>
                          <View style={styles.detailInfoIconWrapper}>
                            <Ionicons name="location-outline" size={20} color={Colors.light.tint} />
                          </View>
                          <Text style={styles.detailInfoText}>{selectedUser.location}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Skills */}
                  {selectedUser.skills && selectedUser.skills.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Skills & Expertise</Text>
                      <View style={styles.skillsGrid}>
                        {selectedUser.skills.map((skill, idx) => (
                          <View key={idx} style={styles.skillBadge}>
                            <Text style={styles.skillName}>{skill.name}</Text>
                            <View style={styles.skillMetaRow}>
                              <Text style={styles.skillLevel}>{skill.level}</Text>
                              <Text style={styles.skillYears}>{skill.yearsOfExperience}y</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Projects */}
                  {selectedUser.projects && selectedUser.projects.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Featured Projects</Text>
                      {selectedUser.projects.map((project, idx) => (
                        <View key={idx} style={styles.projectCard}>
                          <View style={styles.projectHeader}>
                            <Text style={styles.projectTitle}>{project.title}</Text>
                            {project.isOngoing && (
                              <View style={styles.ongoingBadge}>
                                <Text style={styles.ongoingText}>Active</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.projectDescription}>{project.description}</Text>
                          <View style={styles.techStack}>
                            {project.technologies.map((tech, techIdx) => (
                              <View key={techIdx} style={styles.techBadge}>
                                <Text style={styles.techText}>{tech}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Education */}
                  {selectedUser.education && selectedUser.education.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Education</Text>
                      {selectedUser.education.map((edu, idx) => (
                        <View key={idx} style={styles.timelineItem}>
                          <View style={styles.timelineDot} />
                          <View style={styles.timelineContent}>
                            <Text style={styles.timelineTitle}>{edu.institution}</Text>
                            <Text style={styles.timelineSubtitle}>{edu.degree}</Text>
                            <Text style={styles.timelineDate}>
                              {new Date(edu.startDate).toLocaleDateString()} - {edu.isOngoing ? 'Present' : edu.endDate ? new Date(edu.endDate).toLocaleDateString() : ''}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Work Experience */}
                  {selectedUser.workExperience && selectedUser.workExperience.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Work Experience</Text>
                      {selectedUser.workExperience.map((exp, idx) => (
                        <View key={idx} style={styles.timelineItem}>
                          <View style={styles.timelineDot} />
                          <View style={styles.timelineContent}>
                            <Text style={styles.timelineTitle}>{exp.company}</Text>
                            <Text style={styles.timelineSubtitle}>{exp.position}</Text>
                            <Text style={styles.timelineDate}>
                              {new Date(exp.startDate).toLocaleDateString()} - {exp.isOngoing ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : ''}
                            </Text>
                            {exp.description && (
                              <Text style={styles.timelineDescription}>{exp.description}</Text>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Achievements */}
                  {selectedUser.achievements && selectedUser.achievements.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Achievements</Text>
                      {selectedUser.achievements.map((achievement, idx) => (
                        <View key={idx} style={styles.achievementCard}>
                          <View style={styles.achievementIcon}>
                            <Ionicons name="trophy" size={24} color={Colors.light.tint} />
                          </View>
                          <View style={styles.achievementContent}>
                            <Text style={styles.achievementTitle}>{achievement.title}</Text>
                            <Text style={styles.achievementDescription}>{achievement.description}</Text>
                            <Text style={styles.achievementMeta}>
                              {achievement.issuer} • {new Date(achievement.date).toLocaleDateString()}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </ScrollView>

                {/* Contact Button */}
                <View style={styles.detailContactBtnContainer}>
                  <TouchableOpacity
                    style={styles.detailContactBtn}
                    onPress={() => Linking.openURL(`mailto:${selectedUser.email}`)}
                  >
                    <Ionicons name="mail" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.detailContactBtnText}>Contact</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
          <Pressable 
            style={styles.modalOverlayClose} 
            onPress={() => setSelectedUser(null)} 
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const CARD_WIDTH = (width - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginHorizontal: 18,
    marginBottom: 2,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#222',
  },
  filterBtn: {
    marginLeft: 10,
    backgroundColor: '#f8fafd',
    borderRadius: 10,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 18,
    color: '#222',
  },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 80,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    margin: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 10,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
    textAlign: 'center',
  },
  skill: {
    fontSize: 14,
    color: '#4a90e2',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  levelBadge: {
    alignItems: 'center',
    backgroundColor: '#f8fafd',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 10,
  },
  levelName: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 32,
    bottom: 120,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a90e2',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 10,
  },
  fabText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 10,
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 18,
    color: '#222',
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
    color: '#4a90e2',
  },
  modalInput: {
    backgroundColor: '#f8fafd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: '#222',
    marginBottom: 10,
  },
  professionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  professionChip: {
    backgroundColor: '#f8fafd',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
  },
  professionChipSelected: {
    backgroundColor: '#4a90e2',
  },
  professionChipText: {
    color: '#4a90e2',
    fontWeight: '600',
    fontSize: 14,
  },
  professionChipTextSelected: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 18,
  },
  modalBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f8fafd',
    marginLeft: 10,
  },
  modalBtnPrimary: {
    backgroundColor: '#4a90e2',
  },
  modalBtnText: {
    color: '#4a90e2',
    fontWeight: '700',
    fontSize: 15,
  },
  modalBtnPrimaryText: {
    color: '#fff',
  },
  detailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalOverlayClose: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: '90%',
  },
  detailModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  detailCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  detailCloseIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 51, 102, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  detailAvatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  detailAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  levelIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.light.tint,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  detailName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#222',
    marginBottom: 4,
    textAlign: 'center',
  },
  detailSkill: {
    fontSize: 18,
    color: Colors.light.tint,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  levelBadgeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 51, 102, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  levelNameDetail: {
    fontSize: 15,
    color: Colors.light.tint,
    fontWeight: '700',
    marginRight: 12,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  xpText: {
    fontSize: 13,
    color: Colors.light.tint,
    fontWeight: '600',
    marginLeft: 4,
  },
  detailScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  detailSection: {
    marginBottom: 32,
    width: '100%',
  },
  detailSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.tint,
    marginBottom: 16,
  },
  detailInfoGrid: {
    backgroundColor: 'rgba(0, 51, 102, 0.05)',
    borderRadius: 16,
    padding: 16,
  },
  detailInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailInfoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 51, 102, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailInfoText: {
    fontSize: 15,
    color: '#222',
    flex: 1,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skillBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  skillName: {
    fontSize: 16,
    color: Colors.light.tint,
    fontWeight: '600',
    marginBottom: 4,
  },
  skillMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillLevel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  skillYears: {
    fontSize: 12,
    color: Colors.light.tint,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 51, 102, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    flex: 1,
  },
  ongoingBadge: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  ongoingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  projectDescription: {
    fontSize: 15,
    color: '#444',
    marginBottom: 12,
    lineHeight: 22,
  },
  techStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  techBadge: {
    backgroundColor: 'rgba(0, 51, 102, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  techText: {
    fontSize: 13,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.tint,
    marginRight: 16,
    marginTop: 6,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timelineTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  timelineSubtitle: {
    fontSize: 15,
    color: Colors.light.tint,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  timelineDescription: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 51, 102, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
    lineHeight: 20,
  },
  achievementMeta: {
    fontSize: 13,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  detailContactBtnContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  detailContactBtn: {
    backgroundColor: Colors.light.tint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  detailContactBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  fabDisabled: {
    backgroundColor: '#e5e7eb',
  },
  fabTextDisabled: {
    color: '#b0b8c1'
  },
}); 