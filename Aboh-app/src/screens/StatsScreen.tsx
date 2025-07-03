import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseScreen from '../components/BaseScreen';
import theme from '../styles/theme';
import { ScreenProps } from '../navigations/Types';

type Session = {
  userId: string;        // champ backend avec underscore
  start_time: string;     // ISO string backend
  end_time: string;       // ISO string backend
  mode: 'auto' | 'manual';
  workSeconds: number;
  pauseSeconds: number;
  workCycles: number;
  synced: boolean;
  note?: string;
  // Ajout des champs dérivés pour le front
  start?: string;
  end?: string;
};

type Props = ScreenProps<'Stats'>;

export default function StatsScreen({ route }: Props) {
  const { userId } = route.params;
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadSessions = async () => {
      try {
        const raw = await AsyncStorage.getItem('sessions');
        if (!raw) {
          setSessions([]);
          setLoading(false);
          return;
        }
        const localSessions = JSON.parse(raw);
        console.log('Raw sessions:', localSessions);

        // Log les clés pour vérifier camelCase vs snake_case
        if (localSessions.length > 0) {
          console.log('Keys in session object:', Object.keys(localSessions[0]));
        }

        // Log filtre avec comparaison exacte
        const userSessions = localSessions.filter((session: Session) => {
          console.log('filtering', session.userId, userId, session.userId === userId);
          return session.userId === userId;
        });

        console.log('Filtered sessions:', userSessions);

        // Prépare dates
        const sessionsWithDates = userSessions
          .map((s: Session) => ({
            ...s,
            start: s.start_time || s.start || null,
            end: s.end_time || s.end || null,
          }))
          .sort((a: Session, b: Session) => new Date(b.start!).getTime() - new Date(a.start!).getTime());

        console.log('Sorted sessions:', sessionsWithDates);

        setSessions(sessionsWithDates);
      } catch (e) {
        console.error('Load sessions error:', e);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadSessions();
    } else {
      setSessions([]);
      setLoading(false);
    }
  }, [userId]);



  const formatDuration = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const formatDate = (iso: string) => {
    const isoLocal = iso.endsWith('Z') ? iso.slice(0, -1) : iso;
    const d = new Date(isoLocal);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (loading) {
    return (
      <BaseScreen>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      </BaseScreen>
    );
  }

  return (
    <BaseScreen>
      <View style={styles.container}>
        <Text style={styles.title}>Historique des sessions</Text>

        {sessions.length === 0 ? (
          <Text style={{ color: theme.colors.text }}>Aucune session enregistrée</Text>
        ) : (
          <FlatList
            data={sessions}
            keyExtractor={(item, index) => `${item.start}-${index}`}
            renderItem={({ item }) => (
              <View style={styles.sessionBox}>
                <Text style={styles.date}>{new Date(item.start!).toLocaleDateString()}</Text>
                <Text style={styles.data}>Début : {formatDate(item.start!)}</Text>
                <Text style={styles.data}>Fin : {formatDate(item.end!)}</Text>
                <Text style={styles.data}>Mode : {item.mode}</Text>
                {item.mode === 'auto' ? (
                  <Text style={styles.data}>Cycles complétés : {item.workCycles ?? 0}</Text>
                ) : (
                  <>
                    <Text style={styles.data}>Travail : {formatDuration(item.workSeconds)}</Text>
                    <Text style={styles.data}>Pause : {formatDuration(item.pauseSeconds)}</Text>
                  </>
                )}
                {item.note ? <Text style={[styles.data, styles.note]}>Note : {item.note}</Text> : null}
              </View>
            )}
          />
        )}
      </View>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: theme.colors.text,
  },
  sessionBox: {
    marginBottom: 16,
    backgroundColor: '#2E4756',
    borderRadius: 12,
    padding: 12,
  },
  date: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: theme.colors.text,
  },
  data: {
    fontSize: 14,
    color: theme.colors.text,
  },
  note: {
    marginTop: 8,
    fontStyle: 'italic',
  },
});
