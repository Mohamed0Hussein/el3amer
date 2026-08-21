import { useFontFamily } from '@/hooks/useFontFamily';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View
} from 'react-native';
import { ThemedText } from './themed-text';

interface ThemedTextInputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: React.ReactNode;
  error?: string;
  containerStyle?: any;
}

export const ThemedTextInput: React.FC<ThemedTextInputProps> = ({ 
  label,
  icon,
  rightIcon,
  error,
  containerStyle,
  style, 
  onFocus,
  onBlur,
  ...props 
}) => {
  const { theme } = useTheme();
  const fontFamily = useFontFamily();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <ThemedText variant="secondary" size="sm" weight="medium" style={[styles.label, isFocused && { color: theme.primary[500] }]}>
          {label}
        </ThemedText>
      )}
      
      <View style={[
        styles.inputWrapper, 
        { 
          backgroundColor: theme.background.primary,
          borderColor: error ? theme.status.error : (isFocused ? theme.primary[500] : theme.gray[400]),
          borderWidth: isFocused ? 2 : 1,
        }
      ]}>
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color={error ? theme.status.error : (isFocused ? theme.primary[500] : theme.gray[400])} 
            style={styles.inputIcon} 
          />
        )}
        
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text.primary,
              fontFamily: fontFamily('normal'),
            },
            rightIcon ? styles.inputWithRightIcon : null,
            style,
          ]}
          placeholderTextColor={theme.gray[400]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {rightIcon && (
          <View style={styles.rightIcon}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && (
        <ThemedText variant="error" size="sm" style={styles.errorText}>
          {error}
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    padding: 0,
    margin: 0,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
  },
});