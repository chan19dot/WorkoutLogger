# 🦾 Workout Logger - Cyberpunk Edition

A high-octane, offline-first workout tracking application built with **React Native** and **Expo SDK 54**. Designed with a premium "Gen Z" Cyberpunk aesthetic, this app helps you manage your weekly routines, track historical performance, and stay motivated with daily quotes.

![App Icon](./assets/icon.png)

## 🚀 Key Features

### 📅 Weekly Blueprint Scheduler
- **Custom Routines**: Assign specific exercises to each day of the week.
- **Smart Set Specification**: Define the number of sets per exercise directly in the blueprint.
- **Inline Editing**: Easily update exercise names or set counts (✏️) without deleting them.

### 🏋️‍♂️ Professional Workout Tracker
- **Real-time Logging**: Track weight and reps for every set.
- **History Insights**: View your "Last Recorded Performance" (e.g., *100kg x 8*) directly on the home screen as you prepare for your session.
- **Actionable Sets**: Duplicate exercises for drop-sets or delete them on the fly.

### 🧠 Intelligent Autocomplete
- **Dynamic Learning**: The app learns from you! Any new exercise you enter is permanently added to the persistent autocomplete database.
- **Case-Insensitive Search**: Quickly find exercises from a pre-loaded database of 30+ common movements.

### 📈 Habit & History Visualizer
- **14-Day Streak Tracker**: A visual "Heatmap" on the home screen shows your consistency (Green = Success, Yellow = 1 Skip, Red = 2+ Skips).
- **Data Export**: Generate a clean `.json` backup of your entire history and save it to Google Drive or share it via standard system dialogs.

### 🔔 Motivation & Notifications
- **Morning Quotes**: 30 days of unique motivational quotes delivered at 6:00 AM.
- **Evening Check-ins**: Smart reminders at 6:00 PM that automatically cancel themselves if you've already finished your workout for the day.

### 🎨 Premium "Gen Z" UI
- **Cyberpunk Aesthetic**: High-contrast Neon Cyan, Hot Pink, and Electric Lime color palette.
- **Interactive Glows**: Vibrant neon shadows and glowing borders for a futuristic mobile experience.
- **UX Focused**: Pill-shaped buttons, ultra-bold typography, and `KeyboardAvoidingView` support for seamless data entry.

## 🛠 Tech Stack
- **Framework**: React Native / Expo (SDK 54)
- **Navigation**: Expo Router (File-based routing)
- **State/Storage**: AsyncStorage (Offline-first)
- **Notifications**: Expo Notifications
- **Animations**: React Native Reanimated
- **Icons**: Custom Neon SVG/Vector assets

## 🏁 Getting Started

1. **Clone the repo**
   ```bash
   git clone <your-repo-url>
   cd WorkoutLogger
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start --clear
   ```

4. **Run on device**
   - Scan the QR code using the **Expo Go** app (Android) or Camera app (iOS).

## 📄 License
MIT
