import React from 'react';
import { SafeAreaView, StyleSheet, ViewStyle, StyleProp } from 'react-native';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function BaseScreen({ children, style }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <SafeAreaView style={[styles.inner, style]}>
        {children}
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16262E',
    paddingTop: 20,  
  },
  inner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});
