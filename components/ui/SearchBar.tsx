import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StyleSheet, TextInput, ViewStyle } from 'react-native';
import { ThemedView } from '../ThemedView';
import { IconSymbol } from './IconSymbol';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  style,
}: SearchBarProps) {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';

  return (
    <ThemedView
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
        },
        style,
      ]}
    >
      <IconSymbol
        name="magnifyingglass"
        size={20}
        color={isDark ? Colors.dark.icon : Colors.light.icon}
        style={styles.icon}
      />
      <TextInput
        style={[
          styles.input,
          {
            color: isDark ? Colors.dark.text : Colors.light.text,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#666' : '#999'}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
}); 