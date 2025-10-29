import { FontSize, FontWeight, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { StyleSheet } from 'react-native';

export const useProfileStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: Spacing.xl,
    },
    title: {
      fontSize: FontSize.xxxl,
      fontWeight: FontWeight.bold,
      color: theme.text,
      marginBottom: Spacing.lg,
    },
    text: {
      fontSize: FontSize.lg,
      color: theme.textSecondary,
      lineHeight: 22,
    },
  });
};
