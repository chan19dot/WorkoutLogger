import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { Typography } from '../../components/Typography';
import { WorkoutSession, WorkoutSet, WorkoutStore } from '../../store/WorkoutStore';
import { borderRadius, colors, shadows, spacing } from '../../theme';

export default function WorkoutSessionScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [session, setSession] = useState<WorkoutSession | null>(null);

    useEffect(() => {
        if (id) {
            loadSession(id as string);
        }
    }, [id]);

    const loadSession = async (sessionId: string) => {
        const data = await WorkoutStore.getSession(sessionId);
        setSession(data);
    };

    const duplicateExercise = (exerciseId: string) => {
        if (!session) return;
        const updatedSession = JSON.parse(JSON.stringify(session)) as WorkoutSession;
        const exIndex = updatedSession.exercises.findIndex(e => e.id === exerciseId);
        if (exIndex >= 0) {
            const original = updatedSession.exercises[exIndex];
            const copied = JSON.parse(JSON.stringify(original));
            copied.id = `dup-${Date.now()}-${Math.random()}`;
            copied.sets.forEach((s: any) => { s.id = `set-${Date.now()}-${Math.random()}`; s.completed = false; });
            updatedSession.exercises.splice(exIndex + 1, 0, copied);
            setSession(updatedSession);
        }
    };

    const deleteExerciseInfo = (exerciseId: string) => {
        if (!session) return;
        const updatedSession = JSON.parse(JSON.stringify(session)) as WorkoutSession;
        updatedSession.exercises = updatedSession.exercises.filter(e => e.id !== exerciseId);
        setSession(updatedSession);
    };

    const updateSet = (exerciseId: string, setId: string, field: keyof WorkoutSet, value: any) => {
        if (!session) return;

        // Deep clone to avoid direct mutation
        const updatedSession = JSON.parse(JSON.stringify(session)) as WorkoutSession;
        const exercise = updatedSession.exercises.find(e => e.id === exerciseId);
        if (!exercise) return;

        const set = exercise.sets.find(s => s.id === setId);
        if (!set) return;

        (set as any)[field] = value;
        setSession(updatedSession);
    };

    const saveWorkout = async () => {
        if (!session) return;

        // Check if at least one set is completed
        const hasCompletedSets = session.exercises.some(e => e.sets.some(s => s.completed));
        if (!hasCompletedSets) {
            alert("Please complete at least one set before saving.");
            return;
        }

        const updatedSession = { ...session, completed: true };
        await WorkoutStore.updateSession(updatedSession);
        router.replace('/');
    };

    if (!session) {
        return (
            <Screen style={styles.center}>
                <Typography>Loading workout...</Typography>
            </Screen>
        );
    }

    return (
        <Screen style={styles.container}>
            <View style={styles.header}>
                <Button
                    title="<"
                    variant="ghost"
                    onPress={() => router.back()}
                    style={styles.backButton}
                />
                <Typography variant="h2">{session.name}</Typography>
                <View style={styles.placeholder} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {session.exercises.map((exercise) => (
                    <Card key={exercise.id} variant="flat" style={styles.exerciseCard}>
                        <View style={styles.exerciseHeaderRow}>
                            <Typography variant="h3" style={styles.exerciseName}>
                                {exercise.exercise.name.toUpperCase()}
                            </Typography>
                            <View style={styles.exerciseActionsRow}>
                                <TouchableOpacity onPress={() => duplicateExercise(exercise.id)} style={styles.miniBtn}>
                                    <Typography variant="smallBold" style={{ color: colors.primary }}>Copy</Typography>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => deleteExerciseInfo(exercise.id)} style={styles.miniBtn}>
                                    <Typography variant="smallBold" style={{ color: colors.error }}>Del</Typography>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.tableHeader}>
                            <Typography variant="smallBold" style={styles.colSet}>SET</Typography>
                            <Typography variant="smallBold" style={styles.colInput}>KG</Typography>
                            <Typography variant="smallBold" style={styles.colInput}>REPS</Typography>
                            <Typography variant="smallBold" style={styles.colCheck}>DONE</Typography>
                        </View>

                        {exercise.sets.map((set, index) => (
                            <View
                                key={set.id}
                                style={[
                                    styles.setRow,
                                    set.completed && styles.setRowCompleted
                                ]}
                            >
                                <Typography variant="smallBold" style={styles.colSet}>
                                    {index + 1}
                                </Typography>

                                <TextInput
                                    style={[styles.input, styles.colInput, set.completed && styles.inputCompleted]}
                                    value={set.weight.toString()}
                                    onChangeText={(val) => updateSet(exercise.id, set.id, 'weight', Number(val) || 0)}
                                    keyboardType="numeric"
                                    editable={!set.completed}
                                />

                                <TextInput
                                    style={[styles.input, styles.colInput, set.completed && styles.inputCompleted]}
                                    value={set.reps.toString()}
                                    onChangeText={(val) => updateSet(exercise.id, set.id, 'reps', Number(val) || 0)}
                                    keyboardType="numeric"
                                    editable={!set.completed}
                                />

                                <TouchableOpacity
                                    style={[styles.checkbox, set.completed && styles.checkboxActive]}
                                    onPress={() => updateSet(exercise.id, set.id, 'completed', !set.completed)}
                                >
                                    {set.completed && <Typography style={styles.checkmark}>✓</Typography>}
                                </TouchableOpacity>
                            </View>
                        ))}

                        <Button
                            title="+ Add Set"
                            variant="ghost"
                            style={styles.addSetButton}
                            onPress={() => {
                                const updatedSession = JSON.parse(JSON.stringify(session)) as WorkoutSession;
                                const ex = updatedSession.exercises.find(e => e.id === exercise.id);
                                if (ex) {
                                    const lastSet = ex.sets[ex.sets.length - 1];
                                    ex.sets.push({
                                        id: `set-${Date.now()}`,
                                        reps: lastSet ? lastSet.reps : 10,
                                        weight: lastSet ? lastSet.weight : 0,
                                        completed: false,
                                    });
                                    setSession(updatedSession);
                                }
                            }}
                        />
                    </Card>
                ))}

                <Button
                    title="Finish Workout"
                    onPress={saveWorkout}
                    style={styles.finishButton}
                    variant="primary"
                />
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.sm,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        paddingHorizontal: spacing.md,
        height: 40,
    },
    placeholder: {
        width: 60,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: spacing.xxl * 2,
    },
    exerciseCard: {
        marginBottom: spacing.xl,
        padding: spacing.xl,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    exerciseName: {
        color: colors.primary,
        flex: 1,
        letterSpacing: 1,
        fontWeight: '900',
    },
    exerciseHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xl,
    },
    exerciseActionsRow: {
        flexDirection: 'row',
    },
    miniBtn: {
        marginLeft: spacing.sm,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    tableHeader: {
        flexDirection: 'row',
        marginBottom: spacing.md,
        paddingHorizontal: spacing.xs,
        opacity: 0.6,
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: borderRadius.md,
    },
    setRowCompleted: {
        backgroundColor: 'rgba(0, 255, 159, 0.1)',
        borderColor: colors.success,
        borderWidth: 1,
    },
    colSet: {
        width: 40,
        textAlign: 'center',
    },
    colInput: {
        flex: 1,
        marginHorizontal: spacing.xs,
    },
    colCheck: {
        width: 50,
        textAlign: 'center',
    },
    input: {
        backgroundColor: colors.background,
        color: colors.text,
        height: 44,
        borderRadius: borderRadius.md,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '900',
        borderWidth: 1,
        borderColor: colors.border,
    },
    inputCompleted: {
        color: colors.success,
        borderColor: colors.success,
        backgroundColor: 'transparent',
    },
    checkbox: {
        width: 38,
        height: 38,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 'auto',
        marginRight: 10,
        borderWidth: 2,
        borderColor: colors.border,
    },
    checkboxActive: {
        backgroundColor: colors.success,
        borderColor: colors.success,
        ...shadows.limeGlow,
    },
    checkmark: {
        color: colors.textDark,
        fontWeight: '900',
        fontSize: 20,
    },
    addSetButton: {
        marginTop: spacing.md,
        height: 48,
    },
    finishButton: {
        marginTop: spacing.xl,
        height: 70,
    },
});
