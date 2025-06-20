import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCommunityLeaderboard } from '@/hooks/useCommunity';
import { CommunityUser } from '@/services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const levelColors: Record<string, { start: string; end: string }> = {
  'Newcomer': { start: '#d3d3d3', end: '#a9a9a9' },
  'Explorer': { start: '#5dade2', end: '#2e86c1' },
  'Contributor': { start: '#58d68d', end: '#229954' },
  'Collaborator': { start: '#f7dc6f', end: '#f1c40f' },
  'Achiever': { start: '#f5b041', end: '#d35400' },
  'Expert': { start: '#bb8fce', end: '#8e44ad' },
  'Legend': { start: '#ec7063', end: '#c0392b' },
};

const UserCard = ({ item }: { item: CommunityUser }) => {
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const initials = item.name.split(' ').map(n => n[0]).join('').toUpperCase();
  const topSkills = item.profile.skills?.slice(0, 3) || [];
  const levelColor = levelColors[item.level] || levelColors['Newcomer'];

  const handlePress = () => {
    // router.push(`/user/${item._id}`);
    console.log(`Navigate to user ${item._id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        Platform.OS === 'web' && { transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      <LinearGradient colors={[levelColor.start, levelColor.end]} style={styles.cardGradient}>
        <View style={styles.cardHeader}>
          <ThemedText style={styles.levelText}>{item.level}</ThemedText>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.initialsCircle}>
            <ThemedText style={styles.initialsText}>{initials}</ThemedText>
          </View>
          <ThemedText style={styles.userName} numberOfLines={1}>{item.name}</ThemedText>
          <ThemedText style={styles.userBio} numberOfLines={2}>
            {item.profile.bio || 'A talented member of our community.'}
          </ThemedText>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.skillsContainer}>
            {topSkills.map(skill => (
              <View key={skill._id} style={styles.skillBadge}>
                <ThemedText style={styles.skillText}>{skill.name}</ThemedText>
              </View>
            ))}
            {topSkills.length === 0 && (
              <ThemedText style={styles.skillText}>No skills listed</ThemedText>
            )}
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
};

export default function CommunityScreen() {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useCommunityLeaderboard();

  const users = data?.pages.flatMap(page => page.users) ?? [];

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

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
        <ThemedText>Failed to load the community leaderboard.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Community Hub</ThemedText>
        <ThemedText style={styles.subtitle}>Discover and connect with top talent.</ThemedText>
      </View>
      <FlatList
        data={users}
        renderItem={({ item }) => <UserCard item={item} />}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ marginVertical: 20 }} color={Colors.light.tint} /> : null}
        columnWrapperStyle={styles.row}
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 18,
    color: '#6A6A6E',
    marginTop: 4,
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
    transition: 'transform 0.2s ease-in-out',
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
  initialsCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  initialsText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
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
}); 