import * as FileSystem from 'expo-file-system';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Quote } from '../components/Quote';
import { Screen } from '../components/Screen';
import { Typography } from '../components/Typography';
import { DayOfWeek, WeeklyBlueprint, WorkoutSession, WorkoutStore } from '../store/WorkoutStore';
import { borderRadius, colors, spacing } from '../theme';

interface DayStatus {
  date: string;
  dayName: string;
  status: 'green' | 'yellow' | 'red';
}

const getHistory = (sessions: WorkoutSession[], blueprints: WeeklyBlueprint[]): DayStatus[] => {
  let consecutiveMisses = 0;
  const history: DayStatus[] = [];

  for (let i = 14; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const fullDayName = dayNames[d.getDay()] as DayOfWeek;
    const shortDayName = fullDayName.substring(0, 3);

    const hasCompletedWorkout = sessions.some(s => s.date === dateStr && s.completed);
    const isRestDay = blueprints.find(b => b.day === fullDayName)?.exercises.length === 0;

    if (hasCompletedWorkout) {
      consecutiveMisses = 0;
      history.push({ date: dateStr, dayName: shortDayName, status: 'green' });
    } else {
      if (isRestDay) {
        if (consecutiveMisses >= 1) {
          consecutiveMisses++;
          history.push({ date: dateStr, dayName: shortDayName, status: 'red' });
        } else {
          history.push({ date: dateStr, dayName: shortDayName, status: 'green' });
        }
      } else {
        consecutiveMisses++;
        history.push({ date: dateStr, dayName: shortDayName, status: consecutiveMisses >= 2 ? 'red' : 'yellow' });
      }
    }
  }
  return history.slice(-7);
};

export default function Home() {
  const router = useRouter();
  const [todaySession, setTodaySession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [allSessions, setAllSessions] = useState<WorkoutSession[]>([]);
  const [blueprints, setBlueprints] = useState<WeeklyBlueprint[]>([]);
  const [lastPerformances, setLastPerformances] = useState<Record<string, { weight: number, reps: number } | null>>({});

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const session = await WorkoutStore.getTodaySession();
    const sessions = await WorkoutStore.getSessions();
    const bps = await WorkoutStore.getBlueprints();
    setTodaySession(session);
    setAllSessions(sessions);
    setBlueprints(bps);

    if (session) {
      const perfs: Record<string, { weight: number, reps: number } | null> = {};
      for (const we of session.exercises) {
        perfs[we.exercise.name] = await WorkoutStore.getLastPerformance(we.exercise.name);
      }
      setLastPerformances(perfs);
    }

    setLoading(false);
  };

  const exportData = async () => {
    try {
      const allData = await WorkoutStore.getSessions();
      if (allData.length === 0) {
        alert("No workout sessions to export.");
        return;
      }

      const jsonData = JSON.stringify(allData, null, 2);

      const fileName = `workout_backup_${new Date().toISOString().split('T')[0]}.json`;
      // @ts-ignore
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, jsonData, {
        // @ts-ignore
        encoding: 'utf8',
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        alert('Sharing unavailable - Cannot share files on this device');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to export data');
    }
  };

  return (
    <Screen style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Typography variant="h1">Workout Logger</Typography>
          <Typography variant="bodyDim" style={styles.subtitle}>
            Welcome back to the grind!
          </Typography>
        </View>

        <Quote />

        <View style={styles.calendarContainer}>
          <Typography variant="smallBold" style={styles.calendarTitle}>History</Typography>
          <View style={styles.calendarRow}>
            {getHistory(allSessions, blueprints).map((day, idx) => (
              <View key={idx} style={styles.calendarDay}>
                <View style={[
                  styles.calendarCircle,
                  day.status === 'green' ? { backgroundColor: colors.success } : null,
                  day.status === 'yellow' ? { backgroundColor: colors.primary } : null,
                  day.status === 'red' ? { backgroundColor: colors.error } : null
                ]} />
                <Typography variant="small" style={{ fontSize: 10, marginTop: 4 }}>{day.dayName}</Typography>
              </View>
            ))}
          </View>
        </View>

        {loading ? (
          <Typography variant="bodyDim">Loading...</Typography>
        ) : todaySession ? (
          <Card variant="elevated" style={styles.planCard}>
            <View style={styles.planHeader}>
              <View>
                <Typography variant="h2" style={{ color: colors.primary }}>Today's Plan</Typography>
                <Typography variant="small" style={{ color: colors.textDim }}>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Typography>
              </View>
              <TouchableOpacity onPress={() => router.push('/schedule')} style={styles.settingsBtn}>
                <Typography style={{ fontSize: 24 }}>⚙️</Typography>
              </TouchableOpacity>
            </View>

            <View style={styles.exerciseList}>
              {todaySession.exercises.slice(0, 4).map((ex) => {
                const last = lastPerformances[ex.exercise.name];
                return (
                  <View key={ex.id} style={styles.exerciseItemRow}>
                    <Typography variant="bodyDim" style={styles.exerciseItem}>
                      • {ex.exercise.name} ({ex.sets.length} sets)
                    </Typography>
                    {last && (
                      <Typography variant="small" style={styles.lastPerfText}>
                        Last: {last.weight}kg x {last.reps}
                      </Typography>
                    )}
                  </View>
                );
              })}
              {todaySession.exercises.length > 4 && (
                <Typography variant="small" style={styles.exerciseItem}>
                  ...and more
                </Typography>
              )}
            </View>

            <Button
              title="Start Workout"
              onPress={() => router.push(`/workout/${todaySession.id}`)}
              style={styles.startButton}
            />
          </Card>
        ) : (
          <Card variant="outline" style={styles.emptyCard}>
            <Typography variant="bodyDim" style={styles.emptyText}>
              No workouts scheduled for today.
            </Typography>
            <Button
              title="Edit Schedule"
              variant="secondary"
              onPress={() => router.push('/schedule')}
              style={styles.browseButton}
            />
          </Card>
        )}

        <View style={styles.footer}>
          <Typography variant="bodyDim" style={styles.footerText}>
            Want to backup your data?
          </Typography>
          <Button
            title="Export to Google Drive"
            variant="ghost"
            onPress={exportData}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  subtitle: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  planCard: {
    padding: spacing.xl,
    marginTop: spacing.sm,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  settingsBtn: {
    padding: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: borderRadius.full,
  },
  exerciseList: {
    marginBottom: spacing.xl,
  },
  exerciseItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  exerciseItem: {
    marginBottom: 0,
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  lastPerfText: {
    color: colors.accent,
    fontWeight: '900',
    fontSize: 11,
    backgroundColor: 'rgba(173, 255, 47, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(173, 255, 47, 0.3)',
  },
  startButton: {
    marginTop: spacing.md,
    height: 64,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  browseButton: {
    width: '100%',
  },
  footer: {
    marginTop: spacing.xxl,
    alignItems: 'center',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    marginBottom: spacing.sm,
  },
  calendarContainer: {
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  calendarTitle: {
    marginBottom: spacing.sm,
    color: colors.textDim,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calendarDay: {
    alignItems: 'center',
  },
  calendarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  }
});
