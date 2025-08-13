import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface AuthPromptProps {
  title?: string;
  message?: string;
  buttonText?: string;
  icon?: string;
}

export function AuthPrompt({ 
  title = "Authentication Required", 
  message = "You need to log in to access this feature.",
  buttonText = "Sign In",
  icon = "lock-closed-outline"
}: AuthPromptProps) {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const colorSet = Colors[theme];
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colorSet.background }]}>
      <View style={[styles.content, { backgroundColor: colorSet.card }]}>
        <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(74, 144, 226, 0.1)' : 'rgba(0, 122, 255, 0.1)' }]}>
          <Ionicons 
            name={icon as any} 
            size={48} 
            color={isDark ? '#4A90E2' : colorSet.tint} 
          />
        </View>
        
        <ThemedText style={[styles.title, { color: colorSet.text }]}>
          {title}
        </ThemedText>
        
        <ThemedText style={[styles.message, { color: colorSet.textSecondary }]}>
          {message}
        </ThemedText>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: isDark ? '#4A90E2' : colorSet.tint }]}
          onPress={() => router.push('/login')}
        >
          <ThemedText style={[styles.buttonText, { color: '#fff' }]}>
            {buttonText}
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ThemedText style={[styles.backButtonText, { color: colorSet.textSecondary }]}>
            Go Back
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 320,
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
