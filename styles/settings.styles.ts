import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { StyleSheet } from 'react-native';

export const useSettingsStyles = () => {
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
      marginBottom: Spacing.lg,
    },
    card: {
      backgroundColor: theme.backgroundWhite,
      padding: Spacing.lg,
      borderRadius: BorderRadius.md,
      shadowColor: theme.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
  });
};
