import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Dimensions, FlatList, Image, Linking, Modal, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

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

// Mock user data (added age, profession, achievements, projects, education, experience, email)
const MOCK_USERS = [
  {
    id: '1',
    name: 'Ada Lovelace',
    skill: 'Backend Developer',
    profession: 'Software Engineer',
    age: 28,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    xp: 120,
    email: 'ada.lovelace@email.com',
    achievements: ['Top Backend Dev 2023', 'Hackathon Winner'],
    projects: [
      { name: 'Payment API', description: 'Built a scalable payment API for fintech.' },
      { name: 'Data Pipeline', description: 'Automated ETL for big data.' },
    ],
    education: [
      { school: 'Oxford University', degree: 'BSc Computer Science', year: '2017' },
    ],
    experience: [
      { company: 'FinTech Ltd', role: 'Backend Engineer', years: '2018-2022' },
      { company: 'DataWorks', role: 'Software Engineer', years: '2022-Present' },
    ],
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
    achievements: ['Automation Guru'],
    projects: [
      { name: 'CI/CD Pipeline', description: 'Implemented robust CI/CD for SaaS.' },
    ],
    education: [
      { school: 'Yale University', degree: 'MSc Mathematics', year: '2010' },
    ],
    experience: [
      { company: 'CloudOps', role: 'DevOps Engineer', years: '2015-Present' },
    ],
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
    achievements: ['AI Pioneer', 'Published 10+ papers'],
    projects: [
      { name: 'Turing Test', description: 'Developed the Turing Test for AI.' },
    ],
    education: [
      { school: 'Cambridge', degree: 'PhD Mathematics', year: '1938' },
    ],
    experience: [
      { company: 'Bletchley Park', role: 'Researcher', years: '1939-1945' },
    ],
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
    achievements: ['NASA Award', 'Apollo Guidance Software'],
    projects: [
      { name: 'Apollo Guidance', description: 'Led software development for Apollo.' },
    ],
    education: [
      { school: 'MIT', degree: 'BSc Mathematics', year: '1958' },
    ],
    experience: [
      { company: 'NASA', role: 'Lead Developer', years: '1960-1972' },
    ],
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
    achievements: ['Invented the Web'],
    projects: [
      { name: 'World Wide Web', description: 'Invented the WWW.' },
    ],
    education: [
      { school: 'Oxford', degree: 'Physics', year: '1976' },
    ],
    experience: [
      { company: 'CERN', role: 'Engineer', years: '1980-1989' },
    ],
  },
  // Add more users as needed
];

const CURRENT_USER_ID = '1';

const getUniqueProfessions = (users: typeof MOCK_USERS) => {
  return Array.from(new Set(users.map(u => u.profession)));
};

export default function CommunityScreen() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [ageFilter, setAgeFilter] = useState('');
  const [professionFilter, setProfessionFilter] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof MOCK_USERS[0] | null>(null);

  // Commit logic
  const handleCommit = () => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === CURRENT_USER_ID ? { ...u, xp: u.xp + 10 } : u
      )
    );
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
      {/* Floating Commit Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCommit}
        activeOpacity={0.85}
      >
        <Ionicons name="flash" size={22} color="#fff" />
        <Text style={styles.fabText}>Commit (+10 XP)</Text>
      </TouchableOpacity>
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
        <Pressable style={styles.detailOverlay} onPress={() => setSelectedUser(null)} />
        <View style={styles.detailModal}>
          {selectedUser && (
            <>
              <View style={styles.detailAvatarWrapper}>
                <Image source={{ uri: selectedUser.avatar }} style={styles.detailAvatar} />
              </View>
              {/* Floating X close button */}
              <TouchableOpacity style={styles.detailCloseIcon} onPress={() => setSelectedUser(null)}>
                <Ionicons name="close" size={28} color="#222" />
              </TouchableOpacity>
              <Text style={styles.detailName}>{selectedUser.name}</Text>
              <Text style={styles.detailSkill}>{selectedUser.skill}</Text>
              <View style={styles.detailRow}><Text style={styles.detailLabel}>Profession:</Text><Text style={styles.detailValue}>{selectedUser.profession}</Text></View>
              <View style={styles.detailRow}><Text style={styles.detailLabel}>Age:</Text><Text style={styles.detailValue}>{selectedUser.age}</Text></View>
              <View style={styles.detailRow}><Text style={styles.detailLabel}>Level:</Text><Text style={styles.detailValue}>{getLevel(selectedUser.xp).name}</Text></View>
              <View style={styles.detailRow}><Text style={styles.detailLabel}>XP:</Text><Text style={styles.detailValue}>{selectedUser.xp}</Text></View>
              {/* Achievements */}
              {selectedUser.achievements && selectedUser.achievements.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Achievements</Text>
                  {selectedUser.achievements.map((ach, idx) => (
                    <Text key={idx} style={styles.detailSectionItem}>• {ach}</Text>
                  ))}
                </View>
              )}
              {/* Projects */}
              {selectedUser.projects && selectedUser.projects.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Projects</Text>
                  {selectedUser.projects.map((proj, idx) => (
                    <Text key={idx} style={styles.detailSectionItem}>• {proj.name}: {proj.description}</Text>
                  ))}
                </View>
              )}
              {/* Education */}
              {selectedUser.education && selectedUser.education.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Education</Text>
                  {selectedUser.education.map((edu, idx) => (
                    <Text key={idx} style={styles.detailSectionItem}>• {edu.school}, {edu.degree} ({edu.year})</Text>
                  ))}
                </View>
              )}
              {/* Experience */}
              {selectedUser.experience && selectedUser.experience.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Experience</Text>
                  {selectedUser.experience.map((exp, idx) => (
                    <Text key={idx} style={styles.detailSectionItem}>• {exp.company}, {exp.role} ({exp.years})</Text>
                  ))}
                </View>
              )}
              {/* Contact Button */}
              <TouchableOpacity style={styles.detailContactBtn} onPress={() => Linking.openURL(`mailto:${selectedUser.email}`)}>
                <Ionicons name="mail" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.detailContactBtnText}>Contact</Text>
              </TouchableOpacity>
            </>
          )}
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
    right: 24,
    bottom: 32,
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
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  detailModal: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 56,
    paddingHorizontal: 28,
    paddingBottom: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 12,
    minHeight: 480,
  },
  detailAvatarWrapper: {
    position: 'absolute',
    top: -48,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  detailAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 6,
  },
  detailCloseIcon: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 10,
    backgroundColor: '#f6f8fa',
    borderRadius: 18,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  detailName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#222',
    marginTop: 56,
    marginBottom: 2,
    textAlign: 'center',
  },
  detailSkill: {
    fontSize: 17,
    color: '#4a90e2',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 15,
    color: '#888',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
  },
  detailSection: {
    width: '100%',
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  detailSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4a90e2',
    marginBottom: 4,
  },
  detailSectionItem: {
    fontSize: 15,
    color: '#222',
    marginBottom: 2,
  },
  detailContactBtn: {
    marginTop: 24,
    backgroundColor: '#27ae60',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  detailContactBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
  },
}); 