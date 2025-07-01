import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCategories, usePosts } from '@/hooks/usePosts';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    Keyboard,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const SEARCH_BAR_HEIGHT = 54;
const CATEGORY_PILL_HEIGHT = 38;

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | number>('all');
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const colorSet = Colors[theme];
  const router = useRouter();
  const searchInputRef = useRef<TextInput>(null);
  const searchBarScale = useRef(new Animated.Value(1)).current;

  // Fetch posts and categories
  const { data: postsData, isLoading } = usePosts(1);
  const { data: categories } = useCategories();
  const allPosts = postsData?.data || [];

  // Animate search bar on focus
  useEffect(() => {
    Animated.spring(searchBarScale, {
      toValue: isFocused ? 1.03 : 1,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();
  }, [isFocused]);

  // Filter posts based on search query and category
  const filteredResults = useMemo(() => {
    if (!searchQuery) return [];
    return allPosts.filter(post => {
      const title = post.title.rendered.toLowerCase();
      const content = post.content.rendered.toLowerCase();
      const matchesQuery =
        title.includes(searchQuery.toLowerCase()) ||
        content.includes(searchQuery.toLowerCase());
      if (selectedCategory === 'all') return matchesQuery;
      const postCategories = post._embedded?.['wp:term']?.[0]?.map((cat: any) => cat.id) || [];
      return matchesQuery && postCategories.includes(selectedCategory);
    });
  }, [searchQuery, selectedCategory, allPosts]);

  // Generate search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const suggestions = new Set<string>();
    allPosts.forEach(post => {
      const title = post.title.rendered.toLowerCase();
      if (title.includes(searchQuery.toLowerCase())) {
        suggestions.add(post.title.rendered);
      }
    });
    return Array.from(suggestions).slice(0, 5);
  }, [searchQuery, allPosts]);

  const handleCancel = () => {
    setSearchQuery('');
    setIsFocused(false);
    setShowSuggestions(false);
    Keyboard.dismiss();
  };

  const addRecentSearch = (query: string) => {
    if (!query.trim()) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== query.toLowerCase());
      return [query, ...filtered].slice(0, 5);
    });
  };

  const handleResultPress = (post: any) => {
    addRecentSearch(searchQuery);
    router.push(`/post/${post.id}`);
  };

  const handleRecentSearchPress = (query: string) => {
    setSearchQuery(query);
    setIsFocused(true);
    setShowSuggestions(false);
  };

  const handleSearchSubmit = () => {
    addRecentSearch(searchQuery);
    setIsFocused(false);
    setShowSuggestions(false);
    Keyboard.dismiss();
  };

  const handleClearRecent = () => setRecentSearches([]);

  const handleSuggestionPress = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorSet.background }] }>
      {/* Hero Search Bar */}
      <View style={[styles.heroContainer, { backgroundColor: colorSet.background }] }>
        <Animated.View style={[styles.heroSearchBarWrapper, { transform: [{ scale: searchBarScale }] }]}> 
          <LinearGradient
            colors={isDark ? ['#23272F', '#18181b'] : ['#fff', '#f6f8fa']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroSearchBarGradient}
          >
            <View style={[styles.heroSearchBarShadow, { backgroundColor: colorSet.card }] }>
              <View style={[styles.heroSearchBar, { backgroundColor: colorSet.card }] }>
                <Ionicons name="search" size={22} color={isDark ? colorSet.textSecondary : '#888'} style={styles.searchIcon} />
                <TextInput
                  ref={searchInputRef}
                  style={[styles.searchInput, { color: colorSet.text }]}
                  placeholder="Search posts, topics, people..."
                  placeholderTextColor={isDark ? colorSet.textSecondary : '#b0b4bb'}
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => {
                    setIsFocused(true);
                    setShowSuggestions(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setIsFocused(false);
                      setShowSuggestions(false);
                    }, 200);
                  }}
                  returnKeyType="search"
                  autoCorrect={false}
                  autoCapitalize="none"
                  onSubmitEditing={handleSearchSubmit}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color={isDark ? colorSet.textSecondary : '#b0b4bb'} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>

      {/* Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContent}
        style={styles.categoriesScroll}
      >
        <TouchableOpacity
          style={[
            styles.categoryPill,
            selectedCategory === 'all' && [styles.categoryPillSelected, { backgroundColor: colorSet.tint }],
          ]}
          onPress={() => setSelectedCategory('all')}
        >
          <ThemedText
            style={[
              styles.categoryText,
              selectedCategory === 'all' && [styles.categoryTextSelected, { color: colorSet.card }],
            ]}
          >
            All
          </ThemedText>
        </TouchableOpacity>
        {categories?.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryPill,
              selectedCategory === category.id && [styles.categoryPillSelected, { backgroundColor: colorSet.tint }],
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <ThemedText
              style={[
                styles.categoryText,
                selectedCategory === category.id && [styles.categoryTextSelected, { color: colorSet.card }],
              ]}
            >
              {category.name}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={[styles.content, { backgroundColor: colorSet.background }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Recent Searches Section */}
        {searchQuery.length === 0 && !isFocused ? (
          <View style={styles.cardSection}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={styles.sectionTitle}>Recent Searches</ThemedText>
              {recentSearches.length > 0 && (
                <TouchableOpacity onPress={handleClearRecent}>
                  <Ionicons name="trash-outline" size={18} color={colorSet.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.cardContent}>
              {recentSearches.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="search-outline" size={64} color={colorSet.textSecondary} style={styles.emptyStateIcon} />
                  <ThemedText style={styles.emptyStateText}>No recent searches</ThemedText>
                </View>
              ) : (
                recentSearches.map((query, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.recentSearchItem}
                    onPress={() => handleRecentSearchPress(query)}
                  >
                    <Ionicons name="time-outline" size={18} color={colorSet.tint} />
                    <ThemedText style={styles.recentSearchText}>{query}</ThemedText>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        ) : showSuggestions && searchQuery.length > 0 ? (
          <View style={styles.cardSection}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={styles.sectionTitle}>Suggestions</ThemedText>
            </View>
            <View style={styles.cardContent}>
              {searchSuggestions.map((suggestion, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestionPress(suggestion)}
                >
                  <Ionicons name="search-outline" size={18} color={colorSet.textSecondary} />
                  <ThemedText style={styles.suggestionText}>{suggestion}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colorSet.tint} />
            <ThemedText style={styles.loadingText}>Loading...</ThemedText>
          </View>
        ) : filteredResults.length === 0 ? (
          <View style={styles.cardSection}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={styles.sectionTitle}>Results</ThemedText>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.emptyStateContainer}>
                <Ionicons name="search-outline" size={64} color={colorSet.textSecondary} style={styles.emptyStateIcon} />
                <ThemedText style={styles.emptyStateText}>No results found</ThemedText>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.cardSection}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={styles.sectionTitle}>Results</ThemedText>
            </View>
            <View style={styles.cardContent}>
              {filteredResults.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  style={styles.resultItem}
                  onPress={() => handleResultPress(post)}
                  activeOpacity={0.85}
                >
                  {post._embedded?.['wp:featuredmedia']?.[0]?.source_url ? (
                    <Image
                      source={{ uri: post._embedded['wp:featuredmedia'][0].source_url }}
                      style={styles.resultImage}
                    />
                  ) : (
                    <View style={[styles.resultImage, styles.resultImagePlaceholder]}>
                      <Ionicons name="image-outline" size={28} color={colorSet.textSecondary} />
                    </View>
                  )}
                  <View style={styles.resultContent}>
                    <ThemedText style={styles.resultTitle} numberOfLines={2}>
                      {post.title.rendered}
                    </ThemedText>
                    <View style={styles.resultMeta}>
                      <ThemedText style={styles.resultMetaText}>
                        {new Date(post.date).toLocaleDateString()}
                      </ThemedText>
                      {post._embedded?.['wp:term']?.[0]?.[0]?.name && (
                        <>
                          <ThemedText style={styles.resultMetaDot}>•</ThemedText>
                          <ThemedText style={styles.resultMetaText}>
                            {post._embedded['wp:term'][0][0].name}
                          </ThemedText>
                        </>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
  },
  heroContainer: {
    paddingTop: 32,
    paddingBottom: 12,
    alignItems: 'center',
    backgroundColor: '#f6f8fa',
  },
  heroSearchBarWrapper: {
    width: width - 32,
    borderRadius: 32,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  heroSearchBarGradient: {
    borderRadius: 32,
    padding: 2,
  },
  heroSearchBarShadow: {
    borderRadius: 32,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  heroSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 32,
    paddingHorizontal: 18,
    height: SEARCH_BAR_HEIGHT,
    backgroundColor: '#fff',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    height: '100%',
    color: '#222',
    fontWeight: '500',
  },
  categoriesScroll: {
    maxHeight: 54,
    marginBottom: 8,
    marginTop: 2,
    backgroundColor: 'transparent',
  },
  categoriesContent: {
    paddingLeft: 20,
    paddingRight: 8,
    alignItems: 'center',
  },
  categoryPill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.04)',
    marginRight: 10,
    height: CATEGORY_PILL_HEIGHT,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryPillSelected: {
    backgroundColor: Colors.light.tint,
  },
  categoryText: {
    fontSize: 15,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  content: {
    flex: 1,
    backgroundColor: '#f6f8fa',
  },
  cardSection: {
    marginHorizontal: 18,
    marginTop: 18,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    paddingBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  cardContent: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 32,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 12,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
    paddingBottom: 30,
  },
  emptyStateIcon: {
    marginBottom: 12,
    opacity: 0.7,
  },
  emptyStateText: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 6,
    color: '#888',
    textAlign: 'center',
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
    backgroundColor: '#f8fafd',
    borderRadius: 14,
    marginBottom: 8,
  },
  recentSearchText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#222',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
    backgroundColor: '#f8fafd',
    borderRadius: 14,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#222',
  },
  resultItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
    backgroundColor: '#f8fafd',
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  resultImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 14,
    backgroundColor: '#f6f8fa',
  },
  resultImagePlaceholder: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultContent: {
    flex: 1,
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
    color: '#222',
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultMetaText: {
    fontSize: 14,
    opacity: 0.6,
    color: '#888',
  },
  resultMetaDot: {
    fontSize: 14,
    opacity: 0.6,
    marginHorizontal: 4,
    color: '#888',
  },
}); 