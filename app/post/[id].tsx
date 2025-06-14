import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { api, Post } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
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
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Back Arrow */}
        <View style={[styles.headerRow, { paddingTop: insets.top + 8 }]}> 
          <TouchableOpacity onPress={() => router.back()} style={styles.backIconButton}>
            <IconSymbol name="chevron.left" size={28} color={isDark ? Colors.dark.text : Colors.light.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <IconSymbol
              name="square.and.arrow.up"
              size={24}
              color={isDark ? Colors.dark.text : Colors.light.text}
            />
          </TouchableOpacity>
        </View>
        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.wideImage} resizeMode="cover" />
        )}
        <View style={styles.headerContent}>
          <ThemedText style={styles.title}>{post.title.rendered}</ThemedText>
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
    height: 320,
    backgroundColor: '#eee',
    borderRadius: 18,
    marginBottom: 18,
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
}); 