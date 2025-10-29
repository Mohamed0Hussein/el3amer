import { useSettingsStyles } from '@/styles/settings.styles';
import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function SettingsScreen() {
    const styles = useSettingsStyles();
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.text}>
        Customize your app preferences, switch themes, and manage notifications here.
      </Text>
    </ScrollView>
  );
}
