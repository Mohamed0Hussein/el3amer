import { useFontFamily } from '@/hooks/useFontFamily';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

interface AuthInputProps extends TextInputProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  // Adds the show/hide eye and hides the text by default.
  password?: boolean;
  // Green border and label, e.g. a strong password or a matching confirmation.
  success?: boolean;
}

const HEIGHT = 56;

// Outlined field whose label rests inside like a placeholder and floats onto
// the border while focused or filled.
export const AuthInput: React.FC<AuthInputProps> = ({ label, icon, password, success, value, placeholder, onFocus, onBlur, ...props }) => {
  const { theme } = useTheme();
  const fontFamily = useFontFamily();
  const [isFocused, setIsFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const floated = isFocused || !!value;
  const progress = useRef(new Animated.Value(floated ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, { toValue: floated ? 1 : 0, duration: 160, useNativeDriver: false }).start();
  }, [floated, progress]);

  const color = success ? theme.status.success : isFocused ? theme.primary[500] : theme.gray[400];

  return (
    <View style={styles.container}>
      <View style={[styles.field, { borderColor: color, backgroundColor: theme.background.primary }]}>
        <Ionicons name={icon} size={20} color={color} />
        <TextInput
          style={[styles.input, { color: theme.text.primary, fontFamily: fontFamily('normal') }]}
          value={value}
          placeholder={isFocused ? placeholder : undefined}
          placeholderTextColor={theme.gray[400]}
          secureTextEntry={password && hidden}
          onFocus={(e) => { setIsFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setIsFocused(false); onBlur?.(e); }}
          {...props}
        />
        {password && (
          <TouchableOpacity onPress={() => setHidden(!hidden)} hitSlop={10} accessibilityLabel={label}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={21} color={success ? color : theme.gray[500]} />
          </TouchableOpacity>
        )}
      </View>

      <Animated.Text
        pointerEvents="none"
        numberOfLines={1}
        style={[
          styles.label,
          {
            fontFamily: fontFamily('medium'),
            color: floated ? color : theme.gray[400],
            backgroundColor: theme.background.primary,
            top: progress.interpolate({ inputRange: [0, 1], outputRange: [HEIGHT / 2 - 11, -9] }),
            start: progress.interpolate({ inputRange: [0, 1], outputRange: [41, 12] }),
            fontSize: progress.interpolate({ inputRange: [0, 1], outputRange: [16, 12.5] }),
          },
        ]}
      >
        {label}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: HEIGHT,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    padding: 0,
  },
  label: {
    position: 'absolute',
    paddingHorizontal: 4,
    maxWidth: '80%',
  },
});
