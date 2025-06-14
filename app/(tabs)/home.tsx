import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCategories, useFreshPosts, usePosts } from '@/hooks/usePosts';
import { Category, Post } from '@/services/api';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | number>('all');
  const [page, setPage] = useState(1);
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

  const onRefresh = async () => {
    if (!isOnline) {
      Alert.alert(
        "No Internet Connection",
        "Please check your internet connection and try again."
      );
      return;
    }
    await Promise.all([
      refetchPosts(),
      refetchFreshPosts(),
      refetchCategories()
    ]);
  };

  const loadMore = () => {
    if (postsData?.totalPages && page < postsData.totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const getReadLength = (content: string) => {
    const words = content.replace(/<[^>]+>/g, '').split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  };

  const filteredPosts = postsData?.data.filter((post: Post) => 
    !freshPosts?.some((freshPost: Post) => freshPost.id === post.id)
  ) || [];

  // Filter posts by selected category
  const categoryFilteredPosts = selectedCategory === 'all'
    ? filteredPosts
    : filteredPosts.filter((post: Post) => {
        const postCategories = post._embedded?.['wp:term']?.[0]?.map((cat: any) => cat.id) || [];
        return postCategories.includes(selectedCategory);
      });

  const isLoading = isLoadingPosts || isLoadingFreshPosts || isLoadingCategories;
  const hasError = isPostsError || isFreshPostsError || isCategoriesError;

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </ThemedView>
    );
  }

  if (hasError) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ThemedText>Error loading content. Please try again.</ThemedText>
        <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
          <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {/* Fresh Posts */}
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={styles.sectionTitle}>Fresh Posts</ThemedText>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.horizontalScroll}
        >
          {freshPosts?.map((post: Post) => {
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
        {categoryFilteredPosts.map((post: Post) => {
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
        {postsData?.totalPages && page < postsData.totalPages && (
          <TouchableOpacity 
            style={styles.seeMoreButton} 
            onPress={loadMore}
            disabled={isLoadingPosts}
          >
            {isLoadingPosts ? (
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
  categoryChip: {
    backgroundColor: '#E5E8F0',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 10,
    marginTop: 8,
    marginBottom: 16,
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
