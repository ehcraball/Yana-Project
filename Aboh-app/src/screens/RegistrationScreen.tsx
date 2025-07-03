import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { ScreenProps } from '../navigations/Types';
import BaseScreen from '../components/BaseScreen';
import theme from '../styles/theme';
import { API_URL } from '../components/api';

export default function RegistrationScreen({ navigation }: ScreenProps<'Registration'>) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleRegister() {
    setError('');
    if (!username || !email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.detail || 'Erreur lors de la création du compte');
        return;
      }
      Alert.alert('Succès', 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
      navigation.replace('Login');
    } catch (err) {
      setError('Erreur réseau');
    }
  }


  return (
    <BaseScreen>
      <View style={styles.container}>
        <Text style={styles.styleTexte}>Créer mon compte YANA</Text>
        <TextInput
          placeholder="Nom d'utilisateur"
          placeholderTextColor={theme.colors.text}
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Email"
          placeholderTextColor={theme.colors.text}

          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
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
        <Button title="S'inscrire" onPress={handleRegister} />
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