import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { View, ViewProps } from 'react-native';

interface ThemedViewProps extends ViewProps {
  variant?: 'primary' | 'secondary' | 'card' | 'default';
}

export const ThemedView: React.FC<ThemedViewProps> = ({ 
  style, 
  variant = 'default',
  ...props 
}) => {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return theme.background.primary;
      case 'secondary':
        return theme.background.secondary;
      case 'card':
        return theme.background.card;
      default:
        return 'transparent';
    }
  };

  return (
    <View
      style={[
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
      {...props}
    />
  );
};