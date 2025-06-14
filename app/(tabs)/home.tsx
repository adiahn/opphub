import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCategories, useFreshPosts, usePosts } from '@/hooks/usePosts';
import { Category, Post } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Easing, Image, NativeScrollEvent, NativeSyntheticEvent, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const POSTS_PER_PAGE = 10;

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | number>('all');
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingPage, setPendingPage] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
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
    setPendingPage(page + 1);
    setPage(prev => prev + 1);
  };

  useEffect(() => {
    if (pendingPage !== null && postsData && page === pendingPage) {
      setIsLoadingMore(false);
      setPendingPage(null);
    }
  }, [postsData, page, pendingPage]);

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

  const scrollY = React.useRef(new Animated.Value(0)).current;
  const scrollViewRef = React.useRef<ScrollView>(null);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setShowScrollTop(offsetY > 300);
      },
    }
  );

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

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

  const fadeAnimFresh = React.useRef(new Animated.Value(0)).current;
  const fadeAnimPosts = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnimFresh, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [freshPosts]);

  React.useEffect(() => {
    Animated.timing(fadeAnimPosts, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [categoryFilteredPosts]);

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
      <Animated.ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && page === 1}
            onRefresh={onRefresh}
            colors={[Colors.light.tint]}
            tintColor={Colors.light.tint}
          />
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View style={styles.categoriesHeaderRow}>
          <Text style={styles.categoriesHeader}>Filters</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={{ paddingLeft: 4, paddingRight: 4 }}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === 'all' && styles.selectedCategoryChip,
              selectedCategory === 'all' && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Ionicons name="grid" size={14} color={selectedCategory === 'all' ? '#fff' : Colors.light.tint} style={{ marginRight: 2 }} />
            <ThemedText style={[
              styles.categoryChipText,
              selectedCategory === 'all' && styles.selectedCategoryChipText,
            ]}>All</ThemedText>
          </TouchableOpacity>
          {categories?.map((category: Category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.selectedCategoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons name="pricetag" size={14} color={selectedCategory === category.id ? '#fff' : Colors.light.tint} style={{ marginRight: 2 }} />
              <ThemedText style={[
                styles.categoryChipText,
                selectedCategory === category.id && styles.selectedCategoryChipText,
              ]}>{category.name}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.sectionDivider} />
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={styles.sectionTitle}>Featured Posts</ThemedText>
        </View>
        <Animated.View style={{ opacity: fadeAnimFresh }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
            contentContainerStyle={{ paddingLeft: 8, paddingRight: 8 }}
          >
            {freshPosts?.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Text style={{ fontSize: 40, marginBottom: 8 }}>🪁</Text>
                <Text style={styles.emptyStateText}>No fresh posts found.</Text>
              </View>
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
                    <View style={styles.freshImage}>
                      <Ionicons name="image-outline" size={32} color="#b0b8c1" />
                    </View>
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
        </Animated.View>
        <View style={styles.sectionDivider} />
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={styles.sectionTitle}>Posts</ThemedText>
        </View>
        <Animated.View style={{ opacity: fadeAnimPosts }}>
          {categoryFilteredPosts.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>📭</Text>
              <Text style={styles.emptyStateText}>No posts found for this category.</Text>
            </View>
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
              <View key={post.id} style={styles.card}>
                <Card
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
              </View>
            );
          })}
        </Animated.View>
        {hasMore && (
          <Pressable onPress={loadMore} style={styles.seeMorePressable} disabled={isLoadingMore}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={styles.seeMoreTextLink}>See more</Text>
              {isLoadingMore && <ActivityIndicator size="small" color={Colors.light.tint} style={{ marginLeft: 8 }} />}
            </View>
          </Pressable>
        )}
      </Animated.ScrollView>
      {showScrollTop && (
        <TouchableOpacity style={styles.scrollTopButton} onPress={scrollToTop}>
          <Ionicons name="arrow-up" size={24} color="#fff" />
        </TouchableOpacity>
      )}
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
    backgroundColor: '#F7F8FA',
    borderBottomWidth: 0,
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
    marginVertical: 5,
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
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
    fontWeight: '700',
    fontSize: 16,
    textDecorationLine: 'underline',
    letterSpacing: 0.2,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
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
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChipText: {
    fontSize: 12,
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
    marginTop: 2,
  },
  categoryChipActive: {
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyStateText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  scrollTopButton: {
    position: 'absolute',
    right: 24,
    bottom: 40,
    backgroundColor: Colors.light.tint,
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 100,
  },
  categoriesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginTop: 10,
    marginBottom: 4,
  },
  categoriesHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a2a3a',
    letterSpacing: 0.2,
  },
});
