import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import theme from '../styles/theme';

type ButtonVariant = 'default' | 'horizontal';

type Props = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  color?: string;
  style? : ViewStyle;
  disabled?: boolean;
  textStyle?: TextStyle;
};

export default function Button({
  title,
  onPress,
  variant = 'default',
  color,
  style,
  textStyle: customTextStyle,
}: Props) {
  const buttonStyle: ViewStyle =
    variant === 'horizontal'
      ? {
          ...styles.horizontalButton,
          backgroundColor: color ?? theme.colors.primary,
        }
      : {
          ...styles.defaultButton,
          backgroundColor: color ?? theme.colors.primary,
        };

  const textStyle = [variant === 'horizontal' ? styles.horizontalText : styles.defaultText, customTextStyle];

  return (
    <TouchableOpacity style={[buttonStyle, style]} onPress={onPress}>
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Bouton par défaut (utilisé partout ailleurs)
  defaultButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.center,
  },
  defaultText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.md,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },

  // Bouton compact (horizontal)
  horizontalButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    minWidth: 80,
  },
  horizontalText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
  },
});
