import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LATEST_ADDITIONS = [
  {
    id: '1',
    title: 'African Youth Biodiversity Summit 2025',
    description: 'Funded To Kigali, Rwanda : Apply for the African Youth Biodiversity Summit 2025',
    imageUrl: 'https://picsum.photos/800/400',
    date: '23 Days',
    category: 'Conferences',
    location: 'African Countries',
    views: 1200,
    author: 'Jane Doe',
    likes: 320,
    visits: 1500,
  },
  {
    id: '2',
    title: 'International Computer Science Competition 2025',
    description: 'International Computer Science Competition 2025',
    imageUrl: 'https://picsum.photos/800/401',
    date: '74 Days',
    category: 'Competitions',
    location: 'Online',
    views: 980,
    author: 'John Smith',
    likes: 210,
    visits: 1100,
  },
];

const TRENDING_OPPORTUNITIES = [
  {
    id: '3',
    title: 'Vacancy for Cabin Crew at Emirates',
    description: 'Vacancy for Cabin Crew at Emirates',
    imageUrl: 'https://picsum.photos/800/402',
    date: 'Closed',
    location: 'United Arab Emirates',
    views: 2100,
    author: 'Emirates HR',
    likes: 500,
    visits: 3000,
  },
  {
    id: '4',
    title: 'DAAD/EPOS Scholarships for Young Professionals from Developing Countries 2025',
    description: 'DAAD/EPOS Scholarships for Young Professionals from Developing Countries 2025 (Fully Funded)',
    imageUrl: 'https://picsum.photos/800/403',
    date: '126 Days',
    location: 'Germany',
    views: 1750,
    author: 'DAAD',
    likes: 420,
    visits: 2200,
  },
];

const CATEGORIES = [
  { id: 'cat1', name: 'Competitions' },
  { id: 'cat2', name: 'Conferences' },
  { id: 'cat3', name: 'Scholarships' },
  { id: 'cat4', name: 'Internships' },
  { id: 'cat5', name: 'Workshops' },
  { id: 'cat6', name: 'Grants' },
];

export default function HomeScreen() {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeHeader}>
        <ThemedText style={styles.headerTitle}>Opportunities Hub</ThemedText>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Latest Additions */}
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={styles.sectionTitle}>Fresh Opportunities</ThemedText>
          <TouchableOpacity>
            <ThemedText style={styles.seeAll}>Browse All</ThemedText>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {LATEST_ADDITIONS.map((item) => (
            <View key={item.id} style={styles.latestCardWrapper}>
              <Card
                id={item.id}
                title={item.title}
                description={item.description}
                imageUrl={item.imageUrl}
                date={item.date}
                views={item.views}
                author={item.author}
                location={item.location}
                category={item.category}
                likes={item.likes}
                visits={item.visits}
              />
            </View>
          ))}
        </ScrollView>

        {/* Trending Opportunities */}
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={styles.sectionTitle}>Popular Now</ThemedText>
          <TouchableOpacity>
            <ThemedText style={styles.seeAll}>Browse All</ThemedText>
          </TouchableOpacity>
        </View>
        <View>
          {TRENDING_OPPORTUNITIES.map((item) => (
            <View key={item.id} style={styles.trendingCardWrapper}>
              <View style={styles.trendingImageWrapper}>
                <Image source={{ uri: item.imageUrl }} style={styles.trendingImage} />
              </View>
              <View style={styles.trendingContent}>
                <ThemedText style={styles.trendingTitle} numberOfLines={2}>{item.title}</ThemedText>
                <View style={styles.badgeRow}>
                  <View style={styles.badge}><ThemedText style={styles.badgeText}>{item.location}</ThemedText></View>
                  <View style={styles.badge}><ThemedText style={styles.badgeText}>{item.date}</ThemedText></View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Top Categories */}
        <ThemedText style={styles.sectionTitle}>Filters</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {CATEGORIES.map((cat) => (
            <View key={cat.id} style={styles.categoryPill}>
              <ThemedText style={styles.categoryPillText}>{cat.name}</ThemedText>
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginTop: 18,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '700',
  },
  seeAll: {
    color: Colors.light.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  horizontalScroll: {
    marginBottom: 10,
  },
  latestCardWrapper: {
    width: 210,
    marginRight: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
  trendingCardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    padding: 8,
    minHeight: 90,
  },
  trendingImageWrapper: {
    width: 54,
    height: 54,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10,
  },
  trendingImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  trendingContent: {
    flex: 1,
    minHeight: 54,
    justifyContent: 'center',
  },
  trendingTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  categoryPill: {
    backgroundColor: '#E5E8F0',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A3A3A',
  },
  safeHeader: {
    backgroundColor: '#fff',
    zIndex: 10,
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 8,
    borderBottomWidth: 0,
  },
});
