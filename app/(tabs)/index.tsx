import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SearchBar } from '@/components/ui/SearchBar';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

// Mock data for demonstration
const MOCK_POSTS = [
  {
    id: '1',
    title: 'Getting Started with React Native',
    description: 'Learn the basics of React Native and how to build your first mobile app with this comprehensive guide.',
    imageUrl: 'https://picsum.photos/800/400',
    date: 'March 15, 2024',
  },
  {
    id: '2',
    title: 'Advanced State Management in React',
    description: 'Explore different state management solutions and learn when to use each one in your React applications.',
    imageUrl: 'https://picsum.photos/800/401',
    date: 'March 14, 2024',
  },
  {
    id: '3',
    title: 'Building Beautiful UIs with React Native',
    description: 'Discover the best practices for creating stunning user interfaces in React Native applications.',
    imageUrl: 'https://picsum.photos/800/402',
    date: 'March 13, 2024',
  },
];

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data fetching
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const filteredPosts = MOCK_POSTS.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePostPress = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? Colors.dark.tint : Colors.light.tint}
          />
        }
      >
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>Latest Posts</ThemedText>
          <Button
            title="New Post"
            variant="outline"
            onPress={() => {}}
            style={styles.newPostButton}
          />
        </ThemedView>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search posts..."
          style={styles.searchBar}
        />

        {filteredPosts.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>
              No posts found matching your search.
            </ThemedText>
          </ThemedView>
        ) : (
          filteredPosts.map((post) => (
            <Card
              key={post.id}
              id={post.id}
              title={post.title}
              description={post.description}
              imageUrl={post.imageUrl}
              date={post.date}
              onPress={() => handlePostPress(post.id)}
            />
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  newPostButton: {
    minWidth: 100,
  },
  searchBar: {
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    opacity: 0.6,
  },
});
