import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
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
  ...props 
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <ThemedText variant="secondary" size="sm" weight="medium" style={styles.label}>
          {label}
        </ThemedText>
      )}
      
      <View style={[
        styles.inputWrapper, 
        { backgroundColor: theme.background.card },
        error && { borderColor: theme.status.error, borderWidth: 1 }
      ]}>
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color={theme.gray[400]} 
            style={styles.inputIcon} 
          />
        )}
        
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text.primary,
            },
            rightIcon ? styles.inputWithRightIcon : null,
            style,
          ]}
          placeholderTextColor={theme.gray[400]}
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
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
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