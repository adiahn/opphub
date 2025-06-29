import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  icon: string;
  backgroundColor: string;
  backgroundImage?: any;
  backgroundVideo?: any;
  overlayOpacity?: number;
  image?: any;
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Welcome to Q',
    description: 'Your gateway to a vibrant community of learners, creators, and innovators. Connect, share, and grow together.',
    icon: 'people-outline',
    backgroundColor: '#667eea',
    backgroundImage: require('../src/a.jpg'),
    overlayOpacity: 0.4
  },
  {
    id: 2,
    title: 'Share Your Skills',
    description: 'Showcase your expertise, projects, and achievements. Build your professional portfolio and get recognized.',
    icon: 'star-outline',
    backgroundColor: '#764ba2',
    backgroundVideo: require('../src/c.mp4'),
    overlayOpacity: 0.3
  },
  {
    id: 3,
    title: 'Connect & Collaborate',
    description: 'Find like-minded individuals, join communities, and collaborate on exciting projects. Your network is your net worth.',
    icon: 'rocket-outline',
    backgroundColor: '#f093fb',
    backgroundImage: require('../src/b.jpg'),
    overlayOpacity: 0.35
  },
  {
    id: 4,
    title: 'Ready to Start?',
    description: 'Join thousands of users who are already building their future with Q. Create your account and begin your journey.',
    icon: 'checkmark-circle-outline',
    backgroundColor: '#4facfe',
    backgroundImage: require('../src/a.jpg'),
    overlayOpacity: 0.25
  }
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      scrollViewRef.current?.scrollTo({
        x: nextSlide * width,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    console.log('Onboarding: handleSkip called');
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    console.log('Onboarding: handleGetStarted called');
    console.log('Onboarding: Current slide:', currentSlide);
    console.log('Onboarding: Total slides:', onboardingSlides.length);
    
    try {
      // Mark onboarding as completed
      await SecureStore.setItemAsync('onboardingCompleted', 'true');
      
      // Set a flag to indicate user just completed onboarding
      await SecureStore.setItemAsync('justCompletedOnboarding', 'true');
      
      console.log('Onboarding: Marked as completed, navigating to login');
      
      // Add a small delay to ensure the storage is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to login
      console.log('Onboarding: About to navigate to /login');
      router.push('/login');
      console.log('Onboarding: Navigation command sent');
    } catch (error) {
      console.error('Onboarding: Error in handleGetStarted:', error);
    }
  };

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  const renderSlide = (slide: OnboardingSlide, index: number) => (
    <View key={slide.id} style={[styles.slide, { backgroundColor: slide.backgroundColor }]}>
      {/* Background Image or Video */}
      {slide.backgroundImage && (
        <View style={styles.backgroundImageContainer}>
          <Image 
            source={slide.backgroundImage} 
            style={styles.backgroundImage}
            resizeMode="cover"
          />
          {/* Gradient Overlay */}
          <View style={[styles.backgroundOverlay, { opacity: slide.overlayOpacity || 0.6 }]} />
          <View style={styles.gradientOverlay} />
        </View>
      )}
      
      {slide.backgroundVideo && (
        <View style={styles.backgroundVideoContainer}>
          <Video
            source={slide.backgroundVideo}
            style={styles.backgroundVideo}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
            isMuted
          />
          {/* Gradient Overlay */}
          <View style={[styles.backgroundOverlay, { opacity: slide.overlayOpacity || 0.6 }]} />
          <View style={styles.gradientOverlay} />
        </View>
      )}
      
      <Animated.View
        style={[
          styles.slideContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        {/* Background Image/Icon */}
        <View style={styles.imageContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name={slide.icon as any} size={120} color="#fff" />
          </View>
        </View>

        {/* Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {index < onboardingSlides.length - 1 ? (
            <>
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Next</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
              <Text style={styles.getStartedButtonText}>Get Started</Text>
              <Ionicons name="rocket" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipOverlay} onPress={handleSkip}>
        <Text style={styles.skipOverlayText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {onboardingSlides.map((slide, index) => renderSlide(slide, index))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        {onboardingSlides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentSlide && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  skipOverlay: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipOverlayText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  slideContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
    paddingBottom: 80,
    zIndex: 1,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 100,
  },
  slideImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  iconContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 100,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 26,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipButtonText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  getStartedButtonText: {
    color: Colors.light.tint,
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    // Create a gradient effect using multiple layers
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  backgroundVideoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundVideo: {
    width: '100%',
    height: '100%',
  },
}); 