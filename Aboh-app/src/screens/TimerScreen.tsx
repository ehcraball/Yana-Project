import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import BaseScreen from '../components/BaseScreen';
import Button from '../components/Button';
import ArenaNoteInput from '../components/ArenaNoteInput';
import { saveNoteToSession } from '../utils/noteServices';
import theme from '../styles/theme';
import LottieView from 'lottie-react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import Toast from 'react-native-toast-message';
import { API_URL } from '../components/api';


const { width } = Dimensions.get('window');
const circleSize = width * 0.8;
const workDuration = 0.1 * 60;
const breakDuration = 0.1 * 60;
const STORAGE_KEYS = {
    manualWorkSeconds: 'manualWorkSeconds',
    manualPauseSeconds: 'manualPauseSeconds',
    autoWorkCycles: 'autoWorkCycles',
};



async function saveManualWorkSeconds(seconds: number) {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.manualWorkSeconds, seconds.toString());
    } catch (e) {
        console.error('Error saving manualWorkSeconds', e);
    }
}

async function saveManualPauseSeconds(seconds: number) {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.manualPauseSeconds, seconds.toString());
    } catch (e) {
        console.error('Error saving manualPauseSeconds', e);
    }
}

async function saveAutoWorkCycles(cycles: number) {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.autoWorkCycles, cycles.toString());
    } catch (e) {
        console.error('Error saving autoWorkCycles', e);
    }
}

async function loadManualStats() {
    try {
        const work = await AsyncStorage.getItem(STORAGE_KEYS.manualWorkSeconds);
        const pause = await AsyncStorage.getItem(STORAGE_KEYS.manualPauseSeconds);
        const workCycles = await AsyncStorage.getItem(STORAGE_KEYS.autoWorkCycles);
        return {
            manualWorkSeconds: work ? parseInt(work, 10) : 0,
            manualPauseSeconds: pause ? parseInt(pause, 10) : 0,
            autoWorkCycles: workCycles ? parseInt(workCycles, 10) : 0,
        };
    } catch (e) {
        console.error('Error loading manual stats', e);
        return { manualWorkSeconds: 0, manualPauseSeconds: 0, autoWorkCycles: 0 };
    }
}


