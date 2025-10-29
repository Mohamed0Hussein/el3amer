import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { StyleSheet } from 'react-native';

export const useHomeStyles = () => {
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
      marginBottom: Spacing.md,
    },
    subtitle: {
      fontSize: FontSize.lg,
      color: theme.textSecondary,
      marginBottom: Spacing.xxl,
    },
    button: {
      backgroundColor: theme.primary,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
      borderRadius: BorderRadius.lg,
      marginBottom: Spacing.md,
    },
    buttonText: {
      color: theme.textWhite,
      fontSize: FontSize.lg,
      fontWeight: FontWeight.semibold,
      textAlign: 'center',
    },
    buttonSecondary: {
      backgroundColor: theme.backgroundGray,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
      borderRadius: BorderRadius.lg,
    },
    buttonTextSecondary: {
      color: theme.text,
      fontSize: FontSize.lg,
      fontWeight: FontWeight.medium,
      textAlign: 'center',
    },
  });
};
