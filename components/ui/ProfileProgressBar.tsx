import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProfileProgressBarProps {
  percentage: number;
}

const ProfileProgressBar: React.FC<ProfileProgressBarProps> = ({ percentage }) => {
  const theme = useColorScheme() ?? 'light';
  const colorSet = Colors[theme];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colorSet.textSecondary }]}>
        Profile Completion
      </Text>
      <View style={[styles.barBackground, { backgroundColor: theme === 'dark' ? '#23272F' : '#e5e7eb' }]}> {/* fallback for subtle bg */}
        <View style={[styles.barFill, { width: `${Math.min(percentage, 100)}%`, backgroundColor: colorSet.primary }]} />
      </View>
      <Text style={[styles.percentText, { color: colorSet.text }]}>{Math.round(percentage)}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  barBackground: {
    width: '90%',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: 10,
    borderRadius: 5,
  },
  percentText: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ProfileProgressBar; 