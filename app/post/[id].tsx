import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, ScrollView, Share, StyleSheet, TouchableOpacity } from 'react-native';

// Mock data - in a real app, this would come from an API
const MOCK_POSTS = {
  '1': {
    id: '1',
    title: 'Getting Started with React Native',
    description: 'Learn the basics of React Native and how to build your first mobile app with this comprehensive guide.',
    content: `React Native is a powerful framework that allows you to build native mobile applications using JavaScript and React. In this comprehensive guide, we'll explore the fundamentals of React Native and help you get started with your first mobile app.

## Why React Native?

React Native combines the best parts of native development with React, a best-in-class JavaScript library for building user interfaces. You can use React Native today in your existing Android and iOS projects or you can create a whole new app from scratch.

## Getting Started

To get started with React Native, you'll need to have Node.js installed on your computer. Then, you can use the following command to create a new React Native project:

\`\`\`bash
npx react-native init MyApp
\`\`\`

## Key Features

- **Cross-platform**: Write once, run anywhere
- **Native performance**: React Native apps are built using native components
- **Hot reloading**: See your changes instantly
- **Large ecosystem**: Access to thousands of pre-built components

## Next Steps

Once you've created your first React Native app, you can start exploring more advanced topics like:
- Navigation
- State management
- Native modules
- Performance optimization`,
    imageUrl: 'https://picsum.photos/800/400',
    date: 'March 15, 2024',
    author: 'John Doe',
    readTime: '5 min read',
  },
};

export default function PostScreen() {
  const { id } = useLocalSearchParams();
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const post = MOCK_POSTS[id as keyof typeof MOCK_POSTS];

  if (!post) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Post not found</ThemedText>
      </ThemedView>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this post: ${post.title}`,
        url: `https://yourapp.com/post/${post.id}`,
      });
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerTransparent: true,
          headerRight: () => (
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <IconSymbol
                name="square.and.arrow.up"
                size={24}
                color={isDark ? Colors.dark.text : Colors.light.text}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        <Image source={{ uri: post.imageUrl }} style={styles.image} />
        <ThemedView style={styles.content}>
          <ThemedText style={styles.title}>{post.title}</ThemedText>
          <ThemedView style={styles.metaContainer}>
            <ThemedText style={styles.metaText}>{post.author}</ThemedText>
            <ThemedText style={styles.metaText}>•</ThemedText>
            <ThemedText style={styles.metaText}>{post.date}</ThemedText>
            <ThemedText style={styles.metaText}>•</ThemedText>
            <ThemedText style={styles.metaText}>{post.readTime}</ThemedText>
          </ThemedView>
          <ThemedText style={styles.content}>{post.content}</ThemedText>
        </ThemedView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  metaText: {
    fontSize: 14,
    opacity: 0.6,
    marginHorizontal: 4,
  },
  shareButton: {
    marginRight: 16,
  },
}); 