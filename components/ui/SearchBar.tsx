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
  const colorSet = Colors[theme];

  return (
    <ThemedView
      style={[
        styles.container,
        {
          backgroundColor: theme === 'dark' ? '#23272F' : '#F2F2F7',
        },
        style,
      ]}
    >
      <IconSymbol
        name="magnifyingglass"
        size={20}
        color={colorSet.icon}
        style={styles.icon}
      />
      <TextInput
        style={[
          styles.input,
          {
            color: colorSet.text,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme === 'dark' ? colorSet.textSecondary : '#999'}
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