import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

// Mock search results
const MOCK_RESULTS = [
  'UX podcast',
  'UX research mx',
  'UX total',
  'UX friends',
  'UX nights podcast',
  'AI suave',
  'UX & growth podcast',
  'UX discovery session... by gerard dolan',
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFocused, setIsFocused] = useState(false);
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';

  // Filter results based on search query and category
  const filteredResults = useMemo(() => {
    if (!searchQuery) return [];
    return MOCK_RESULTS.filter(item =>
      item.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedCategory === 'All' || item.toLowerCase().includes(selectedCategory.toLowerCase()))
    );
  }, [searchQuery, selectedCategory]);

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
        {searchQuery.length === 0 && !isFocused ? (
          <Text style={styles.sectionTitle}>Recent Searches</Text>
        ) : filteredResults.length === 0 ? (
          <Text style={styles.noResultsText}>No results found.</Text>
        ) : (
          filteredResults.map((result, idx) => (
            <TouchableOpacity key={idx} style={styles.resultItem}>
              <Ionicons name="search" size={18} color={Colors.light.tint} style={{ marginRight: 10 }} />
              <Text style={styles.resultText}>{result}</Text>
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