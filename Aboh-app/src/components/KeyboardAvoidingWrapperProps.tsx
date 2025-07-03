// components/KeyboardAvoidingWrapper.tsx
import React from 'react';
import { KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, StyleSheet, View } from 'react-native';

export default function KeyboardAvoidingWrapper({ children }: { children: React.ReactNode }) {
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.inner}>
                    {children}
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    inner: {
        padding: 0,
        flex: 1,
    },
});