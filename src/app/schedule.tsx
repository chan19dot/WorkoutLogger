import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { Typography } from '../components/Typography';
import { DayOfWeek, Exercise, WeeklyBlueprint, WorkoutStore } from '../store/WorkoutStore';
import { borderRadius, colors, shadows, spacing } from '../theme';

const PREDEFINED_EXERCISES = [
    'Bench Press', 'Incline Bench Press', 'Decline Bench Press', 'Push Ups', 'Dips',
    'Squat', 'Front Squat', 'Leg Press', 'Lunges', 'Leg Extensions', 'Leg Curls', 'Calf Raises',
    'Deadlift', 'Romanian Deadlift', 'Pull Ups', 'Chin Ups', 'Barbell Row', 'Dumbbell Row', 'Lat Pulldown',
    'Overhead Press', 'Lateral Raises', 'Front Raises', 'Face Pulls',
    'Bicep Curls', 'Hammer Curls', 'Preacher Curls', 'Tricep Extensions', 'Skull Crushers',
    'Plank', 'Crunches', 'Leg Raises', 'Russian Twists'
];

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ScheduleScreen() {
    const router = useRouter();
    const [blueprints, setBlueprints] = useState<WeeklyBlueprint[]>([]);

    // Auto-select true local day instead of forcing Monday mapping
    const [activeDay, setActiveDay] = useState<DayOfWeek>(
        ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()] as DayOfWeek
    );
    const [newExercise, setNewExercise] = useState('');
    const [numSets, setNumSets] = useState('3');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [customExercises, setCustomExercises] = useState<string[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    const getActiveExercises = () => {
        return blueprints.find((b: WeeklyBlueprint) => b.day === activeDay)?.exercises || [];
    };

    const allExercises = [...PREDEFINED_EXERCISES, ...customExercises];

    const filteredExercises = allExercises.filter(ex =>
        ex.toLowerCase().includes(newExercise.toLowerCase()) &&
        newExercise.trim().length > 0 &&
        !getActiveExercises().some(ae => ae.name.toLowerCase() === ex.toLowerCase())
    );

    useEffect(() => {
        loadBlueprints();
    }, []);

    const loadBlueprints = async () => {
        const data = await WorkoutStore.getBlueprints();
        const custom = await WorkoutStore.getCustomExercises();
        setBlueprints(data);
        setCustomExercises(custom);
    };

    const addExercise = async () => {
        if (!newExercise.trim()) return;
        const currentExercises = getActiveExercises();

        if (editingId) {
            const updatedExercises = currentExercises.map(ex =>
                ex.id === editingId
                    ? { ...ex, name: newExercise.trim(), defaultSets: parseInt(numSets) || 3 }
                    : ex
            );
            await WorkoutStore.updateBlueprint(activeDay, updatedExercises);
            setEditingId(null);
        } else {
            const updatedExercises = [...currentExercises, {
                id: `ex-${Date.now()}`,
                name: newExercise.trim(),
                defaultSets: parseInt(numSets) || 3
            }];
            await WorkoutStore.updateBlueprint(activeDay, updatedExercises);

            // Add to dynamic autocomplete if it's new
            await WorkoutStore.addCustomExercise(newExercise.trim());
        }

        setNewExercise('');
        setNumSets('3');
        setShowSuggestions(false);
        loadBlueprints();
    };

    const startEditing = (ex: Exercise) => {
        try {
            console.log('Starting edit for exercise:', ex);
            setEditingId(ex.id);
            setNewExercise(ex.name);
            setNumSets((ex.defaultSets || 3).toString());
            setShowSuggestions(false);
        } catch (error) {
            console.error('Error in startEditing:', error);
            alert('Failed to enter edit mode');
        }
    };

    const deleteExercise = async (exerciseId: string) => {
        const currentExercises = getActiveExercises();
        const updatedExercises = currentExercises.filter(ex => ex.id !== exerciseId);

        await WorkoutStore.updateBlueprint(activeDay, updatedExercises);
        loadBlueprints();
    };

    return (
        <Screen style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <Button title="<" variant="ghost" onPress={() => router.back()} style={styles.backBtn} />
                    <Typography variant="h2" style={{ color: colors.primary }}>My Schedule</Typography>
                    <View style={styles.placeholder} />
                </View>

                <View style={styles.daysScroll}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysContainer}>
                        {DAYS.map(day => (
                            <TouchableOpacity
                                key={day}
                                style={[styles.dayTab, activeDay === day && styles.dayTabActive]}
                                onPress={() => setActiveDay(day)}
                            >
                                <Typography variant={activeDay === day ? 'smallBold' : 'small'} style={activeDay === day ? styles.dayTextActive : { color: colors.textDim }}>
                                    {day.substring(0, 3).toUpperCase()}
                                </Typography>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
                    <Card variant="elevated" style={styles.dayCard}>
                        <Typography variant="h3" style={styles.dayTitle}>{activeDay} Blueprint</Typography>

                        {getActiveExercises().length === 0 ? (
                            <Typography variant="bodyDim" style={styles.emptyText}>Rest day! Enjoy your recovery.</Typography>
                        ) : (
                            getActiveExercises().map((ex: Exercise, idx: number) => (
                                <View key={ex.id} style={styles.exerciseRow}>
                                    <View style={styles.bullet}><Typography style={styles.bulletText}>{idx + 1}</Typography></View>
                                    <Typography style={styles.exerciseName}>
                                        {ex.name}
                                        <Typography variant="small" style={{ color: colors.textDim }}> ({ex.defaultSets || 1} sets)</Typography>
                                    </Typography>
                                    <View style={styles.exerciseActions}>
                                        <TouchableOpacity onPress={() => startEditing(ex)} style={styles.editBtn}>
                                            <Typography style={styles.editBtnText}>✏️</Typography>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => deleteExercise(ex.id)} style={styles.deleteBtn}>
                                            <Typography style={styles.deleteBtnText}>✕</Typography>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}

                        <View style={{ zIndex: 10 }}>
                            <View style={styles.addExerciseContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Bench Press"
                                    placeholderTextColor={colors.textDim}
                                    value={newExercise}
                                    onChangeText={(t) => { setNewExercise(t); setShowSuggestions(true); }}
                                    onFocus={() => setShowSuggestions(true)}
                                />
                                <View style={styles.setContainer}>
                                    <Typography variant="small" style={styles.setLabel}>Sets</Typography>
                                    <TextInput
                                        style={styles.setInput}
                                        value={numSets}
                                        onChangeText={setNumSets}
                                        keyboardType="numeric"
                                        maxLength={2}
                                    />
                                </View>
                                <Button
                                    title={editingId ? "Save" : "Add"}
                                    variant="primary"
                                    style={[styles.addButton, !newExercise.trim() && { opacity: 0.5 }]}
                                    onPress={addExercise}
                                    disabled={!newExercise.trim()}
                                />
                                {editingId && (
                                    <Button
                                        title="Cancel"
                                        variant="ghost"
                                        onPress={() => { setEditingId(null); setNewExercise(''); setNumSets('3'); }}
                                        style={{ marginLeft: spacing.sm }}
                                    />
                                )}
                            </View>
                            {showSuggestions && filteredExercises.length > 0 && (
                                <View style={styles.suggestionsContainer}>
                                    {filteredExercises.slice(0, 5).map(ex => (
                                        <TouchableOpacity key={ex} style={styles.suggestionItem} onPress={() => { setNewExercise(ex); setShowSuggestions(false); }}>
                                            <Typography>{ex}</Typography>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    </Card>
                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: spacing.sm, paddingTop: spacing.md, paddingBottom: spacing.sm,
    },
    backBtn: { width: 80 }, placeholder: { width: 80 },
    daysScroll: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
    daysContainer: { paddingHorizontal: spacing.md },
    dayTab: {
        paddingVertical: spacing.sm, paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.full, marginHorizontal: spacing.xs,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    dayTabActive: { backgroundColor: colors.primary, borderColor: colors.primary, ...shadows.neon },
    dayTextActive: { color: colors.textDark, fontWeight: '900' },
    content: { padding: spacing.md, paddingBottom: spacing.xxl },
    dayCard: { padding: spacing.xl },
    dayTitle: { marginBottom: spacing.xl, textAlign: 'left', color: colors.primary, textTransform: 'uppercase', letterSpacing: 2 },
    emptyText: { textAlign: 'center', paddingVertical: spacing.xl, fontStyle: 'italic' },
    exerciseRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: spacing.md, borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    bullet: {
        width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accent,
        justifyContent: 'center', alignItems: 'center', marginRight: spacing.md,
        ...shadows.limeGlow,
    },
    bulletText: { color: colors.textDark, fontSize: 14, fontWeight: '900' },
    exerciseName: { flex: 1, fontWeight: '700', color: colors.text, fontSize: 16 },
    exerciseActions: { flexDirection: 'row', alignItems: 'center' },
    editBtn: { padding: spacing.sm, marginRight: spacing.xs, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8 },
    editBtnText: { fontSize: 18 },
    deleteBtn: { padding: spacing.sm, backgroundColor: 'rgba(255,49,49,0.1)', borderRadius: 8 },
    deleteBtnText: { color: colors.error, fontWeight: '900', fontSize: 18 },
    addExerciseContainer: {
        flexDirection: 'row', marginTop: spacing.xl, borderTopWidth: 1,
        borderTopColor: colors.border, paddingTop: spacing.xl,
    },
    input: {
        flex: 2, backgroundColor: colors.surface, color: colors.text,
        borderRadius: borderRadius.md, paddingHorizontal: spacing.md, marginRight: spacing.sm,
    },
    setContainer: {
        width: 60,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        marginRight: spacing.sm,
        paddingHorizontal: spacing.xs,
        justifyContent: 'center',
        alignItems: 'center',
    },
    setLabel: {
        fontSize: 8,
        color: colors.textDim,
        textTransform: 'uppercase',
    },
    setInput: {
        color: colors.text,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        width: '100%',
    },
    addButton: { height: 48, paddingHorizontal: spacing.lg },
    suggestionsContainer: {
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius.md,
        marginTop: spacing.xs,
        padding: spacing.xs,
    },
    suggestionItem: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
});
