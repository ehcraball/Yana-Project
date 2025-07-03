import AsyncStorage from '@react-native-async-storage/async-storage';

export type Session = {
  start: string;
  end: string;
  mode: string | null;
  workSeconds: number;
  pauseSeconds: number;
  workCycles: number;
  note: string;
};

export async function saveNoteToSession(
  pendingSession: Session,
  note: string
): Promise<'success' | 'error'> {
  try {
    const completedSession: Session = {
      ...pendingSession,
      note,
    };

    const raw = await AsyncStorage.getItem('sessions');
    const existing: Session[] = raw ? JSON.parse(raw) : [];

    const filtered = existing.filter(s => s.start !== completedSession.start);
    const updated = [...filtered, completedSession];

    await AsyncStorage.setItem('sessions', JSON.stringify(updated));

    // Vérification
    const verifyRaw = await AsyncStorage.getItem('sessions');
    const verifySessions: Session[] = verifyRaw ? JSON.parse(verifyRaw) : [];
    const saved = verifySessions.find(
      s => s.start === completedSession.start && s.note === completedSession.note
    );

    return saved ? 'success' : 'error';
  } catch (e) {
    console.error('Erreur saveNoteToSession:', e);
    return 'error';
  }
}

export async function updateSessionNote(index: number, newNote: string): Promise<'success' | 'error'> {
  try {
    const raw = await AsyncStorage.getItem('sessions');
    const sessions = raw ? JSON.parse(raw) : [];
    if (index < 0 || index >= sessions.length) {
      return 'error';
    }
    sessions[index].note = newNote;
    await AsyncStorage.setItem('sessions', JSON.stringify(sessions));
    return 'success';
  } catch (e) {
    console.error('Erreur updateSessionNote', e);
    return 'error';
  }
}