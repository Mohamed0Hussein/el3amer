import { ThemedText } from '@/components/themed-text';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const RULES = [
  { label: 'rule8Chars', test: (p: string) => p.length >= 8 },
  { label: 'A-Z', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'a-z', test: (p: string) => /[a-z]/.test(p) },
  { label: '123', test: (p: string) => /\d/.test(p) },
  { label: '@#$', test: (p: string) => /[^A-Za-z0-9\s]/.test(p) },
] as const;

// How many of the rules above the password meets, 0–5.
export const passwordScore = (password: string) => RULES.filter((r) => r.test(password)).length;

// Strength bar plus the rule chips under the sign-up password field. Guidance
// only: the hard minimum stays the backend's.
export function PasswordStrength({ password }: { password: string }) {
  const { t } = useLocalization();
  const { theme } = useTheme();
  const score = passwordScore(password);
  const [word, color] =
    score >= 5 ? [t('strong'), theme.status.success] : score >= 3 ? [t('medium'), theme.status.warning] : [t('weak'), theme.status.error];

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <ThemedText size="xs" variant="secondary">{t('passwordStrength')}</ThemedText>
        {!!password && <ThemedText size="xs" weight="bold" style={{ color }}>{word}</ThemedText>}
      </View>
      <View style={[styles.track, { backgroundColor: theme.gray[100] }]}>
        <View style={[styles.fill, { width: `${(score / RULES.length) * 100}%`, backgroundColor: color }]} />
      </View>
      <View style={styles.rules}>
        {RULES.map((rule) => {
          const met = rule.test(password);
          return (
            <View key={rule.label} style={styles.rule}>
              <Ionicons name={met ? 'checkmark-circle' : 'ellipse'} size={met ? 14 : 10} color={met ? theme.status.success : theme.gray[300]} />
              <ThemedText size="xs" style={{ color: met ? theme.status.success : theme.gray[400] }}>
                {rule.label === 'rule8Chars' ? t('rule8Chars') : rule.label}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: -8,
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  track: {
    height: 4,
    borderRadius: 999,
    marginTop: 6,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  rules: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
  },
  rule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
