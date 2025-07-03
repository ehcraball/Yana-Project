import React from 'react';
import { Text, StyleSheet, StyleProp, TextStyle } from 'react-native';
import theme from '../styles/theme';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
};

export default function Title({ children, style }: Props) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontWeight: 'bold',
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text,
    marginTop: theme.spacing.big,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
});
