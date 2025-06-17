import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Skeleton } from '@/components/ui/Skeleton';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCategories, useFreshPosts, usePosts } from '@/hooks/usePosts';
import { Post } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, Image, NativeScrollEvent, NativeSyntheticEvent, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const POSTS_PER_PAGE = 10;

const CategoryPill = ({ category, isSelected, onPress }: { category: { id: 'all' | number; name: string }; isSelected: boolean; onPress: () => void }) => (
  <TouchableOpacity
    style={[styles.categoryPill, isSelected && styles.categoryPillSelected]}
    onPress={onPress}
  >
    <ThemedText style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
      {category.name}
    </ThemedText>
  </TouchableOpacity>
);

const PostCard = ({ post, onPress }: { post: Post; onPress: () => void }) => {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const readLength = Math.max(1, Math.round(post.content.rendered.replace(/<[^>]+>/g, '').split(/\s+/).length / 200));

  return (
    <TouchableOpacity style={styles.postCard} onPress={onPress}>
      <Image
        source={{ uri: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://via.placeholder.com/400x200' }}
        style={styles.postImage}
      />
      <View style={styles.postContent}>
        <ThemedText style={styles.postTitle} numberOfLines={2}>
          {post.title.rendered}
        </ThemedText>
        <View style={styles.postMeta}>
          <View style={styles.postMetaItem}>
            <Ionicons name="time-outline" size={14} color={isDark ? '#999' : '#666'} />
            <ThemedText style={styles.postMetaText}>{readLength} min read</ThemedText>
          </View>
          <View style={styles.postMetaItem}>
            <Ionicons name="calendar-outline" size={14} color={isDark ? '#999' : '#666'} />
            <ThemedText style={styles.postMetaText}>
              {new Date(post.date).toLocaleDateString()}
            </ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const FreshPostCard = ({ post, onPress }: { post: Post; onPress: () => void }) => {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';

  return (
    <TouchableOpacity style={styles.freshPostCard} onPress={onPress}>
      <Image
        source={{ uri: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://via.placeholder.com/200x200' }}
        style={styles.freshPostImage}
      />
      <View style={styles.freshPostContent}>
        <ThemedText style={styles.freshPostTitle} numberOfLines={2}>
          {post.title.rendered}
        </ThemedText>
        <View style={styles.freshPostMeta}>
          <Ionicons name="time-outline" size={12} color={isDark ? '#999' : '#666'} />
          <ThemedText style={styles.freshPostMetaText}>
            {new Date(post.date).toLocaleDateString()}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

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

  const filteredPosts = allPosts.filter((post: Post) => 
    !freshPosts?.some((freshPost: Post) => freshPost.id === post.id)
  );

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

  const router = useRouter();

  if (isLoading && page === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={isDark ? ['#1a1a1a', '#2a2a2a'] : ['#f8f9fa', '#e9ecef']}
            style={styles.headerGradient}
          >
            <Text style={styles.headerTitle}>Opportunities Hub</Text>
          </LinearGradient>
        </View>
        <ScrollView
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
        >
          <View style={styles.sectionHeaderRow}>
            <ThemedText style={styles.sectionTitle}>Fresh Posts</ThemedText>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.freshPostsScroll}>
            {[...Array(3)].map((_, i) => (
              <View key={i} style={styles.freshPostCard}>
                <Skeleton width={150} height={100} borderRadius={12} style={{ marginBottom: 8 }} />
                <Skeleton width={120} height={16} borderRadius={8} style={{ marginBottom: 4 }} />
                <Skeleton width={80} height={12} borderRadius={6} />
              </View>
            ))}
          </ScrollView>
          <View style={styles.sectionDivider} />
          <View style={styles.sectionHeaderRow}>
            <ThemedText style={styles.sectionTitle}>Latest Posts</ThemedText>
          </View>
          {[...Array(3)].map((_, i) => (
            <View key={i} style={styles.postCard}>
              <Skeleton width="100%" height={200} borderRadius={12} style={{ marginBottom: 12 }} />
              <Skeleton width="80%" height={20} borderRadius={10} style={{ marginBottom: 8 }} />
              <Skeleton width="40%" height={16} borderRadius={8} />
            </View>
          ))}
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
        <LinearGradient
          colors={isDark ? ['#1a1a1a', '#2a2a2a'] : ['#f8f9fa', '#e9ecef']}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>Opportunities Hub</Text>
        </LinearGradient>
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
        {freshPosts && freshPosts.length > 0 && (
          <>
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={styles.sectionTitle}>Fresh Posts</ThemedText>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.freshPostsScroll}
              contentContainerStyle={styles.freshPostsContent}
            >
              {freshPosts.map((post) => (
                <FreshPostCard
                  key={post.id}
                  post={post}
                  onPress={() => router.push(`/post/${post.id}`)}
                />
              ))}
            </ScrollView>
            <View style={styles.sectionDivider} />
          </>
        )}

        <View style={styles.categoriesHeaderRow}>
          <ThemedText style={styles.categoriesHeader}>Categories</ThemedText>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          <CategoryPill
            category={{ id: 'all', name: 'All' }}
            isSelected={selectedCategory === 'all'}
            onPress={() => setSelectedCategory('all')}
          />
          {categories?.map((category) => (
            <CategoryPill
              key={category.id}
              category={category}
              isSelected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
            />
          ))}
        </ScrollView>

        <View style={styles.sectionHeaderRow}>
          <ThemedText style={styles.sectionTitle}>Latest Posts</ThemedText>
        </View>

        {categoryFilteredPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onPress={() => router.push(`/post/${post.id}`)}
          />
        ))}

        {isLoadingMore && (
          <View style={styles.loadingMore}>
            <ActivityIndicator color={Colors.light.tint} />
          </View>
        )}

        {!isLoadingMore && hasMore && (
          <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
            <ThemedText style={styles.loadMoreText}>Load More</ThemedText>
          </TouchableOpacity>
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
  },
  headerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: 24,
  },
  freshPostsScroll: {
    marginLeft: 16,
  },
  freshPostsContent: {
    paddingRight: 16,
  },
  freshPostCard: {
    width: 150,
    marginRight: 12,
  },
  freshPostImage: {
    width: 150,
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
  },
  freshPostContent: {
    flex: 1,
  },
  freshPostTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  freshPostMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  freshPostMetaText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.6,
  },
  categoriesHeaderRow: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoriesHeader: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.8,
  },
  categoriesScroll: {
    marginLeft: 16,
  },
  categoriesContent: {
    paddingRight: 16,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    marginRight: 8,
  },
  categoryPillSelected: {
    backgroundColor: Colors.light.tint,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.light.tint,
  },
  categoryTextSelected: {
    color: '#fff',
  },
  postCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  postContent: {
    padding: 16,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  postMetaText: {
    fontSize: 14,
    marginLeft: 4,
    opacity: 0.6,
  },
  loadingMore: {
    padding: 16,
    alignItems: 'center',
  },
  loadMoreButton: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  scrollTopButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: Colors.light.tint,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
