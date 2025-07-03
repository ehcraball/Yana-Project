import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenProps } from '../navigations/Types';
import BaseScreen from '../components/BaseScreen';
import theme from '../styles/theme';
import { API_URL } from '../components/api';


export default function LoginScreen({ navigation }: ScreenProps<'Login'>) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    async function handleLogin() {
        try {
            const response = await fetch(`${API_URL}/users/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ username, password }).toString(),
            });

            if (!response.ok) {
                setError('Identifiants incorrects');
                return;
            }

            const data = await response.json();
            await AsyncStorage.setItem('token', data.access_token);

            // 🔥 Nouvelle requête pour récupérer les infos utilisateur
            const userResponse = await fetch(`${API_URL}/users/me`, {
                headers: { Authorization: `Bearer ${data.access_token}` },
            });

            if (userResponse.ok) {
                const user = await userResponse.json();
                await AsyncStorage.setItem('user', JSON.stringify(user));
            }

            setError('');
            navigation.replace('Home');
        } catch (err) {
            setError('Erreur réseau');
        }
    }


    return (
        <BaseScreen>
            <View style={styles.container}>
                <Text style={styles.styleTexte}>Connexion</Text>
                <TextInput
                    placeholder="Nom d'utilisateur"
                    placeholderTextColor={theme.colors.text}
                    value={username}
                    onChangeText={setUsername}
                    style={styles.input}
                    autoCapitalize="none"
                />
                <TextInput
                    placeholder="Mot de passe"
                    placeholderTextColor={theme.colors.text}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Button title="Se connecter" onPress={handleLogin} />
                <Button
                    title="Pas encore de compte ? Inscrivez-vous"
                    onPress={() => navigation.navigate('Registration')}
                    color={theme.colors.accent}
                />
            </View>
        </BaseScreen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    error: { color: 'red', marginBottom: 10 },
    styleTexte: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: theme.colors.text,
    },
    input: {
        height: 40,
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: theme.border.radius.md,
        borderColor: theme.colors.accent,
        backgroundColor: theme.colors.primary,
        color: theme.colors.text,
    },
});
