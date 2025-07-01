import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function AboutScreen() {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <ThemedView style={styles.container}>
      {/* Floating Back Button */}
      <TouchableOpacity 
        style={[styles.floatingBackButton, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)' }]}
        onPress={() => router.back()}
      >
        <Ionicons 
          name="arrow-back" 
          size={24} 
          color={isDark ? '#fff' : '#333'} 
        />
      </TouchableOpacity>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <LinearGradient
          colors={isDark ? ['#1a1a2e', '#16213e'] : ['#667eea', '#764ba2']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={[styles.logoContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name="rocket" size={40} color="#fff" />
            </View>
            <ThemedText style={styles.appName}>Opportunitiesx Hub</ThemedText>
            <ThemedText style={styles.tagline}>Empowering Nigerian Youth</ThemedText>
          </View>
        </LinearGradient>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Mission Section */}
          <View style={[styles.section, { backgroundColor: isDark ? '#23272F' : '#f8fafd' }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flag" size={24} color={colors.tint} />
              <ThemedText style={styles.sectionTitle}>Our Mission</ThemedText>
            </View>
            <ThemedText style={styles.sectionText}>
              To connect Nigerian youth with life-changing opportunities through a powerful mobile platform that curates verified, relevant, and impactful opportunities.
            </ThemedText>
          </View>

          {/* What We Offer */}
          <View style={[styles.section, { backgroundColor: isDark ? '#23272F' : '#f8fafd' }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star" size={24} color={colors.tint} />
              <ThemedText style={styles.sectionTitle}>What We Offer</ThemedText>
            </View>
            
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Ionicons name="briefcase" size={20} color={colors.tint} />
                <ThemedText style={styles.featureText}>Job Listings & Career Opportunities</ThemedText>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="school" size={20} color={colors.tint} />
                <ThemedText style={styles.featureText}>Scholarships & Educational Programs</ThemedText>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="trending-up" size={20} color={colors.tint} />
                <ThemedText style={styles.featureText}>Business Grants & Funding</ThemedText>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="library" size={20} color={colors.tint} />
                <ThemedText style={styles.featureText}>Skill Development Programs</ThemedText>
              </View>
            </View>
          </View>

          {/* Why Choose Us */}
          <View style={[styles.section, { backgroundColor: isDark ? '#23272F' : '#f8fafd' }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-checkmark" size={24} color={colors.tint} />
              <ThemedText style={styles.sectionTitle}>Why Choose Us</ThemedText>
            </View>
            
            <View style={styles.benefitGrid}>
              <View style={[styles.benefitCard, { backgroundColor: isDark ? '#1a1a2e' : '#fff' }]}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <ThemedText style={styles.benefitTitle}>Verified Opportunities</ThemedText>
                <ThemedText style={styles.benefitText}>All opportunities are carefully vetted and verified</ThemedText>
              </View>
              
              <View style={[styles.benefitCard, { backgroundColor: isDark ? '#1a1a2e' : '#fff' }]}>
                <Ionicons name="time" size={24} color="#2196F3" />
                <ThemedText style={styles.benefitTitle}>Real-time Updates</ThemedText>
                <ThemedText style={styles.benefitText}>Stay updated with the latest opportunities</ThemedText>
              </View>
              
              <View style={[styles.benefitCard, { backgroundColor: isDark ? '#1a1a2e' : '#fff' }]}>
                <Ionicons name="phone-portrait" size={24} color="#FF9800" />
                <ThemedText style={styles.benefitTitle}>Clean Interface</ThemedText>
                <ThemedText style={styles.benefitText}>User-friendly design for seamless experience</ThemedText>
              </View>
              
              <View style={[styles.benefitCard, { backgroundColor: isDark ? '#1a1a2e' : '#fff' }]}>
                <Ionicons name="people" size={24} color="#9C27B0" />
                <ThemedText style={styles.benefitTitle}>Community Focus</ThemedText>
                <ThemedText style={styles.benefitText}>Built specifically for Nigerian youth</ThemedText>
              </View>
            </View>
          </View>

          {/* Call to Action */}
          <View style={[styles.ctaSection, { backgroundColor: isDark ? '#1a1a2e' : '#667eea' }]}>
            <Ionicons name="rocket-outline" size={32} color="#fff" />
            <ThemedText style={styles.ctaTitle}>Ready to Transform Your Future?</ThemedText>
            <ThemedText style={styles.ctaText}>
              Join thousands of Nigerian youth who are already taking control of their future with Opportunities Hub.
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  content: {
    padding: 20,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  benefitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  benefitCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  benefitText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 16,
  },
  ctaSection: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 10,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  floatingBackButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
  },
}); 