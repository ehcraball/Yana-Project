import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseScreen from '../components/BaseScreen';
import Title from '../components/Title';
import Subtitle from '../components/Subtitle';
import Button from '../components/Button';
import { ScreenProps } from '../navigations/Types';
import theme from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }: ScreenProps<'Home'>) {
  const [hasPendingChallenge, setHasPendingChallenge] = useState(false);
  const [needsFeeling, setNeedsFeeling] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState<string | null>(null);


  useEffect(() => {
    const checkStatus = async () => {
      const today = new Date().toDateString();

      const acceptedDate = await AsyncStorage.getItem('challengeAcceptedDate');
      setHasPendingChallenge(acceptedDate !== today);

      const feelingAnsweredDate = await AsyncStorage.getItem('feelingAnsweredDate');
      setNeedsFeeling(feelingAnsweredDate !== today);

      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);

      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        console.log('[HomeScreen] Fetched user:', user);
        setUserName(user.username || '');
        setUserId(user.id ?? null);
      }
    };

    checkStatus();
    const unsubscribe = navigation.addListener('focus', checkStatus);
    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setIsLoggedIn(false);
    setUserName('');
    navigation.replace('Login');
  };

  return (
    <BaseScreen>
      {isLoggedIn && (
        <TouchableOpacity style={styles.logoutIcon} onPress={handleLogout} accessibilityLabel="Déconnexion">
          <View style={styles.logoutIconCircle}>
            <Ionicons name="log-out-outline" size={24} color={theme.colors.text} />
          </View>
        </TouchableOpacity>
      )}

      <Title>{userName ? `Bienvenue ${userName} 👋` : 'Bienvenue sur YANA'}</Title>
      <Subtitle>YANA : Votre aide au quotidien</Subtitle>

      <Button title="Pomodoro" onPress={() => navigation.navigate('Timer')} />
      <Button title="Journal de suivi" onPress={() => navigation.navigate('Journal')} />
      <Button
        title="Statistiques"
        onPress={() => navigation.navigate('Stats', { userId: userId ?? '' })}
      />
      {!isLoggedIn && (
        <Button title="Se connecter" onPress={() => navigation.navigate('Login')} />
      )}

      <Button
        title={`Défi du jour${hasPendingChallenge ? ' ⭐' : ''}`}
        onPress={() => navigation.navigate('Challenge')}
        color={hasPendingChallenge ? theme.colors.accent : undefined}
        style={
          hasPendingChallenge
            ? { borderWidth: 2, borderColor: '#c2ae2d' }
            : undefined
        }
      />

      <View style={styles.floatingButtonContainer}>
        <Button
          title={needsFeeling ? '⭐' : '👌'}
          onPress={() => navigation.navigate('Feeling')}
          color={theme.colors.accent}
          style={
            needsFeeling
              ? {
                borderColor: '#c2ae2d',
                borderWidth: 2,
                width: 70,
                height: 70,
                borderRadius: 40,
              }
              : styles.floatingButton
          }
          textStyle={styles.floatingButtonText}
        />
      </View>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  logoutIcon: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 100,
  },
  logoutIconCircle: {
    backgroundColor: theme.colors.accent,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 10,
    right: 1,
    zIndex: 10,
  },
  floatingButton: {
    width: 70,
    height: 70,
    borderRadius: 40,
    backgroundColor: theme.colors.accent,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 0,
    padding: 0,
  },
  floatingButtonText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
    textAlign: 'center',
  },
});
