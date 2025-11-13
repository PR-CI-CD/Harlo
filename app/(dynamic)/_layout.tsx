import React from 'react';
import { Stack } from 'expo-router';
import AppHeader from '../components/AppHeader'; // adjust relative path (../components or ../../components)

export default function DynamicLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: () => <AppHeader />,
      }}
    />
  );
}