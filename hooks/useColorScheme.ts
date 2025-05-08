import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ColorSchemeName, useColorScheme as _useColorScheme } from 'react-native';

const THEME_STORAGE_KEY = 'user-theme-preference';

export type ThemePreference = 'system' | 'light' | 'dark';

// Create a simple event system to notify components when theme changes
const listeners: Set<() => void> = new Set();

// Current theme preference (initial value will be loaded from storage)
let currentThemePreference: ThemePreference = 'system';

// Load the preference from storage when the module is imported
(async () => {
  try {
    const savedPreference = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    if (savedPreference === 'light' || savedPreference === 'dark' || savedPreference === 'system') {
      currentThemePreference = savedPreference as ThemePreference;
    }
  } catch (error) {
    console.log('Error loading theme preference', error);
  }
})();

export function useColorScheme(): ColorSchemeName {
  const systemColorScheme = _useColorScheme();
  const [themePreference, setThemePreference] = useState<ThemePreference>(currentThemePreference);

  // Listen for theme changes
  useEffect(() => {
    const listener = () => {
      setThemePreference(currentThemePreference);
    };
    
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  // Determine which color scheme to use based on preference
  let colorScheme: ColorSchemeName = systemColorScheme;
  if (themePreference === 'light') colorScheme = 'light';
  if (themePreference === 'dark') colorScheme = 'dark';

  return colorScheme;
}

// Function to set theme preference
export async function setThemePreference(preference: ThemePreference): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, preference);
    currentThemePreference = preference;
    
    // Notify all listeners that the theme has changed
    listeners.forEach(listener => listener());
  } catch (error) {
    console.log('Error saving theme preference', error);
  }
}

// Function to get current theme preference (synchronous version)
export function getThemePreference(): ThemePreference {
  return currentThemePreference;
}

// Function to get current theme preference (async version for initial loading)
export async function getThemePreferenceAsync(): Promise<ThemePreference> {
  return currentThemePreference;
}

