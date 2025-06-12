import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/ui/Card';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ScrollView, StyleSheet } from 'react-native';

// Mock data for demonstration
const FAVOURITE_POSTS = [
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
];

export default function FavouritesScreen() {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>Favourites</ThemedText>
      </ThemedView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {FAVOURITE_POSTS.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>
              No favourite posts yet. Start adding some!
            </ThemedText>
          </ThemedView>
        ) : (
          FAVOURITE_POSTS.map((post) => (
            <Card
              key={post.id}
              id={post.id}
              title={post.title}
              description={post.description}
              imageUrl={post.imageUrl}
              date={post.date}
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
  header: {
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
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
    textAlign: 'center',
  },
}); 