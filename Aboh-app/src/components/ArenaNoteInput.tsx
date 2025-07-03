// ArenaNoteInput.tsx

import React from 'react';
import { View, Text, TextInput, StyleSheet, Button } from 'react-native';
import theme from '../styles/theme';
import Buttons from './Button';

interface ArenaNoteInputProps {
    note: string;
    onChangeNote: (text: string) => void;
    onSave: () => void;
}

const ArenaNoteInput: React.FC<ArenaNoteInputProps> = ({ note, onChangeNote, onSave }) => {
    return (
        <View style={styles.container}>
            <TextInput
                placeholder="Ce que tu as accompli..."
                placeholderTextColor={theme.colors.text}
                value={note}
                onChangeText={onChangeNote}
                multiline
                style={styles.input}
            />
            <Buttons
                title="Enregistrer"
                onPress={onSave}
            />
        </View>
    );
};

export default ArenaNoteInput;

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.background,
        padding: 12,
        borderRadius: 6,
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: theme.colors.primary,
        color: theme.colors.text,
        padding: 10,
        marginBottom: 12,
        borderRadius: 6,
        minHeight: 80,
        textAlignVertical: 'top',
        backgroundColor: theme.colors.primary,
        
    },
});
