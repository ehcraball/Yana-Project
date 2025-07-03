// screens/FeelingScreen.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseScreen from '../components/BaseScreen';
import Subtitle from '../components/Subtitle';
import Button from '../components/Button';
import KeyboardAvoidingWrapper from '../components/KeyboardAvoidingWrapperProps';
import Toast from 'react-native-toast-message';
import questionsData from '../assets/data/feelings.json';
import theme from '../styles/theme';

interface Question {
    id: string;
    label: string;
    type: 'scale' | 'text';
    minLabel?: string;
    maxLabel?: string;
    scale?: number;
    placeholder?: string;
    optional?: boolean;
}

interface FeelingEntry {
    date: string;
    responses: Record<string, number | string>;
}

const questions: Question[] = questionsData.map(q => ({
    ...q,
    type: q.type as "scale" | "text"
}));

const FeelingScreen = () => {
    const [responses, setResponses] = useState<Record<string, number | string>>({});
    const [todayEntry, setTodayEntry] = useState<FeelingEntry | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadTodayEntry();
    }, []);

    const loadTodayEntry = async () => {
        try {
            const today = new Date().toDateString();
            const raw = await AsyncStorage.getItem('feelingEntries');
            const entries: FeelingEntry[] = raw ? JSON.parse(raw) : [];
            const entry = entries.find(e => e.date === today);

            if (entry) {
                setTodayEntry(entry);
                setResponses(entry.responses);
            }
        } catch (error) {
            console.error('Error loading today entry:', error);
        }
    };

    const updateResponse = (questionId: string, value: number | string) => {
        setResponses(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const validateResponses = () => {
        const requiredQuestions = questions.filter(q => !q.optional);
        for (const question of requiredQuestions) {
            if (!responses[question.id]) {
                return false;
            }
        }
        return true;
    };

    const saveEntry = async () => {
        if (!validateResponses()) {
            Toast.show({
                type: 'error',
                text1: 'Questionnaire incomplet',
                text2: 'Merci de répondre à toutes les questions obligatoires',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const today = new Date().toDateString();
            const raw = await AsyncStorage.getItem('feelingEntries');
            let entries: FeelingEntry[] = raw ? JSON.parse(raw) : [];

            const existingIndex = entries.findIndex(e => e.date === today);
            const newEntry: FeelingEntry = {
                date: today,
                responses: { ...responses }
            };

            if (existingIndex >= 0) {
                entries[existingIndex] = newEntry;
            } else {
                entries.push(newEntry);
            }

            await AsyncStorage.setItem('feelingEntries', JSON.stringify(entries));
            await AsyncStorage.setItem('feelingAnsweredDate', today);

            setTodayEntry(newEntry);

            Toast.show({
                type: 'success',
                text1: 'Succès',
                text2: todayEntry ? 'Réponses mises à jour 👌' : 'Questionnaire sauvegardé 👌',
            });
        } catch (error) {
            console.error('Error saving entry:', error);
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: 'Impossible de sauvegarder 😞',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderScaleQuestion = (question: Question) => {
        const currentValue = responses[question.id] as number || 0;

        return (
            <View key={question.id} style={styles.questionContainer} >
                <Text style={styles.questionLabel}>{question.label}</Text>
                <View style={styles.scaleContainer}>
                    <Text style={styles.scaleLabel}>{question.minLabel}</Text>
                    <View style={styles.scaleButtons}>
                        {Array.from({ length: question.scale! }, (_, i) => i + 1).map(value => (
                            <TouchableOpacity
                                key={value}
                                style={[
                                    styles.scaleButton,
                                    currentValue === value && styles.scaleButtonActive
                                ]}
                                onPress={() => updateResponse(question.id, value)}
                            >
                                <Text style={[
                                    styles.scaleButtonText,
                                    currentValue === value && styles.scaleButtonTextActive
                                ]}>
                                    {value}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={styles.scaleLabel}>{question.maxLabel}</Text>
                </View>
            </View>
        );
    };

    const renderTextQuestion = (question: Question) => {
        return (
            <View key={question.id} style={styles.questionContainer}>
                <Text style={styles.questionLabel}>{question.label}</Text>
                <TextInput
                    style={styles.textInput}
                    multiline
                    value={responses[question.id] as string || ''}
                    onChangeText={(text) => updateResponse(question.id, text)}
                    placeholder={question.placeholder}
                    placeholderTextColor="#999"
                    scrollEnabled={false}

                />
            </View>
        );
    };

    const renderQuestion = (question: Question) => {
        switch (question.type) {
            case 'scale':
                return renderScaleQuestion(question);
            case 'text':
                return renderTextQuestion(question);
            default:
                return null;
        }
    };

    const getTodayDateString = () => {
        return new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <KeyboardAvoidingWrapper>
            <BaseScreen>
                <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
                    <Subtitle>Questionnaire du jour</Subtitle>
                    <Text style={styles.dateText}>📅 {getTodayDateString()}</Text>

                    {todayEntry && (
                        <View style={styles.alreadyCompletedContainer}>
                            <Text style={styles.alreadyCompletedText}>
                                ✅ Tu as déjà rempli le questionnaire aujourd'hui. Tu peux modifier tes réponses si tu le souhaites.
                            </Text>
                        </View>
                    )}

                    {questions.map(renderQuestion)}

                    <View style={styles.buttonContainer}>
                        <Button
                            title={isSubmitting ? "Sauvegarde..." : (todayEntry ? "Mettre à jour" : "Sauvegarder")}
                            onPress={saveEntry}
                            disabled={isSubmitting}
                        />
                    </View>
                </ScrollView>
            </BaseScreen>
        </KeyboardAvoidingWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 30,
    },
    dateText: {
        fontSize: 16,
        color: theme.colors.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    alreadyCompletedContainer: {
        backgroundColor: '#e8f5e9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    alreadyCompletedText: {
        color: '#2E7D32',
        fontSize: 14,
        fontWeight: '500',
    },
    questionContainer: {
        marginBottom: 24,
        backgroundColor: theme.colors.primary,
        padding: 16,
        borderRadius: 8,
    },
    questionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 12,
    },
    scaleContainer: {
        alignItems: 'center',
    },
    scaleButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 8,
    },
    scaleButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    scaleButtonActive: {
        backgroundColor: theme.colors.accent,
        borderColor: theme.colors.accent,
    },
    scaleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.accent,
    },
    scaleButtonTextActive: {
        color: theme.colors.text,
    },
    scaleLabel: {
        fontSize: 12,
        color: theme.colors.text,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    textInput: {
        backgroundColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        minHeight: 60,
        fontSize: 16,
        color: theme.colors.text,
        textAlignVertical: 'top',
    },
    buttonContainer: {
        marginTop: 20,
        marginBottom: 40,
    },
});

export default FeelingScreen;