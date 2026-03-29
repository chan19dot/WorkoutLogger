import AsyncStorage from '@react-native-async-storage/async-storage';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface Exercise {
    id: string;
    name: string;
    defaultSets?: number;
}

export interface WorkoutSet {
    id: string;
    reps: number;
    weight: number;
    completed: boolean;
}

export interface WorkoutExercise {
    id: string;
    exercise: Exercise;
    sets: WorkoutSet[];
}

export interface WorkoutSession {
    id: string;
    name: string;
    date: string; // ISO date string YYYY-MM-DD
    exercises: WorkoutExercise[];
    completed: boolean;
}

export interface WeeklyBlueprint {
    day: DayOfWeek;
    exercises: Exercise[];
}

const STORAGE_KEY = '@workout_sessions';
const BLUEPRINT_KEY = '@weekly_blueprints';
const EXERCISE_KEY = '@custom_exercises';

const DEFAULT_BLUEPRINTS: WeeklyBlueprint[] = [
    { day: 'Monday', exercises: [{ id: 'bench', name: 'Bench Press' }, { id: 'ohp', name: 'Overhead Press' }] },
    { day: 'Tuesday', exercises: [{ id: 'squat', name: 'Squat' }, { id: 'legpress', name: 'Leg Press' }] },
    { day: 'Wednesday', exercises: [] },
    { day: 'Thursday', exercises: [{ id: 'deadlift', name: 'Deadlift' }, { id: 'lunge', name: 'Lunges' }] },
    { day: 'Friday', exercises: [{ id: 'pullup', name: 'Pull Ups' }, { id: 'row', name: 'Barbell Row' }] },
    { day: 'Saturday', exercises: [] },
    { day: 'Sunday', exercises: [] },
];

export const WorkoutStore = {
    // === BLUEPRINTS (Weekly Schedule) ===
    async getBlueprints(): Promise<WeeklyBlueprint[]> {
        try {
            const data = await AsyncStorage.getItem(BLUEPRINT_KEY);
            if (data) return JSON.parse(data);
            await AsyncStorage.setItem(BLUEPRINT_KEY, JSON.stringify(DEFAULT_BLUEPRINTS));
            return DEFAULT_BLUEPRINTS;
        } catch (e) {
            return DEFAULT_BLUEPRINTS;
        }
    },

    async updateBlueprint(day: DayOfWeek, exercises: Exercise[]): Promise<void> {
        const bps = await this.getBlueprints();
        const index = bps.findIndex(b => b.day === day);
        if (index >= 0) {
            bps[index].exercises = exercises;
            await AsyncStorage.setItem(BLUEPRINT_KEY, JSON.stringify(bps));
        }
    },

    // === SESSIONS ===
    async getSessions(): Promise<WorkoutSession[]> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    async saveSessions(sessions: WorkoutSession[]): Promise<void> {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    },

    async getSession(id: string): Promise<WorkoutSession | null> {
        const sessions = await this.getSessions();
        return sessions.find(s => s.id === id) || null;
    },

    async updateSession(updatedSession: WorkoutSession): Promise<void> {
        const sessions = await this.getSessions();
        const index = sessions.findIndex(s => s.id === updatedSession.id);
        if (index >= 0) {
            sessions[index] = updatedSession;
            await this.saveSessions(sessions);
        }
    },

    async getTodaySession(): Promise<WorkoutSession | null> {
        const sessions = await this.getSessions();
        const now = new Date();
        // Guarantee local timezone YYYY-MM-DD instead of UTC offset shifting
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        // Find today's uncompleted session, but ignore old dummy "Push Day" from previous app versions
        let session = sessions.find(s => s.date === todayStr && !s.completed && s.name !== 'Push Day');

        if (!session) {
            // Generate one from blueprint
            const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const todayDayName = days[now.getDay()];

            const blueprints = await this.getBlueprints();
            const todayBlueprint = blueprints.find(b => b.day === todayDayName);

            if (todayBlueprint && todayBlueprint.exercises.length > 0) {
                // Dynamically construct formatted Date ("Sat, Mar 28") for the Title instead of a generic string
                const formattedDate = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

                session = {
                    id: `session-${Date.now()}`,
                    name: `${formattedDate}`,
                    date: todayStr,
                    completed: false,
                    exercises: todayBlueprint.exercises.map(ex => {
                        const setCount = ex.defaultSets || 1;
                        const sets = [];
                        for (let i = 0; i < setCount; i++) {
                            sets.push({
                                id: `set-${Date.now()}-${i}-${Math.random()}`,
                                reps: 10,
                                weight: 0,
                                completed: false
                            });
                        }
                        return {
                            id: `we-${Date.now()}-${Math.random()}`,
                            exercise: ex,
                            sets: sets
                        };
                    })
                };
                sessions.push(session);
                await this.saveSessions(sessions);
            }
        }
        return session || null;
    },

    async getLastPerformance(exerciseName: string): Promise<{ weight: number, reps: number } | null> {
        const sessions = await this.getSessions();
        // Sort sessions by date descending
        const sortedSessions = sessions
            .filter(s => s.completed)
            .sort((a, b) => b.date.localeCompare(a.date));

        for (const session of sortedSessions) {
            for (const we of session.exercises) {
                if (we.exercise.name.toLowerCase() === exerciseName.toLowerCase()) {
                    // Find the best set (highest weight * reps) or just the last one
                    const completedSets = we.sets.filter(s => s.completed);
                    if (completedSets.length > 0) {
                        // Return the first completed set found (usually strongest/first)
                        return { weight: completedSets[0].weight, reps: completedSets[0].reps };
                    }
                }
            }
        }
        return null;
    },

    // === CUSTOM EXERCISES ===
    async getCustomExercises(): Promise<string[]> {
        const data = await AsyncStorage.getItem(EXERCISE_KEY);
        return data ? JSON.parse(data) : [];
    },

    async addCustomExercise(name: string): Promise<void> {
        const custom = await this.getCustomExercises();
        if (!custom.some(e => e.toLowerCase() === name.toLowerCase())) {
            custom.push(name);
            await AsyncStorage.setItem(EXERCISE_KEY, JSON.stringify(custom));
        }
    }
};
