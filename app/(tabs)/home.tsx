import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCategories, useFreshPosts, usePosts } from '@/hooks/usePosts';
import { Category, Post } from '@/services/api';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const POSTS_PER_PAGE = 10;

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | number>('all');
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';

  // React Query hooks
  const { 
    data: postsData, 
    isLoading: isLoadingPosts,
    isError: isPostsError,
    refetch: refetchPosts
  } = usePosts(page);

  const {
    data: freshPosts,
    isLoading: isLoadingFreshPosts,
    isError: isFreshPostsError,
    refetch: refetchFreshPosts
  } = useFreshPosts();

  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
    refetch: refetchCategories
  } = useCategories();

  // Check network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsOnline(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, []);

  // Handle initial and paginated posts
  useEffect(() => {
    if (postsData && page === 1) {
      setAllPosts(postsData.data);
      setHasMore(page < postsData.totalPages);
    } else if (postsData && page > 1) {
      setAllPosts(prev => {
        // Avoid duplicates
        const newPosts = postsData.data.filter(
          (p) => !prev.some((existing) => existing.id === p.id)
        );
        return [...prev, ...newPosts];
      });
      setHasMore(page < postsData.totalPages);
    }
  }, [postsData, page]);

  const onRefresh = async () => {
    if (!isOnline) {
      Alert.alert(
        "No Internet Connection",
        "Please check your internet connection and try again."
      );
      return;
    }
    setPage(1);
    setAllPosts([]);
    await Promise.all([
      refetchPosts(),
      refetchFreshPosts(),
      refetchCategories()
    ]);
  };

  const loadMore = async () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    setPage(prev => prev + 1);
    // React Query will refetch postsData for the new page, useEffect will append
    setTimeout(() => setIsLoadingMore(false), 600); // Simulate loading effect
  };

  const getReadLength = (content: string) => {
    const words = content.replace(/<[^>]+>/g, '').split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  };

  const filteredPosts = allPosts.filter((post: Post) => 
    !freshPosts?.some((freshPost: Post) => freshPost.id === post.id)
  );

  // Filter posts by selected category
  const categoryFilteredPosts = selectedCategory === 'all'
    ? filteredPosts
    : filteredPosts.filter((post: Post) => {
        const postCategories = post._embedded?.['wp:term']?.[0]?.map((cat: any) => cat.id) || [];
        return postCategories.includes(selectedCategory);
      });

  const isLoading = isLoadingPosts || isLoadingFreshPosts || isLoadingCategories;
  const hasError = isPostsError || isFreshPostsError || isCategoriesError;

  // Skeleton loaders
  const renderPostSkeletons = (count = 3) => (
    <View style={{ flexDirection: 'row', gap: 16, paddingHorizontal: 8 }}>
      {[...Array(count)].map((_, i) => (
        <View key={i} style={styles.freshCard}>
          <Skeleton width={100} height={60} borderRadius={10} style={{ marginBottom: 8 }} />
          <Skeleton width={80} height={14} borderRadius={6} style={{ marginBottom: 4 }} />
          <Skeleton width={50} height={10} borderRadius={5} />
        </View>
      ))}
    </View>
  );

  const renderCategorySkeletons = (count = 6) => (
    <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 8 }}>
      {[...Array(count)].map((_, i) => (
        <Skeleton key={i} width={70} height={32} borderRadius={16} />
      ))}
    </View>
  );

  if (isLoading && page === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Opportunities Hub</Text>
        </View>
        <ScrollView
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
        >
          <View style={styles.sectionHeaderRow}>
            <ThemedText style={styles.sectionTitle}>Fresh Posts</ThemedText>
          </View>
          {renderPostSkeletons(3)}
          <View style={styles.sectionDivider} />
          <View style={styles.sectionHeaderRow}>
            <ThemedText style={styles.sectionTitle}>Posts</ThemedText>
          </View>
          {renderPostSkeletons(4)}
          <View style={styles.separator} />
          <View style={styles.sectionHeaderRow}>
            <ThemedText style={styles.sectionTitle}>View By Categories</ThemedText>
          </View>
          {renderCategorySkeletons(6)}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (hasError) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>😕</Text>
        <ThemedText style={{ fontSize: 18, marginBottom: 8 }}>Error loading content.</ThemedText>
        <ThemedText style={{ color: '#888', marginBottom: 16 }}>Please check your connection or try again.</ThemedText>
        <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
          <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Opportunities Hub</Text>
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isLoading && page === 1} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Fresh Posts */}
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={styles.sectionTitle}>Fresh Posts</ThemedText>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.horizontalScroll}
          contentContainerStyle={{ paddingLeft: 8, paddingRight: 8 }}
        >
          {freshPosts?.length === 0 ? (
            <Text style={{ color: '#888', padding: 16 }}>No fresh posts found.</Text>
          ) : freshPosts?.map((post: Post) => {
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
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.freshImage} />
                ) : (
                  <Skeleton width={100} height={60} borderRadius={10} style={{ marginBottom: 8 }} />
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

        {/* Divider between Fresh Posts and Posts */}
        <View style={styles.sectionDivider} />

        {/* Posts */}
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={styles.sectionTitle}>Posts</ThemedText>
        </View>
        {categoryFilteredPosts.length === 0 ? (
          <Text style={{ color: '#888', padding: 16 }}>No posts found for this category.</Text>
        ) : categoryFilteredPosts.map((post: Post) => {
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
          <Pressable onPress={loadMore} style={styles.seeMorePressable} disabled={isLoadingMore}>
            <Text style={styles.seeMoreTextLink}>
              See more
              {isLoadingMore && <ActivityIndicator size="small" color={Colors.light.tint} style={{ marginLeft: 8 }} />}
            </Text>
          </Pressable>
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
          contentContainerStyle={{ paddingLeft: 8, paddingRight: 8 }}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === 'all' && styles.selectedCategoryChip
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <ThemedText style={[
              styles.categoryChipText,
              selectedCategory === 'all' && styles.selectedCategoryChipText
            ]}>All</ThemedText>
          </TouchableOpacity>
          {categories?.map((category: Category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.selectedCategoryChip
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <ThemedText style={[
                styles.categoryChipText,
                selectedCategory === category.id && styles.selectedCategoryChipText
              ]}>{category.name}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  headerContainer: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.tint,
    letterSpacing: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
  },
  sectionDivider: {
    height: 1.5,
    backgroundColor: Colors.light.tint,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 1,
    opacity: 0.18,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E8F0',
    marginVertical: 12,
    marginHorizontal: 16,
    borderRadius: 1,
  },
  freshCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginRight: 12,
    marginBottom: 8,
    padding: 10,
    width: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  freshImage: {
    width: 100,
    height: 60,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#E1E9EE',
  },
  freshContent: {
    flex: 1,
  },
  freshTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  meta: {
    fontSize: 11,
    color: '#888',
    marginRight: 6,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    padding: 0,
  },
  cardImage: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    height: 110,
    backgroundColor: '#E1E9EE',
  },
  seeMorePressable: {
    alignItems: 'center',
    marginVertical: 8,
  },
  seeMoreTextLink: {
    color: Colors.light.tint,
    fontWeight: '600',
    fontSize: 15,
    textDecorationLine: 'underline',
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    marginLeft: 8,
  },
  categoryChip: {
    backgroundColor: '#E5E8F0',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A3A3A',
  },
  selectedCategoryChip: {
    backgroundColor: Colors.light.tint,
  },
  selectedCategoryChipText: {
    color: '#fff',
    fontWeight: '700',
  },
  retryButton: {
    padding: 12,
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  horizontalScroll: {
    marginBottom: 16,
  },
});
