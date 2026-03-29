import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const NotificationService = {
    async init() {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FFD166',
            });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Push notification permissions not granted.');
            return;
        }

        await this.scheduleNotifications();
    },

    async scheduleNotifications() {
        // Cancel all existing to avoid stacking duplicate calls
        await Notifications.cancelAllScheduledNotificationsAsync();

        try {
            // Fetch 30 unique quotes
            const res = await fetch('https://dummyjson.com/quotes?limit=30');
            const data = await res.json();
            const quotes = data.quotes || [];

            // Schedule for the next 30 days
            for (let i = 0; i < 30; i++) {
                const quoteText = quotes[i] ? `"${quotes[i].quote}" - ${quotes[i].author}` : "Time to grind! Get up and crush it.";

                // Morning Notification (6:00 AM)
                const morningTrigger = new Date();
                morningTrigger.setDate(morningTrigger.getDate() + i);
                morningTrigger.setHours(6, 0, 0, 0);

                if (morningTrigger.getTime() > Date.now()) {
                    await Notifications.scheduleNotificationAsync({
                        identifier: `morning_${i}`,
                        content: {
                            title: "☀️ Morning Motivation",
                            body: quoteText,
                        },
                        trigger: {
                            type: 'date',
                            date: morningTrigger.getTime(),
                        } as any,
                    });
                }

                // Evening Reminder (6:00 PM)
                const eveningTrigger = new Date();
                eveningTrigger.setDate(eveningTrigger.getDate() + i);
                eveningTrigger.setHours(18, 0, 0, 0);

                if (eveningTrigger.getTime() > Date.now()) {
                    const eveningQuote = quotes[29 - i] ? `"${quotes[29 - i].quote}"` : "Don't skip leg day!";
                    await Notifications.scheduleNotificationAsync({
                        identifier: `evening_${i}`,
                        content: {
                            title: "💪 Evening Check-in",
                            body: `Did you crush your exercises today? ${eveningQuote}`,
                        },
                        trigger: {
                            type: 'date',
                            date: eveningTrigger.getTime(),
                        } as any,
                    });
                }
            }
        } catch (err) {
            console.log('Failed scheduling notifications:', err);
        }
    },

    async workoutCompletedToday() {
        // If the user completes a workout, cancel today's pending 6 PM evening notification to not bother them.
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        const today = new Date();

        for (const notif of scheduled) {
            if (notif.identifier.startsWith('evening_')) {
                const triggerDate = new Date((notif.trigger as any).date);
                if (triggerDate.getDate() === today.getDate() && triggerDate.getMonth() === today.getMonth()) {
                    await Notifications.cancelScheduledNotificationAsync(notif.identifier);
                    break;
                }
            }
        }
    }
};
