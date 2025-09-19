import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCommunityLeaderboard } from '@/hooks/useCommunity';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Platform, Pressable, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import type { RootState } from '../../services/store';

// Define the CommunityUser type locally since the import is failing
interface CommunityUser {
  _id: string;
  name: string;
  level: string;
  profile: {
    bio?: string;
    skills?: Array<{
      _id: string;
      name: string;
      level: string;
    }>;
  };
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

const skillLevels = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

const UserCard = ({ item }: { item: CommunityUser }) => {
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const colorSet = Colors[theme];
  const levelColor = levelColors[item.level] || levelColors['Newcomer'];
  
  // Generate RoboHash URL using user ID
  const robohashUrl = `https://robohash.org/${item._id}?size=200x200&set=set4`;

  const handlePress = () => {
    router.push(`/user/${item._id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        Platform.OS === 'web' && { transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      <LinearGradient
        colors={isDark ? [levelColor.end, levelColor.start] : [levelColor.start, levelColor.end]}
        style={[styles.cardGradient, { backgroundColor: colorSet.card }]}
      >
        <View style={styles.cardHeader}>
          <ThemedText style={[styles.levelText, { color: '#fff', backgroundColor: 'rgba(0,0,0,0.25)' }]}>{item.level}</ThemedText>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ uri: robohashUrl }}
              style={styles.profileImage}
              resizeMode="cover"
            />
          </View>
          <ThemedText style={[styles.userName, { color: '#fff' }]} numberOfLines={1}>{item.name}</ThemedText>
          <ThemedText style={[styles.userBio, { color: 'rgba(255,255,255,0.9)' }]} numberOfLines={2}>
            {item.profile.bio || 'A talented member of our community.'}
          </ThemedText>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.skillsContainer}>
            {item.profile.skills?.slice(0, 3).map((skill) => (
              <View key={skill._id} style={[styles.skillBadge, { backgroundColor: 'rgba(0,0,0,0.18)' }] }>
                <ThemedText style={[styles.skillText, { color: '#fff' }]}>{skill.name}</ThemedText>
              </View>
            ))}
            {(!item.profile.skills || item.profile.skills.length === 0) && (
              <ThemedText style={[styles.skillText, { color: '#fff' }]}>No skills listed</ThemedText>
            )}
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
};

export default function SkillsBankScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Add authentication check
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Guard: If not authenticated, don't render anything
  // This prevents any API calls or rendering for guests
  if (!isAuthenticated) {
    return null;
  }

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useCommunityLeaderboard();

  const allUsers = data?.pages.flatMap(page => page.users) ?? [];

  // Filter users based on search query and skill level
  const filteredUsers = useMemo(() => {
    let filtered = allUsers;

    // Filter by search query (name or skills)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.profile.skills?.some(skill => 
          skill.name.toLowerCase().includes(query)
        )
      );
    }

    // Filter by skill level
    if (selectedLevel !== 'All') {
      filtered = filtered.filter(user => 
        user.profile.skills?.some(skill => 
          skill.level === selectedLevel
        )
      );
    }

    return filtered;
  }, [allUsers, searchQuery, selectedLevel]);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const colorSet = Colors[theme];

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>Failed to load the skills bank.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorSet.background }] }>
      {/* Header with Search, Filter, and Title */}
      <View style={[styles.header, { backgroundColor: colorSet.background }] }>
        <View style={styles.headerTop}>
          <View style={styles.titleContainer}>
            <ThemedText style={[styles.title, { color: colorSet.text }]}>Skills Bank</ThemedText>
          </View>
          <View style={styles.searchContainer}>
            <View style={[styles.searchBar, { backgroundColor: colorSet.card }] }>
              <Ionicons name="search" size={20} color={colorSet.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: colorSet.text }]}
                placeholder="Search by name or skills..."
                placeholderTextColor={colorSet.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colorSet.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.filterButton, { backgroundColor: colorSet.card }]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="filter" size={20} color={colorSet.tint} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Options */}
      {showFilters && (
        <View style={styles.filterContainer}>
          <ThemedText style={styles.filterTitle}>Skill Level:</ThemedText>
          <View style={styles.filterOptions}>
            {skillLevels.map(level => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.filterOption,
                  selectedLevel === level && styles.filterOptionActive
                ]}
                onPress={() => setSelectedLevel(level)}
              >
                <ThemedText style={[
                  styles.filterOptionText,
                  selectedLevel === level && styles.filterOptionTextActive
                ]}>
                  {level}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <ThemedText style={styles.resultsText}>
          {filteredUsers.length} {filteredUsers.length === 1 ? 'person' : 'people'} found
        </ThemedText>
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={({ item }) => <UserCard item={item} />}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ marginVertical: 20 }} color={Colors.light.tint} /> : null}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <ThemedText style={styles.emptyText}>
              {searchQuery || selectedLevel !== 'All' 
                ? 'No people found matching your criteria' 
                : 'No people available at the moment'
              }
            </ThemedText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 15,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  titleContainer: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterOptionActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  filterOptionText: {
    fontSize: 14,
    color: '#666',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    margin: 7.5,
    maxWidth: '48%',
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
  cardGradient: {
    flex: 1,
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
  },
  cardHeader: {
    alignSelf: 'stretch',
    alignItems: 'flex-end',
  },
  levelText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardBody: {
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  profileImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    marginBottom: 12,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  userBio: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 6,
    height: 34, // for 2 lines
    lineHeight: 17,
  },
  cardFooter: {
    marginTop: 'auto',
    paddingTop: 12,
    width: '100%',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 28,
  },
  skillBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    margin: 2,
  },
  skillText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
}); 