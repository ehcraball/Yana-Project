import React from 'react';
import { Text, StyleSheet, StyleProp, TextStyle } from 'react-native';
import theme from '../styles/theme';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
};

export default function Subtitle({ children, style }: Props) {
  return <Text style={[styles.Subtitle, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  Subtitle: {
    fontWeight: 'bold',
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
});
