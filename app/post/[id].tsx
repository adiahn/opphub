import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import api, { Post } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useRef } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, ScrollView, Share, StyleSheet, TouchableOpacity, View } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PostScreen() {
  const { id } = useLocalSearchParams();
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const { data: post, isLoading, isError } = useQuery<Post>({
    queryKey: ['post', id],
    queryFn: () => api.getPost(Number(id)),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  const handleShare = async () => {
    if (!post) return;
    try {
      await Share.share({
        message: `Check out this post: ${post.title.rendered}\n${post.link}`,
        url: post.link,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share post.');
    }
  };

  // Helper: Split HTML content into sections by <h2>
  function splitHtmlSections(html: string) {
    if (!html) return [{ title: 'Details', html: '' }];
    const regex = /<h2[^>]*>(.*?)<\/h2>/gi;
    let lastIndex = 0;
    let match;
    const sections = [];
    let sectionTitle = 'Details';
    while ((match = regex.exec(html)) !== null) {
      const title = match[1];
      const start = match.index;
      if (start > lastIndex) {
        sections.push({
          title: sectionTitle,
          html: html.slice(lastIndex, start)
        });
      }
      sectionTitle = title;
      lastIndex = regex.lastIndex;
    }
    // Push last section
    if (lastIndex < html.length) {
      sections.push({ title: sectionTitle, html: html.slice(lastIndex) });
    }
    return sections;
  }

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </ThemedView>
    );
  }

  if (isError || !post) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ThemedText>{isError ? 'Error loading post' : 'Post not found'}</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // Extract meta info safely
  const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const author = post._embedded?.author?.[0]?.name || 'Unknown';
  const authorAvatar = post._embedded?.author?.[0]?.avatar_urls?.['96'];
  const date = new Date(post.date).toLocaleDateString();
  const category = post._embedded?.['wp:term']?.[0]?.[0]?.name;
  const readTime = post.content?.rendered ? Math.max(1, Math.round(post.content.rendered.split(' ').length / 200)) : 0;

  // Split content into sections
  const sections = splitHtmlSections(post.content?.rendered);

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.overlayIconButton}>
              <IconSymbol name="chevron.left" size={24} color={Colors.light.tint} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleShare} style={styles.overlayIconButton}>
              <IconSymbol name="square.and.arrow.up" size={20} color={Colors.light.tint} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: '#E1E9EE', alignItems: 'center', justifyContent: 'center' }]}/>
          )}
          {/* Gradient overlay */}
          <View style={styles.heroGradient} />
          {/* Layered Title & Key Info */}
          <View style={styles.heroInfoLayer}>
            <ThemedText style={styles.heroTitle} numberOfLines={2}>{post.title.rendered}</ThemedText>
            <View style={styles.heroChipsRow}>
              {category && (
                <View style={styles.heroChip}><ThemedText style={styles.heroChipText}>{category}</ThemedText></View>
              )}
            </View>
          </View>
        </View>
        
        {/* Floating Info Card */}
        <View style={styles.floatingInfoCard}>
          <View style={styles.infoCardRow}>
            <View style={styles.infoCardItem}>
              <IconSymbol name="calendar" size={18} color={Colors.light.tint} />
              <ThemedText style={styles.infoCardLabel}>Deadline</ThemedText>
              <ThemedText style={styles.infoCardValue}>{date}</ThemedText>
            </View>
            <View style={styles.infoCardItem}>
              <IconSymbol name="clock" size={18} color={Colors.light.tint} />
              <ThemedText style={styles.infoCardLabel}>Time Left</ThemedText>
              <ThemedText style={styles.infoCardValue}>{readTime} min</ThemedText>
            </View>
          </View>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            <ThemedText style={styles.applyButtonText}>Apply Now</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Content Section */}
        <View style={styles.headerContent}>
          <View style={styles.metaRow}>
            {authorAvatar && (
              <Image source={{ uri: authorAvatar }} style={styles.avatar} />
            )}
            <ThemedText style={styles.metaText}>{author}</ThemedText>
            <ThemedText style={styles.metaText}>•</ThemedText>
            <ThemedText style={styles.metaText}>{date}</ThemedText>
            {category && (
              <>
                <ThemedText style={styles.metaText}>•</ThemedText>
                <ThemedText style={styles.metaText}>{category}</ThemedText>
              </>
            )}
            <ThemedText style={styles.metaText}>•</ThemedText>
            <ThemedText style={styles.metaText}>{readTime} min read</ThemedText>
          </View>
        </View>
        <View style={styles.divider} />
        <ThemedView style={styles.content}>
          {/* Sectioned Content */}
          <View style={styles.sectionsContainer}>
            {sections.map((section, idx) => (
              <View key={idx} style={styles.sectionCard}>
                {section.title && section.title !== 'Details' && (
                  <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
                )}
                <RenderHtml
                  contentWidth={SCREEN_WIDTH - 48}
                  source={{ html: section.html }}
                  baseStyle={{ color: isDark ? Colors.dark.text : Colors.light.text, fontSize: 16, lineHeight: 26 }}
                  tagsStyles={{
                    h1: { fontSize: 26, fontWeight: '700', marginVertical: 12 },
                    h2: { fontSize: 22, fontWeight: '700', marginVertical: 10 },
                    h3: { fontSize: 18, fontWeight: '700', marginVertical: 8 },
                    p: { marginVertical: 8 },
                    li: { marginVertical: 4 },
                  }}
                />
              </View>
            ))}
          </View>
        </ThemedView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: Colors.light.tint,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  overlayIconButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
    padding: 8,
  },
  heroContainer: {
    width: '100%',
    height: SCREEN_WIDTH * 0.8,
    backgroundColor: '#ccc',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroInfoLayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    justifyContent: 'flex-end',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  heroChipsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  heroChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  heroChipText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  floatingInfoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -40,
    borderRadius: 12,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  infoCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  infoCardItem: {
    alignItems: 'center',
  },
  infoCardLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  infoCardValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  metaText: {
    color: '#666',
    fontSize: 12,
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
    marginVertical: 16,
  },
  content: {
    paddingHorizontal: 16,
  },
  sectionsContainer: {},
  sectionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
}); 