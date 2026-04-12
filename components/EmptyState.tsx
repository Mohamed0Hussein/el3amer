import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  icon = 'cube-outline',
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  const { theme } = useTheme();

  return (
    <ThemedView variant="default" style={styles.container}>
      <ThemedView
        variant="default"
        style={[styles.iconContainer, { backgroundColor: theme.gray[100] }]}
      >
        <Ionicons name={icon} size={48} color={theme.gray[400]} />
      </ThemedView>
      <ThemedText
        variant="primary"
        size="xl"
        weight="semibold"
        style={styles.title}
      >
        {title}
      </ThemedText>
      <ThemedText variant="tertiary" size="base" style={styles.message}>
        {message}
      </ThemedText>
      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.primary[500] }]}
          onPress={onAction}
        >
          <ThemedText variant="inverse" size="base" weight="semibold">
            {actionLabel}
          </ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
});
