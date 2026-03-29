import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { NotificationService } from '../services/NotificationService';

export default function Layout() {
  useEffect(() => {
    // Hide the splash screen explicitly in case the router didn't 
    SplashScreen.hideAsync();
    NotificationService.init();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
