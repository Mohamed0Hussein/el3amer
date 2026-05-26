import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import {
    ActivityIndicator,
    Platform,
    Pressable,
    PressableProps,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import { ThemedText } from './themed-text';

interface ThemedButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
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

  const getButtonStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? theme.gray[300] : theme.primary[500],
          ...(disabled ? {} : styles.elevation),
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? theme.gray[200] : theme.primary[50],
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? theme.gray[300] : theme.primary[500],
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
        };
      default:
        return {
          backgroundColor: disabled ? theme.gray[300] : theme.primary[500],
          ...(disabled ? {} : styles.elevation),
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return 'inverse';
      case 'secondary':
      case 'outline':
      case 'text':
        return disabled ? 'tertiary' : 'primary';
      default:
        return 'inverse';
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm': return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'md': return { paddingVertical: 12, paddingHorizontal: 24 };
      case 'lg': return { paddingVertical: 16, paddingHorizontal: 32 };
      default: return { paddingVertical: 12, paddingHorizontal: 24 };
    }
  };

  const rippleColor = variant === 'primary' 
    ? 'rgba(255, 255, 255, 0.2)' 
    : theme.primary[100];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        getButtonStyle(),
        getPadding(),
        (pressed && Platform.OS !== 'android') && { opacity: 0.7 },
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
      disabled={disabled || loading}
      android_ripple={{ color: rippleColor, borderless: false }}
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
          style={[styles.buttonText, variant !== 'primary' && { color: disabled ? theme.gray[400] : theme.primary[500] }]}
        >
          {children}
        </ThemedText>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 100, // Material pill shape
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden', // to contain the ripple effect within the pill shape
  },
  buttonText: {
    textAlign: 'center',
  },
  elevation: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
      }
    }),
  },
});