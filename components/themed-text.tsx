import { useFontFamily } from '@/hooks/useFontFamily';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { Text, TextProps } from 'react-native';

interface ThemedTextProps extends TextProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'success' | 'error';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  style,
  variant = 'primary',
  size = 'base',
  weight = 'normal',
  ...props
}) => {
  const { theme } = useTheme();
  const fontFamily = useFontFamily();

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return theme.text.primary;
      case 'secondary':
        return theme.text.secondary;
      case 'tertiary':
        return theme.text.tertiary;
      case 'inverse':
        return theme.text.inverse;
      case 'success':
        return theme.status.success;
      case 'error':
        return theme.status.error;
      default:
        return theme.text.primary;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'xs': return 12;
      case 'sm': return 14;
      case 'base': return 16;
      case 'lg': return 18;
      case 'xl': return 20;
      case '2xl': return 24;
      case '3xl': return 30;
      default: return 16;
    }
  };

  const getFontWeight = () => {
    switch (weight) {
      case 'normal': return '400';
      case 'medium': return '500';
      case 'semibold': return '600';
      case 'bold': return '700';
      case 'extrabold': return '800';
      default: return '400';
    }
  };

  return (
    <Text
      style={[
        {
          color: getTextColor(),
          fontSize: getFontSize(),
          fontWeight: getFontWeight(),
          fontFamily: fontFamily(weight),
        },
        style,
      ]}
      {...props}
    />
  );
};