import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export default function HomeScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [freshPosts, setFreshPosts] = useState<any[]>([]);
  const [closingSoonPosts, setClosingSoonPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';

  // Check network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchWithRetry = async (url: string, retries = MAX_RETRIES): Promise<Response> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (retries > 0) {
        await sleep(RETRY_DELAY);
        return fetchWithRetry(url, retries - 1);
      }
      throw error;
    }
  };

  // Helper function to check if a post is closing soon (within 3 days)
  const isClosingSoon = (post: any) => {
    try {
      // Try to find deadline in post meta or content
      const deadlineMatch = post.content.rendered.match(/deadline:?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i) ||
                           post.content.rendered.match(/closing:?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i) ||
                           post.content.rendered.match(/due:?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);
      
      if (deadlineMatch) {
        const deadline = new Date(deadlineMatch[1]);
        const now = new Date();
        const diffTime = deadline.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 3;
      }
      return false;
    } catch (error) {
      console.error('Error checking deadline:', error);
      return false;
    }
  };

  const fetchPosts = async (pageNum = 1, shouldRefresh = false) => {
    if (!isOnline) {
      Alert.alert(
        "No Internet Connection",
        "Please check your internet connection and try again."
      );
      return;
    }

    try {
      const response = await axios.get(
        `https://opportunitieshub.ng/wp-json/wp/v2/posts?_embed&per_page=10&page=${pageNum}`
      );
      const data = response.data;
      const totalPages = parseInt(response.headers['x-wp-totalpages'] || '1');
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
      // Update closing soon posts
      const closingPosts = data.filter(isClosingSoon);
      setClosingSoonPosts(prev => {
        const uniqueClosingPosts = closingPosts.filter((newPost: any) => 
          !prev.some(existingPost => existingPost.id === newPost.id)
        );
        return [...prev, ...uniqueClosingPosts];
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      Alert.alert(
        "Error",
        "Failed to load posts. Please try again later."
      );
    }
  };

  const fetchFreshPosts = async () => {
    if (!isOnline) return;
    try {
      const response = await axios.get(
        'https://opportunitieshub.ng/wp-json/wp/v2/posts?_embed&per_page=5'
      );
      const data = response.data;
      data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setFreshPosts(data);
    } catch (error) {
      console.error('Error fetching fresh posts:', error);
    }
  };

  const fetchCategories = async () => {
    if (!isOnline) return;
    try {
      const response = await axios.get(
        'https://opportunitieshub.ng/wp-json/wp/v2/categories?per_page=100'
      );
      setCategories(response.data);
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
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>No Internet Connection</Text>
        </View>
      )}
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

        {/* Closing Soon */}
        {closingSoonPosts.length > 0 && (
          <>
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={styles.sectionTitle}>Closing Soon</ThemedText>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.horizontalScroll}
            >
              {closingSoonPosts.map(post => {
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
          </>
        )}

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
            <Card
              key={post.id}
              id={String(post.id)}
              title={post.title.rendered}
              description={post.excerpt?.rendered?.replace(/<[^>]+>/g, '') || ''}
              imageUrl={imageUrl}
              date={date}
              author={post._embedded?.author?.[0]?.name}
              category={category}
              style={styles.card}
              imageStyle={styles.cardImage}
            />
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
  offlineBanner: {
    backgroundColor: '#ff6b6b',
    padding: 8,
    alignItems: 'center',
  },
  offlineText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
