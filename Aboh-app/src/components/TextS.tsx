import React from 'react';
import { Text, StyleSheet, StyleProp, TextStyle } from 'react-native';
import theme from '../styles/theme';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
};

export default function TextS({ children, style }: Props) {
  return <Text style={[styles.text, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginLeft: 50,
    marginBottom: theme.spacing.lg,
  },
});
