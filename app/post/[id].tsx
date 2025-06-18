import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { api, Post } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef } from 'react';
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
        message: `Check out this post: ${post.title.rendered}\nhttps://opportunitieshub.ng/post/${post.id}`,
        url: `https://opportunitieshub.ng/post/${post.id}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share post.');
    }
  };

  // Helper: Split HTML content into sections by <h2>
  function splitHtmlSections(html: string) {
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

  // Extract meta info
  const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const author = post._embedded?.author?.[0]?.name || 'Unknown';
  const authorAvatar = post._embedded?.author?.[0]?.avatar_urls?.['96'];
  const date = new Date(post.date).toLocaleDateString();
  const category = post._embedded?.['wp:term']?.[0]?.[0]?.name;
  const readTime = Math.max(1, Math.round(post.content.rendered.split(' ').length / 200));

  // Split content into sections
  const sections = splitHtmlSections(post.content.rendered);

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
              {/* Add more chips if you want, e.g. location, tags */}
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
            {/* Add location or other info if available */}
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
                    a: { color: Colors.light.tint, textDecorationLine: 'underline' },
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
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 260,
    backgroundColor: '#eee',
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 14,
    marginTop: 8,
    color: '#222',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 8,
  },
  metaText: {
    fontSize: 15,
    opacity: 0.7,
    marginHorizontal: 2,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#eee',
  },
  shareButton: {
    marginRight: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  backIconButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
  },
  sectionsContainer: {
    marginTop: 8,
    gap: 18,
  },
  sectionCard: {
    backgroundColor: '#F8F9FB',
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#4B72FA',
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  wideImage: {
    width: '100%',
    height: 260,
    backgroundColor: '#eee',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerContent: {
    paddingHorizontal: 18,
    paddingBottom: 10,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginHorizontal: 18,
    marginBottom: 18,
  },
  overlayButtons: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  overlayIconButton: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  heroContainer: {
    position: 'relative',
    width: '100%',
    height: 260,
    marginBottom: 0,
  },
  heroImage: {
    width: '100%',
    height: 260,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heroInfoLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 16,
    paddingHorizontal: 20,
    zIndex: 5,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  heroChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  heroChip: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  heroChipText: {
    color: Colors.light.tint,
    fontWeight: '700',
    fontSize: 12,
  },
  floatingInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 20,
    marginTop: -36,
    marginBottom: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10,
  },
  infoCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoCardItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoCardLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  infoCardValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.tint,
    marginTop: 2,
  },
  applyButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
}); 