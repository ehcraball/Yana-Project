import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import challenges from '../assets/data/challenges.json';
import BaseScreen from '../components/BaseScreen';
import Subtitle from '../components/Subtitle';
import ListeItem from '../components/Liste';
import Button from '../components/Button';
import theme from '../styles/theme';

interface Challenge {
    id: number;
    title: string;
    description: string;
    points: number;
}

const ChallengeScreen = () => {
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [accepted, setAccepted] = useState(false);
    const [totalPoints, setTotalPoints] = useState(0);

    const today = new Date().toDateString();

    const levels = [
        { name: 'Débutant', min: 0, max: 10 },
        { name: 'Avancé', min: 11, max: 30 },
        { name: 'Expérimenté', min: 31, max: 60 },
        { name: 'Maître', min: 61, max: 100 },
        { name: 'Légende 1', min: 101, max: 150 },
        { name: 'Légende 2', min: 151, max: 210 },
        { name: 'Légende 3+', min: 211, max: Infinity },
    ];


    const loadUserPoints = async () => {
        const storedPoints = await AsyncStorage.getItem('userPoints');
        if (storedPoints) {
            setTotalPoints(parseInt(storedPoints));
        }
    };

    const loadDailyChallenge = async () => {
        const saved = await AsyncStorage.getItem('dailyChallenge');
        const acceptedDate = await AsyncStorage.getItem('challengeAcceptedDate');

        if (saved) {
            const { date, challenge } = JSON.parse(saved);
            setChallenge(challenge);

            if (date === today && acceptedDate === today) {
                setAccepted(true);
            }
        } else {
            const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
            setChallenge(randomChallenge);
            await AsyncStorage.setItem(
                'dailyChallenge',
                JSON.stringify({ date: today, challenge: randomChallenge })
            );
        }
    };

    const handleAccept = async () => {
        if (challenge && !accepted) {
            const newPoints = totalPoints + challenge.points;
            await AsyncStorage.setItem('userPoints', newPoints.toString());
            await AsyncStorage.setItem('challengeAcceptedDate', today);
            setTotalPoints(newPoints);
            setAccepted(true);
        }
    };

    function getRating(points: number): string {
        if (points <= 10) return 'Débutant';
        if (points <= 30) return 'Avancé';
        if (points <= 60) return 'Expérimenté';
        if (points <= 100) return 'Maître';
        if (points <= 150) return 'Légende 1';
        if (points <= 210) return 'Légende 2';
        return 'Légende 3+';
    }
    function getLevel(points: number) {
        return levels.find(level => points >= level.min && points <= level.max) || levels[levels.length - 1];
    }

    function getProgress(points: number) {
        const level = getLevel(points);
        if (level.max === Infinity) return 1; // Barre pleine pour max level

        const range = level.max - level.min;
        const progress = (points - level.min) / range;
        return progress;
    }
    function getNextLevel(points: number) {
        const currentIndex = levels.findIndex(level => points >= level.min && points <= level.max);
        if (currentIndex >= 0 && currentIndex < levels.length - 1) {
            return levels[currentIndex + 1];
        }
        return null; // Dernier niveau atteint
    }



    useEffect(() => {
        loadUserPoints();
        loadDailyChallenge();
    }, []);

    return (
        <BaseScreen>
            <View style={{ padding: 16 }}>
                <Subtitle>🎯 Défi du jour</Subtitle>

                <Text style={styles.score}>Total de points : {totalPoints} 🌟</Text>
                <Text style={[styles.rating, accepted ? styles.ratingActive : null]}>
                    Niveau : {getRating(totalPoints)}
                </Text>


                {challenge ? (
                    <ListeItem
                        title={challenge.title}
                        content={
                            <>
                                <Text style={styles.description}>{challenge.description}</Text>
                                <Text style={styles.points}>+{challenge.points} points</Text>
                            </>
                        }
                    />
                ) : (
                    <Text>Chargement...</Text>
                )}

                {!accepted && challenge && (
                    <Button title="Je relève le défi 💪" onPress={handleAccept} />
                )}

                {accepted && (
                    <>

                        {getNextLevel(totalPoints) && (
                            <Text style={styles.levelText}>
                                <Text style={styles.success}>Défi relevé aujourd'hui 🎉</Text>
                                {'\n'}
                                Progression vers {getNextLevel(totalPoints)?.name} ({Math.round(getProgress(totalPoints) * 100)}%)
                            </Text>
                        )}
                        {!getNextLevel(totalPoints) && (
                            <Text style={styles.levelText}>
                                <Text style={styles.success}>Défi relevé aujourd'hui 🎉</Text>
                                {'\n'}
                                Niveau maximum atteint 🚀
                            </Text>
                        )}

                        <View style={styles.xpBarContainer}>
                            <View
                                style={[
                                    styles.xpBarFill,
                                    { width: `${getProgress(totalPoints) * 100}%` },
                                ]}
                            />
                        </View>
                    </>
                )}
            </View>
        </BaseScreen>
    );
};

export default ChallengeScreen;

const styles = StyleSheet.create({
    description: {
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    points: {
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.accent,
        fontWeight: 'bold',
    },
    success: {
        marginTop: 12,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.accent,
        fontWeight: '600',
    },
    score: {
        fontSize: theme.typography.fontSize.xl,
        fontWeight: '600',
        marginBottom: 12,
        color: theme.colors.text,
    },
    rating: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 8,
    },
    ratingActive: {
        color: theme.colors.accent,
    },
    xpBarContainer: {
        height: 16,
        backgroundColor: '#eee',
        borderRadius: 8,
        overflow: 'hidden',
        marginTop: 24,
        marginHorizontal: 16,
    },
    xpBarFill: {
        height: '100%',
        backgroundColor: theme.colors.accent,
        borderRadius: 8,
    },
    levelText: {
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.text,
        marginTop: 50,
        marginBottom: 6,
        textAlign: 'center',
    },

});
