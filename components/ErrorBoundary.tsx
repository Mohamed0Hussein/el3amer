import { reportError } from '@/lib/sentry';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

interface Props {
  children: React.ReactNode;
  onReset?: () => void;
}

interface State {
  error: Error | null;
}

/**
 * Last-resort, provider-independent crash screen. Deliberately avoids
 * ThemedText/useLocalization/context of any kind — if a Provider itself
 * throws during render, this boundary must still be able to render.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] caught render error:', error, info.componentStack);
    reportError(error);
  }

  reset = () => {
    this.props.onReset?.();
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return <CrashFallback error={this.state.error} onReset={this.reset} />;
    }
    return this.props.children;
  }
}

function CrashFallback({ error, onReset }: { error: Error; onReset: () => void }) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <Ionicons name="warning-outline" size={56} color={colors.status.error} />
      <Text style={[styles.title, { color: colors.text.primary }]}>Something went wrong</Text>
      <Text style={[styles.message, { color: colors.text.secondary }]}>
        The app ran into an unexpected problem. Try again — if it keeps happening, restart the app.
      </Text>
      {__DEV__ && (
        <Text style={[styles.devError, { color: colors.status.error }]} numberOfLines={6}>
          {error.name}: {error.message}
        </Text>
      )}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary[500] }]}
        onPress={onReset}
      >
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 16,
  },
  devError: {
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  button: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 100,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
