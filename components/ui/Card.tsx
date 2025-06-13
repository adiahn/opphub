import { useColorScheme } from '@/hooks/useColorScheme';
import { Link } from 'expo-router';
import { Image, ImageStyle, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { ThemedText } from '../ThemedText';

interface CardProps {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  date: string;
  views?: number;
  author?: string;
  location?: string;
  category?: string;
  likes?: number;
  visits?: number;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
}

export function Card({
  id,
  title,
  description,
  imageUrl,
  date,
  views = 0,
  author,
  location,
  category,
  likes = 0,
  visits = 0,
  style,
  imageStyle,
}: CardProps) {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';

  return (
    <Link href={`/post/${id}`} asChild>
      <Pressable style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: isDark ? '#23272F' : '#fff',
          transform: [{ scale: pressed ? 0.98 : 1 }],
          shadowOpacity: pressed ? 0.18 : 0.10,
        },
        style,
      ]}>
        <View style={styles.row}>
          {imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              style={[styles.image, imageStyle]}
              resizeMode="cover"
            />
          )}
          <View style={styles.infoContainer}>
            <ThemedText style={styles.title} numberOfLines={2}>{title}</ThemedText>
            <ThemedText style={styles.description} numberOfLines={2}>{description}</ThemedText>
            <View style={styles.metaRow}>
              {category && <ThemedText style={styles.category}>{category}</ThemedText>}
              <ThemedText style={styles.date}>{date}</ThemedText>
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    backgroundColor: '#fff',
    padding: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#eee',
    marginRight: 14,
    marginLeft: 8,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 10,
    paddingRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    color: '#222',
  },
  description: {
    fontSize: 13,
    color: '#444',
    marginBottom: 8,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  category: {
    fontSize: 12,
    color: '#4B72FA',
    backgroundColor: '#E5E8F0',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 6,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
}); 