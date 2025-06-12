import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Image, ImageStyle, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { IconSymbol } from './IconSymbol';

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

  // Generate author initials if author is provided
  const authorInitials = author
    ? author
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : undefined;

  return (
    <Link href={`/post/${id}`} asChild>
      <Pressable style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: '#FAFAFA',
          borderColor: isDark ? '#333' : '#eee',
          transform: [{ scale: pressed ? 0.98 : 1 }],
          shadowOpacity: pressed ? 0.18 : 0.10,
        },
        style,
      ]}>
        {imageUrl && (
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: imageUrl }}
              style={[styles.image, imageStyle]}
              resizeMode="cover"
            />
            {/* Gradient overlay for readability */}
            <LinearGradient
              colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.7)"]}
              style={styles.gradientOverlay}
            />
            {/* Floating badges */}
            <View style={styles.floatingBadges}>
              <View style={styles.badge}>
                <IconSymbol name="eye.fill" size={12} color="#fff" />
                <ThemedText style={styles.badgeText}>{views}</ThemedText>
              </View>
              <View style={styles.badge}>
                <IconSymbol name="calendar" size={12} color="#fff" />
                <ThemedText style={styles.badgeText}>{date}</ThemedText>
              </View>
            </View>
            {/* Author avatar (optional) */}
            {authorInitials && (
              <View style={styles.avatar}>
                <ThemedText style={styles.avatarText}>{authorInitials}</ThemedText>
              </View>
            )}
          </View>
        )}
        <ThemedView style={styles.content}>
          <ThemedText style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </ThemedText>
          <ThemedText style={styles.description} numberOfLines={1} ellipsizeMode="tail">
            {description}
          </ThemedText>
          <View style={styles.badgeRow}>
            <View style={styles.badgeLight}>
              <IconSymbol name="favorite" size={12} color="#888" />
              <ThemedText style={styles.badgeTextLight}>{likes}</ThemedText>
            </View>
            <View style={styles.badgeLight}>
              <IconSymbol name="bar-chart" size={12} color="#888" />
              <ThemedText style={styles.badgeTextLight}>{visits}</ThemedText>
            </View>
            {location && (
              <View style={styles.badgeLight}>
                <IconSymbol name="location.fill" size={10} color="#888" />
                <ThemedText style={styles.badgeTextLight}>{location}</ThemedText>
              </View>
            )}
            {category && (
              <View style={styles.badgeLight}>
                <IconSymbol name="tag.fill" size={10} color="#888" />
                <ThemedText style={styles.badgeTextLight}>{category}</ThemedText>
              </View>
            )}
          </View>
        </ThemedView>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 2,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 90,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 40,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  floatingBadges: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 3,
    fontWeight: '600',
  },
  avatar: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarText: {
    color: '#222',
    fontWeight: '700',
    fontSize: 17,
  },
  content: {
    paddingTop: 14,
    paddingHorizontal: 8,
    minHeight: 70,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 2,
    color: '#222',
    letterSpacing: 0.05,
  },
  description: {
    fontSize: 17,
    lineHeight: 25,
    marginBottom: 4,
    opacity: 0.85,
    color: '#444',
    letterSpacing: 0.02,
    fontWeight: '400',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  badgeLight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginRight: 3,
    marginBottom: 3,
  },
  badgeTextLight: {
    fontSize: 14,
    color: '#555',
    fontWeight: '400',
    marginLeft: 2,
  },
}); 