export default function TimerScreen() {
    const [mode, setMode] = useState<'auto' | 'manual' | null>(null);
    const [showModeSelection, setShowModeSelection] = useState(false);
    const [timeLeft, setTimeLeft] = useState(workDuration);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
    const [userId, setUserId] = useState<string | null>(null);


    // Auto mode
    const [phase, setPhase] = useState<'work' | 'break'>('work');
    const [autoCycleRunning, setAutoCycleRunning] = useState(false);
    const [workCycles, setWorkCycles] = useState(0);

    // Manual mode
    const [manualWorkSeconds, setManualWorkSeconds] = useState(0);
    const [manualPauseSeconds, setManualPauseSeconds] = useState(0);

    // Notes
    const [note, setNote] = useState('');
    const [showNoteInput, setShowNoteInput] = useState(false);
    const [pendingSession, setPendingSession] = useState<any>(null);

    // Clear any existing interval
    const clearTimer = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const handleStart = () => {
        setShowModeSelection(true);
        setManualWorkSeconds(0);
        setManualPauseSeconds(0);
        setTimeLeft(workDuration);
        if (!sessionStartTime) {
            setSessionStartTime(new Date());
        }
    };

    const selectMode = (selectedMode: 'auto' | 'manual') => {
        setMode(selectedMode);
        setShowModeSelection(false);
        setManualWorkSeconds(0);
        setManualPauseSeconds(0);
        setTimeLeft(workDuration);
        setSessionStartTime(new Date());

        if (selectedMode === 'manual') {
            setIsRunning(true);
        } else {
            setPhase('work');
            setWorkCycles(0);
            setAutoCycleRunning(true);
            setIsRunning(true);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const formatHMS = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };


    useEffect(() => {
        const fetchUserId = async () => {
            const userJson = await AsyncStorage.getItem('user');
            if (userJson) {
                const user = JSON.parse(userJson);
                console.log('[TimerScreen] Fetched user from AsyncStorage:', user);
                setUserId(user.id ?? null);
            } else {
                console.log('[TimerScreen] No user found in AsyncStorage');
                setUserId(null);
            }
        };
        fetchUserId();
    }, []);


    async function playSoundStart() {
        const { sound } = await Audio.Sound.createAsync(
            require('../assets/sounds/break-start.mp3'),
            { shouldPlay: true }
        );
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate(status => {
            if ('didJustFinish' in status && status.didJustFinish) {
                sound.unloadAsync();
            }
        });
    }

    async function playSoundStop() {
        const { sound } = await Audio.Sound.createAsync(
            require('../assets/sounds/break-stop.mp3'),
            { shouldPlay: true }
        );
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate(status => {
            if ('didJustFinish' in status && status.didJustFinish) {
                sound.unloadAsync();
            }
        });
    }

    // Play sounds when manual mode starts/stops running
    useEffect(() => {
        if (mode === 'manual') {
            if (isRunning) {
                playSoundStart();
            } else {
                playSoundStop();
            }
        }
    }, [isRunning, mode]);

    // Manual mode timer
    useEffect(() => {
        if (mode === 'manual' && isRunning) {
            clearTimer();
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        playSoundStart();
                        return workDuration;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearTimer();
        }
        return clearTimer;
    }, [mode, isRunning]);

    // Auto mode timer + cycles + sounds
    useEffect(() => {
        if (mode === 'auto' && autoCycleRunning && isRunning) {
            setTimeLeft(phase === 'work' ? workDuration : breakDuration);
            clearTimer();
            const id = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        if (phase === 'work') {
                            setWorkCycles(c => c + 1);
                            playSoundStop(); // start break sound
                            setPhase('break');
                            return breakDuration;
                        } else {
                            playSoundStart(); // start work sound
                            setPhase('work');
                            return workDuration;
                        }
                    }
                    return prev - 1;
                });
            }, 1000);
            intervalRef.current = id;
            return () => clearInterval(id);
        }
    }, [mode, autoCycleRunning, phase, isRunning]);

    // Manual mode work/pause counters
    useEffect(() => {
        let id: NodeJS.Timeout | null = null;
        if (mode === 'manual' && isRunning) {
            id = setInterval(() => {
                setManualWorkSeconds(prev => {
                    const newVal = prev + 1;
                    saveManualWorkSeconds(newVal);
                    return newVal;
                });
            }, 1000);
        } else if (mode === 'manual' && !isRunning) {
            id = setInterval(() => {
                setManualPauseSeconds(prev => {
                    const newVal = prev + 1;
                    saveManualPauseSeconds(newVal);
                    return newVal;
                });
            }, 1000);
        }
        return () => {
            if (id) clearInterval(id);
        };
    }, [mode, isRunning]);

    // Load manual stats at mode start
    useEffect(() => {
        if (mode === 'manual') {
            loadManualStats().then(({ manualWorkSeconds, manualPauseSeconds }) => {
                setManualWorkSeconds(manualWorkSeconds);
                setManualPauseSeconds(manualPauseSeconds);
            });
        }
    }, [mode]);

    const syncSession = async (session: any, token: string) => {
        try {
            const response = await fetch(`${API_URL}/work_sessions/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    start_time: session.start,
                    end_time: session.end,
                    mode: session.mode,
                    work_duration: session.workSeconds,
                    pause_duration: session.pauseSeconds,
                    work_cycles: session.workCycles,
                    note: session.note ?? '',
                }),
            });

            if (!response.ok) {
                console.warn('[TimerScreen] Sync session failed:', await response.text());
                return false;
            }
            return true;
        } catch (e) {
            console.warn('[TimerScreen] Sync session error:', e);
            return false;
        }
    };

    const handleStop = async () => {
        clearTimer();

        if (!mode || !sessionStartTime) {
            console.log('[TimerScreen] handleStop called but no mode or sessionStartTime set');
            return resetSessionState();
        }
        const sessionEndTime = new Date();

        const session = {
            userId,
            start: sessionStartTime.toISOString(),
            end: sessionEndTime.toISOString(),
            mode,
            workSeconds: manualWorkSeconds,
            pauseSeconds: manualPauseSeconds,
            workCycles: mode === 'auto' ? workCycles : 0,
            note: '',
        };

        console.log('[TimerScreen] Session stopped, session data:', session);

        setPendingSession(session);
        setShowNoteInput(true);

        try {
            await saveManualPauseSeconds(0);
            await saveManualWorkSeconds(0);
            await saveAutoWorkCycles(workCycles);
            console.log('[TimerScreen] Manual stats reset in AsyncStorage');
        } catch (error) {
            console.error('[TimerScreen] Error resetting manual stats:', error);
        }

        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const success = await syncSession(session, token);
                if (success) {
                    console.log('[TimerScreen] Session synced successfully');
                } else {
                    console.log('[TimerScreen] Session sync failed, will retry later');
                }
            } else {
                console.log('[TimerScreen] No token found, session not synced');
            }
        } catch (e) {
            console.error('[TimerScreen] Error during session sync:', e);
        }

        resetSessionState();
    };

    const resetSessionState = () => {
        setMode(null);
        setShowModeSelection(false);
        setIsRunning(false);
        setAutoCycleRunning(false);
        setPhase('work');
        setTimeLeft(workDuration);
        setManualWorkSeconds(0);
        setManualPauseSeconds(0);
        setWorkCycles(0);
        setSessionStartTime(null);
    };

    const handleSaveNote = async () => {
        if (!pendingSession) {
            console.warn('[TimerScreen] handleSaveNote called but no pendingSession');
            return;
        }

        console.log('[TimerScreen] Saving note for session:', pendingSession);
        console.log('[TimerScreen] Note content:', note);

        const result = await saveNoteToSession(pendingSession, note);

        if (result === 'success') {
            console.log('[TimerScreen] Note saved successfully');
            Toast.show({
                type: 'success',
                text1: 'Succès',
                text2: 'Votre note a bien été enregistrée 👌',
            });
            setNote('');
            setPendingSession(null);
            setShowNoteInput(false);
        } else {
            console.error('[TimerScreen] Failed to save note');
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: "La note n'a pas pu être enregistrée 😞",
            });
        }
    };


    return (
        <BaseScreen>
            <View style={styles.container}>
                <Text style={styles.title}>Pomodoro Timer</Text>
                {!showModeSelection && !mode && !showNoteInput && (
                    <Button title="Lancer le timer" onPress={handleStart} />
                )}

                {showModeSelection && !mode && (
                    <View style={styles.modeButtons}>
                        <Button title="Mode Auto" onPress={() => selectMode('auto')} />
                        <Button title="Mode Manuel" onPress={() => selectMode('manual')} />
                    </View>
                )}

                {mode === 'manual' && (
                    <View style={styles.timerBox}>
                        <View style={styles.waveCircle}>
                            <LottieView
                                source={require('../assets/animations/waves.json')}
                                autoPlay
                                loop
                                style={styles.lottie}
                                resizeMode="cover"
                            />
                            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                        </View>

                        <View style={styles.buttonRow}>
                            <Button
                                title={isRunning ? 'Pause' : 'Reprendre'}
                                onPress={() => setIsRunning(prev => !prev)}
                            />
                            <Button title="Stop" onPress={handleStop} />
                        </View>

                        <View style={{ alignItems: 'center', marginBottom: 12 }}>
                            <Text style={{ color: theme.colors.text }}>
                                Temps de travail : {formatHMS(manualWorkSeconds)}
                            </Text>
                            <Text style={{ color: theme.colors.text }}>
                                Temps de pause : {formatHMS(manualPauseSeconds)}
                            </Text>
                        </View>
                    </View>
                )}

                {mode === 'auto' && (
                    <View style={styles.timerBox}>
                        <View style={styles.waveCircle}>
                            <LottieView
                                source={require('../assets/animations/waves.json')}
                                autoPlay
                                loop
                                style={styles.lottie}
                                resizeMode="cover"
                            />
                            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                            <Text style={{ color: theme.colors.text, marginTop: 8 }}>
                                {phase === 'work' ? 'Temps de travail' : 'Pause'}
                            </Text>
                        </View>

                        <View style={styles.buttonRow}>
                            <Button title="Stop" onPress={handleStop} />
                        </View>

                        <Text style={{ color: theme.colors.text, marginBottom: 8 }}>
                            Cycles complétés : {workCycles}
                        </Text>
                    </View>
                )}

                {showNoteInput && (
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                        <View style={{ flex: 1, padding: 16 }}>
                            <Text style={styles.title}>Ajoute une note sur ta session :</Text>
                            <ArenaNoteInput
                                note={note}
                                onChangeNote={setNote}
                                onSave={handleSaveNote}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                )}

            </View>
        </BaseScreen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 40,
    },
    modeButtons: {
        gap: 30,
    },
    timerBox: {
        alignItems: 'center',
        marginTop: 40,
    },
    waveCircle: {
        width: circleSize,
        height: circleSize,
        borderRadius: circleSize / 2,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#c0c8d6',
        marginBottom: 20,
    },
    lottie: {
        ...StyleSheet.absoluteFillObject,
    },
    timerText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 30,
    },
});
