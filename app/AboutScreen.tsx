import { useAboutStyles } from '@/styles/about.styles';
import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function AboutScreen() {
    const style = useAboutStyles();
  return (
    <ScrollView style={style.container}>
      <Text style={style.title}>About Us</Text>
      <Text style={style.text}>
        Primacy Pharma is a Contract Research Organization dedicated to innovation in
        formulation, stability studies, and product registration for pharmaceutical companies.
      </Text>
    </ScrollView>
  );
}
