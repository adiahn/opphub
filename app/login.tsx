import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, clearUserData, login } from '../services/authSlice';
import type { AppDispatch, RootState } from '../services/store';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [showAuthError, setShowAuthError] = useState(true);

  const dispatch = useDispatch<AppDispatch>();
  const { loading, error: authError, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Animation values
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

  // Clear auth error when component mounts
  useEffect(() => {
    dispatch(clearError());
    setShowAuthError(true);
  }, [dispatch]);

  useEffect(() => {
    if (authError) setShowAuthError(true);
  }, [authError]);

  // Navigate to home when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User authenticated, navigating to home');
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated]);

  const validateForm = () => {
    const newErrors: { username?: string; password?: string } = {};
    
    if (!username.trim()) {
      newErrors.username = 'Username or email is required';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    // Clear previous errors
    setErrors({});
    dispatch(clearError());
    
    // Clear any existing user data before logging in
    dispatch(clearUserData());
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      console.log('Starting login process...');
      const result = await dispatch(login({ email: username, password })).unwrap();
      console.log('Login successful:', result);
      // Navigation will be handled by the useEffect above
    } catch (error) {
      console.error('Login failed:', error);
      // Error is handled by the Redux slice
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <StatusBar style="light" />
        
        {/* Logo and Welcome Section */}
        <Animated.View 
          style={[
            styles.headerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.logoContainer}>
            <Image source={require('../src/1.png')} style={styles.logo} />
          </View>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitleText}>Sign in to continue</Text>
        </Animated.View>
        <Animated.View 
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {/* General Error Message */}
          {authError && showAuthError && (
            <View style={
              authError.includes('Unable to connect to the server')
                ? [styles.errorBanner, styles.networkErrorBanner]
                : styles.errorBanner
            }>
              <Ionicons
                name={
                  authError.includes('Unable to connect to the server')
                    ? 'cloud-offline-outline'
                    : 'alert-circle-outline'
                }
                size={22}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.errorBannerText}>{authError}</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAuthError(false);
                  dispatch(clearError());
                }}
                style={styles.errorBannerDismiss}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {/* Username/Email Input */}
          <View style={[styles.inputContainer, errors.username && styles.inputContainerError]}>
            <View style={styles.inputIconContainer}>
              <Ionicons name="person-outline" size={20} color={Colors.light.tint} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Username or Email"
              placeholderTextColor="#666"
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (errors.username) setErrors(prev => ({ ...prev, username: undefined }));
              }}
            />
          </View>
          {errors.username && <Text style={styles.fieldErrorText}>{errors.username}</Text>}

          {/* Password Input */}
          <View style={[styles.inputContainer, errors.password && styles.inputContainerError]}>
            <View style={styles.inputIconContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.light.tint} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#666"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
              }}
            />
            <TouchableOpacity 
              style={styles.showPasswordButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.fieldErrorText}>{errors.password}</Text>}

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.tint,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputIconContainer: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  showPasswordButton: {
    padding: 12,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: Colors.light.tint,
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: Colors.light.tint,
    fontSize: 14,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  errorBannerText: {
    color: '#fff',
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  errorBannerDismiss: {
    marginLeft: 8,
    padding: 4,
  },
  inputContainerError: {
    borderColor: '#D32F2F',
    borderWidth: 1,
  },
  fieldErrorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
    marginLeft: 12,
  },
  networkErrorBanner: {
    backgroundColor: '#f39c12', // orange for network errors
  },
}); 