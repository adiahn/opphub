import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';

export function useTheme() {
  const theme = useColorScheme() ?? 'light';
  return {
    theme,
    colors: Colors[theme],
  };
} 