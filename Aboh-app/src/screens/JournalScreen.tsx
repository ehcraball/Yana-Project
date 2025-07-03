// screens/JournalScreen.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, TextInput, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ListeItem from '../components/Liste';
import Subtitle from '../components/Subtitle';
import BaseScreen from '../components/BaseScreen';
import Buttons from '../components/Button';
import KeyboardAvoidingWrapper from '../components/KeyboardAvoidingWrapperProps';
import Toast from 'react-native-toast-message';
import { updateSessionNote } from '../utils/noteServices';

interface Session {
    start: string;
    end: string;
    note: string;
    mode: string;
}

const JournalScreen = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingNote, setEditingNote] = useState('');

    useEffect(() => {
        const loadSessions = async () => {
            const raw = await AsyncStorage.getItem('sessions');
            const data: Session[] = raw ? JSON.parse(raw) : [];
            const withNotes = data.filter(session => session.note?.trim());
            setSessions(withNotes.reverse());
        };
        loadSessions();
    }, []);

    const startEditing = (index: number) => {
        setEditingIndex(index);
        setEditingNote(sessions[index].note);
    };

    const saveEdit = async () => {
        if (editingIndex === null) return;
        const result = await updateSessionNote(editingIndex, editingNote);
        if (result === 'success') {
            const updated = [...sessions];
            updated[editingIndex].note = editingNote;
            setSessions(updated);
            setEditingIndex(null);
            setEditingNote('');
            Toast.show({
                type: 'success',
                text1: 'Succès',
                text2: 'Note modifiée avec succès 👌',
            });
        } else {
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: "Impossible de modifier la note 😞",
            });
        }
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setEditingNote('');
    };

    const handleDelete = async (index: number) => {
        const updated = [...sessions];
        updated.splice(index, 1);
        setSessions(updated);
        await AsyncStorage.setItem('sessions', JSON.stringify(updated));
        Toast.show({
            type: 'success',
            text1: 'Succès',
            text2: 'Note supprimée 👌',
        });
        if (editingIndex === index) {
            cancelEdit();
        }
    };

    return (
        <KeyboardAvoidingWrapper>

            <BaseScreen>
                <ScrollView style={{ padding: 16 }}>
                    <Subtitle>Journal de sessions</Subtitle>
                    {sessions.map((session, index) => (
                        <View key={index} style={{ marginBottom: 24 }}>
                            <ListeItem
                                title={`📅 ${new Date(session.start).toLocaleString()}`}
                                content={
                                    editingIndex === index ? (
                                        <TextInput
                                            style={styles.textInput}
                                            multiline
                                            value={editingNote}
                                            onChangeText={setEditingNote}
                                            autoFocus
                                            scrollEnabled={false}
                                        />
                                    ) : (
                                        session.note
                                    )
                                }
                                onEdit={
                                    editingIndex === index
                                        ? saveEdit
                                        : () => startEditing(index)
                                }
                                onDelete={() => handleDelete(index)}
                                editLabel={editingIndex === index ? 'Save' : 'Edit 📝'}
                                deleteLabel="Delete ❌"
                            />
                            {editingIndex === index && (
                                <Buttons title="Annuler" onPress={cancelEdit} />
                            )}
                        </View>
                    ))}
                </ScrollView>
            </BaseScreen>
        </KeyboardAvoidingWrapper>
    );
};

const styles = StyleSheet.create({
    textInput: {
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 6,
        padding: 8,
        minHeight: 60,
        fontSize: 16,
        color: '#000',
    },
});

export default JournalScreen;
