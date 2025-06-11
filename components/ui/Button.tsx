import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StyleSheet, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { ThemedText } from '../ThemedText';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export function Button({ 
  onPress, 
  title, 
  variant = 'primary', 
  style, 
  textStyle,
  disabled = false 
}: ButtonProps) {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';

  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: isDark ? Colors.dark.secondary : Colors.light.secondary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: isDark ? Colors.dark.text : Colors.light.text,
        };
      default:
        return {
          backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary,
        };
    }
  };

  const getTextColor = () => {
    if (variant === 'outline') {
      return isDark ? Colors.dark.text : Colors.light.text;
    }
    return '#FFFFFF';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <ThemedText
        style={[
          styles.text,
          { color: getTextColor() },
          textStyle,
        ]}
      >
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
}); 