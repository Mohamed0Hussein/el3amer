import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    TouchableOpacityProps,
} from 'react-native';
import { ThemedText } from './themed-text';

interface ThemedButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: string;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  style,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  ...props
}) => {
  const { theme } = useTheme();

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? theme.gray[300] : theme.primary[500],
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? theme.gray[200] : theme.gray[100],
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? theme.gray[300] : theme.primary[500],
        };
      default:
        return {
          backgroundColor: disabled ? theme.gray[300] : theme.primary[500],
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return 'inverse';
      case 'secondary':
        return 'primary';
      case 'outline':
        return disabled ? 'tertiary' : 'success';
      default:
        return 'inverse';
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm': return { paddingVertical: 8, paddingHorizontal: 12 };
      case 'md': return { paddingVertical: 12, paddingHorizontal: 16 };
      case 'lg': return { paddingVertical: 16, paddingHorizontal: 20 };
      default: return { paddingVertical: 12, paddingHorizontal: 16 };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getPadding(),
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? theme.text.inverse : theme.primary[500]} 
        />
      ) : (
        <ThemedText
          variant={getTextColor() as any}
          size={size === 'sm' ? 'sm' : 'base'}
          weight="semibold"
          style={styles.buttonText}
        >
          {children}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    textAlign: 'center',
  },
});