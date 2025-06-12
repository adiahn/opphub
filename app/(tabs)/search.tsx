import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SearchBar } from '@/components/ui/SearchBar';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

// Mock data for demonstration
const CATEGORIES = [
  'All',
  'Technology',
  'Design',
  'Business',
  'Science',
  'Health',
  'Education',
  'Entertainment',
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>Search</ThemedText>
      </ThemedView>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search posts..."
        style={styles.searchBar}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((category) => (
          <ThemedView
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && {
                backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.categoryText,
                selectedCategory === category && {
                  color: '#FFFFFF',
                },
              ]}
            >
              {category}
            </ThemedText>
          </ThemedView>
        ))}
      </ScrollView>

      <ScrollView style={styles.content}>
        <ThemedText style={styles.sectionTitle}>Recent Searches</ThemedText>
        {/* Add recent searches list here */}
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
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F2F2F7',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
}); 