import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { DimensionValue, StyleSheet, View, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 20, borderRadius = 8, style }) => {
  const theme = useColorScheme() ?? 'light';
  const bgColor = theme === 'dark' ? '#23272F' : '#E1E9EE';
  return (
    <View
      style={[
        styles.skeleton,
        { width, height, borderRadius, backgroundColor: bgColor },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
    marginVertical: 4,
    opacity: 0.7,
  },
}); 