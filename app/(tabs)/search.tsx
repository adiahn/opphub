import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { usePosts } from '@/hooks/usePosts';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  const [isFocused, setIsFocused] = useState(false);
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const router = useRouter();

  // Fetch all posts (first 10 pages for demo, or use a custom hook for all posts)
  const { data: postsData, isLoading } = usePosts(1);
  const allPosts = postsData?.data || [];

  // Filter posts based on search query and category
  const filteredResults = useMemo(() => {
    if (!searchQuery) return [];
    return allPosts.filter(post => {
      const title = post.title.rendered.toLowerCase();
      const content = post.content.rendered.toLowerCase();
      const matchesQuery =
        title.includes(searchQuery.toLowerCase()) ||
        content.includes(searchQuery.toLowerCase());
      if (selectedCategory === 'All') return matchesQuery;
      const postCategories = post._embedded?.['wp:term']?.[0]?.map((cat: any) => cat.name.toLowerCase()) || [];
      return matchesQuery && postCategories.includes(selectedCategory.toLowerCase());
    });
  }, [searchQuery, selectedCategory, allPosts]);

  const handleCancel = () => {
    setSearchQuery('');
    setIsFocused(false);
    Keyboard.dismiss();
  };

  return (
    <ThemedView style={styles.container}>
      {/* Sticky Search Bar */}
      <View style={styles.stickySearchBar}>
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={20} color="#888" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search posts..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#888" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && {
                  backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint,
                },
              ]}
              onPress={() => setSelectedCategory(category)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && {
                    color: '#FFFFFF',
                  },
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results List */}
      <ScrollView style={styles.resultsContainer} keyboardShouldPersistTaps="handled">
        {isLoading ? (
          <Text style={styles.noResultsText}>Loading...</Text>
        ) : searchQuery.length === 0 && !isFocused ? (
          <Text style={styles.sectionTitle}>Recent Searches</Text>
        ) : filteredResults.length === 0 ? (
          <Text style={styles.noResultsText}>No results found.</Text>
        ) : (
          filteredResults.map((post, idx) => (
            <TouchableOpacity
              key={post.id}
              style={styles.resultItem}
              onPress={() => router.push(`/post/${post.id}`)}
            >
              <Ionicons name="search" size={18} color={Colors.light.tint} style={{ marginRight: 10 }} />
              <Text style={styles.resultText}>{post.title.rendered}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  stickySearchBar: {
    backgroundColor: '#fff',
    paddingTop: 48,
    paddingBottom: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 10,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    paddingVertical: 4,
  },
  cancelButton: {
    marginLeft: 8,
  },
  cancelText: {
    color: Colors.light.tint,
    fontWeight: '600',
    fontSize: 16,
  },
  categoriesContainer: {
    marginBottom: 2,
  },
  categoriesContent: {
    paddingHorizontal: 4,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 6,
    marginBottom: 4,
    backgroundColor: '#F2F2F7',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: 8,
  },
  resultText: {
    fontSize: 16,
    color: '#222',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#222',
  },
  noResultsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 32,
  },
}); 