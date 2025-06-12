import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [freshPosts, setFreshPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';

  const fetchPosts = async (pageNum = 1, shouldRefresh = false) => {
    try {
      const response = await fetch(
        `https://opportunitieshub.ng/wp-json/wp/v2/posts?_embed&per_page=10&page=${pageNum}`
      );
      const data = await response.json();
      
      const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
      setHasMore(pageNum < totalPages);
      
      data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      if (shouldRefresh) {
        setPosts(data);
      } else {
        const newPosts = data.filter((newPost: any) => 
          !posts.some(existingPost => existingPost.id === newPost.id)
        );
        setPosts(prev => [...prev, ...newPosts]);
      }
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchFreshPosts = async () => {
    try {
      const response = await fetch(
        'https://opportunitieshub.ng/wp-json/wp/v2/posts?_embed&per_page=5'
      );
      const data = await response.json();
      data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setFreshPosts(data);
    } catch (error) {
      console.error('Error fetching fresh posts:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        'https://opportunitieshub.ng/wp-json/wp/v2/categories?per_page=100'
      );
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchPosts(1, true);
    fetchFreshPosts();
    fetchCategories();
    const interval = setInterval(() => {
      fetchPosts(1, true);
      fetchFreshPosts();
      fetchCategories();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchPosts(1, true),
      fetchFreshPosts(),
      fetchCategories()
    ]);
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (hasMore && !refreshing && !loadingMore) {
      setLoadingMore(true);
      await fetchPosts(page + 1);
      setLoadingMore(false);
    }
  };

  const getReadLength = (content: string) => {
    const words = content.replace(/<[^>]+>/g, '').split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  };

  const filteredPosts = posts.filter(post => 
    !freshPosts.some(freshPost => freshPost.id === post.id)
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeHeader}>
        <ThemedText style={styles.headerTitle}>Opportunities Hub</ThemedText>
      </SafeAreaView>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Fresh Opportunities */}
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={styles.sectionTitle}>Fresh Opportunities</ThemedText>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.horizontalScroll}
        >
          {freshPosts.map(post => {
            const imageUrl =
              post._embedded &&
              post._embedded['wp:featuredmedia'] &&
              post._embedded['wp:featuredmedia'][0]?.source_url;
            const date = new Date(post.date).toLocaleDateString();
            const readLength = getReadLength(post.content.rendered);
            const category =
              post._embedded &&
              post._embedded['wp:term'] &&
              post._embedded['wp:term'][0] &&
              post._embedded['wp:term'][0][0]?.name;

            return (
              <View key={post.id} style={styles.freshCard}>
                {imageUrl && (
                  <Image source={{ uri: imageUrl }} style={styles.freshImage} />
                )}
                <View style={styles.freshContent}>
                  <Text style={styles.freshTitle} numberOfLines={2}>{post.title.rendered}</Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.meta}>{date}</Text>
                    <Text style={styles.meta}>• {readLength} min read</Text>
                    {category && <Text style={styles.meta}>• {category}</Text>}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.separator} />

        {/* Posts */}
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={styles.sectionTitle}>Posts</ThemedText>
        </View>
        {filteredPosts.map(post => {
          const imageUrl =
            post._embedded &&
            post._embedded['wp:featuredmedia'] &&
            post._embedded['wp:featuredmedia'][0]?.source_url;
          const date = new Date(post.date).toLocaleDateString();
          const readLength = getReadLength(post.content.rendered);
          const category =
            post._embedded &&
            post._embedded['wp:term'] &&
            post._embedded['wp:term'][0] &&
            post._embedded['wp:term'][0][0]?.name;

          return (
            <View key={post.id} style={styles.card}>
              {imageUrl && (
                <Image source={{ uri: imageUrl }} style={styles.cardImage} />
              )}
              <View style={styles.cardContent}>
                <Text style={styles.title} numberOfLines={2}>{post.title.rendered}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.meta}>{date}</Text>
                  <Text style={styles.meta}>• {readLength} min read</Text>
                  {category && <Text style={styles.meta}>• {category}</Text>}
                </View>
              </View>
            </View>
          );
        })}
        {hasMore && (
          <TouchableOpacity 
            style={styles.seeMoreButton} 
            onPress={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.light.tint} />
                <ThemedText style={[styles.seeMoreText, styles.loadingText]}>Loading...</ThemedText>
              </View>
            ) : (
              <ThemedText style={styles.seeMoreText}>See More</ThemedText>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.separator} />

        {/* Categories */}
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={styles.sectionTitle}>View By Categories</ThemedText>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.horizontalScroll}
        >
          {categories.map(category => (
            <TouchableOpacity 
              key={category.id} 
              style={styles.categoryPill}
            >
              <ThemedText style={styles.categoryPillText}>{category.name}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 14,
    marginTop: 30,
    textAlign: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '700',
  },
  horizontalScroll: {
    marginBottom: 16,
  },
  freshCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginRight: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    width: 280,
  },
  freshImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#eee',
  },
  freshContent: {
    padding: 12,
  },
  freshTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardImage: {
    width: 100,
    height: 100,
    backgroundColor: '#eee',
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  seeMoreButton: {
    alignItems: 'center',
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  seeMoreText: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  meta: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  categoryPill: {
    backgroundColor: '#E5E8F0',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A3A3A',
  },
});
