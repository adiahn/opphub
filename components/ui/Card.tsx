import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Link } from 'expo-router';
import { Image, ImageStyle, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface CardProps {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  date: string;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
}

export function Card({
  id,
  title,
  description,
  imageUrl,
  date,
  style,
  imageStyle,
}: CardProps) {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';

  return (
    <Link href="/post" asChild>
      <ThemedView
        style={[
          styles.container,
          {
            backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
            borderColor: isDark ? '#333' : '#eee',
          },
          style,
        ]}
      >
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={[styles.image, imageStyle]}
            resizeMode="cover"
          />
        )}
        <ThemedView style={styles.content}>
          <ThemedText style={styles.title} numberOfLines={2}>
            {title}
          </ThemedText>
          <ThemedText style={styles.description} numberOfLines={3}>
            {description}
          </ThemedText>
          <ThemedText style={styles.date}>{date}</ThemedText>
        </ThemedView>
      </ThemedView>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    opacity: 0.8,
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
  },
}); 