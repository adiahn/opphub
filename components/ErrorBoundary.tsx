import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRestart = () => {
    Alert.alert(
      'Restart App',
      'Would you like to restart the app?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Restart', 
          onPress: () => {
            // Reset the error state
            this.setState({ hasError: false, error: undefined, errorInfo: undefined });
          }
        }
      ]
    );
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRestart={this.handleRestart} error={this.state.error} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  onRestart: () => void;
  error?: Error;
}

function ErrorFallback({ onRestart, error }: ErrorFallbackProps) {
  const theme = useColorScheme() ?? 'light';
  const colorSet = Colors[theme];
  const isDark = theme === 'dark';

  return (
    <ThemedView style={[styles.container, { backgroundColor: colorSet.background }]}>
      <View style={styles.content}>
        <ThemedText style={[styles.title, { color: colorSet.text }]}>
          Oops! Something went wrong
        </ThemedText>
        <ThemedText style={[styles.message, { color: colorSet.textSecondary }]}>
          The app encountered an unexpected error. We're sorry for the inconvenience.
        </ThemedText>
        
        {__DEV__ && error && (
          <View style={[styles.errorContainer, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5' }]}>
            <ThemedText style={[styles.errorTitle, { color: colorSet.text }]}>
              Error Details (Development):
            </ThemedText>
            <ThemedText style={[styles.errorText, { color: colorSet.textSecondary }]}>
              {error.message}
            </ThemedText>
            {error.stack && (
              <ThemedText style={[styles.errorStack, { color: colorSet.textSecondary }]}>
                {error.stack}
              </ThemedText>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.restartButton, { backgroundColor: colorSet.primary }]}
          onPress={onRestart}
        >
          <ThemedText style={[styles.restartButtonText, { color: colorSet.card }]}>
            Restart App
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
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
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  restartButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  restartButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 