import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, clearUserData, signup } from '../services/authSlice';
import type { AppDispatch, RootState } from '../services/store';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});

  const dispatch = useDispatch<AppDispatch>();
  const { loading, error: authError } = useSelector((state: RootState) => state.auth);

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

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    setErrors({});
    dispatch(clearError());
    dispatch(clearUserData());
    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(signup({ name, email, password })).unwrap();
      if (result) {
        router.replace('/(tabs)/home');
      }
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  return (
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
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>C</Text>
          </View>
        </View>
        <Text style={styles.welcomeText}>Create Account</Text>
        <Text style={styles.subtitleText}>Join our community</Text>
      </Animated.View>

      {/* Signup Form */}
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
        {authError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{authError}</Text>
          </View>
        )}

        {/* Name Input */}
        <View style={[styles.inputContainer, errors.name && styles.inputContainerError]}>
          <View style={styles.inputIconContainer}>
            <Ionicons name="person-outline" size={20} color={Colors.light.tint} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#666"
            autoCorrect={false}
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
            }}
          />
        </View>
        {errors.name && <Text style={styles.fieldErrorText}>{errors.name}</Text>}

        {/* Email Input */}
        <View style={[styles.inputContainer, errors.email && styles.inputContainerError]}>
          <View style={styles.inputIconContainer}>
            <Ionicons name="mail-outline" size={20} color={Colors.light.tint} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
            }}
          />
        </View>
        {errors.email && <Text style={styles.fieldErrorText}>{errors.email}</Text>}

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

        {/* Confirm Password Input */}
        <View style={[styles.inputContainer, errors.confirmPassword && styles.inputContainerError]}>
          <View style={styles.inputIconContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.light.tint} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#666"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
            }}
          />
          <TouchableOpacity 
            style={styles.showPasswordButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons 
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && <Text style={styles.fieldErrorText}>{errors.confirmPassword}</Text>}

        {/* Signup Button */}
        <TouchableOpacity 
          style={[styles.signupButton, loading && styles.signupButtonDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signupButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.light.tint,
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
  signupButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  signupButtonDisabled: {
    backgroundColor: '#ccc',
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: Colors.light.tint,
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ffd1d1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 14,
  },
  fieldErrorText: {
    color: '#ff0000',
    fontSize: 12,
    marginTop: 4,
  },
  inputContainerError: {
    borderColor: '#ff0000',
  },
}); 