import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '../constants/Colors';
import { getThemePreference, setThemePreference, ThemePreference, useColorScheme } from '../hooks/useColorScheme';

export default function PreferencesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const [themeType, setThemeType] = useState<ThemePreference>('system');
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    // Load the current theme preference when component mounts
    const loadThemePreference = async () => {
      const preference = getThemePreference();
      setThemeType(preference);
      // Set initial position of the toggle
      const initialPosition = preference === 'system' ? 0 : preference === 'light' ? 1 : 2;
      animatedValue.setValue(initialPosition);
    };

    loadThemePreference();
  }, []);

  const handleThemeChange = async (preference: ThemePreference, position: number) => {
    // Animate the toggle
    Animated.timing(animatedValue, {
      toValue: position,
      duration: 250,
      useNativeDriver: true,
    }).start();

    setThemeType(preference);
    await setThemePreference(preference);
  };

  // Calculate positions for the animated dot
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [5, 110, 215],  // Fine-tuned final values
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color={colors.tint} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Preferences</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Theme</Text>
            
            <View style={styles.themeToggleContainer}>
              <Animated.View 
                style={[
                  styles.themeToggleIndicator, 
                  { 
                    backgroundColor: colors.tint,
                    transform: [{ translateX }]
                  }
                ]} 
              />
              
              <TouchableOpacity 
                style={styles.themeToggleOption}
                onPress={() => handleThemeChange('system', 0)}
              >
                <Ionicons 
                  name="phone-portrait-outline" 
                  size={16} 
                  color={themeType === 'system' ? '#FFFFFF' : colors.text} 
                />
                <Text 
                  style={[
                    styles.themeToggleText, 
                    { 
                      color: themeType === 'system' ? '#FFFFFF' : colors.text,
                      fontWeight: themeType === 'system' ? '600' : 'normal'
                    }
                  ]}
                >
                  System
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.themeToggleOption}
                onPress={() => handleThemeChange('light', 1)}
              >
                <Ionicons 
                  name="sunny-outline" 
                  size={16} 
                  color={themeType === 'light' ? '#FFFFFF' : colors.text} 
                />
                <Text 
                  style={[
                    styles.themeToggleText, 
                    { 
                      color: themeType === 'light' ? '#FFFFFF' : colors.text,
                      fontWeight: themeType === 'light' ? '600' : 'normal'
                    }
                  ]}
                >
                  Light
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.themeToggleOption}
                onPress={() => handleThemeChange('dark', 2)}
              >
                <Ionicons 
                  name="moon-outline" 
                  size={16} 
                  color={themeType === 'dark' ? '#FFFFFF' : colors.text} 
                />
                <Text 
                  style={[
                    styles.themeToggleText, 
                    { 
                      color: themeType === 'dark' ? '#FFFFFF' : colors.text,
                      fontWeight: themeType === 'dark' ? '600' : 'normal'
                    }
                  ]}
                >
                  Dark
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Placeholder for future preference sections */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Recipe Suggestions</Text>
              <Switch 
                value={true} 
                onValueChange={() => {}}
                trackColor={{ false: '#ccc', true: colors.tint }}
                thumbColor={Platform.OS === 'ios' ? '#fff' : '#f4f3f4'}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Grocery Reminders</Text>
              <Switch 
                value={false} 
                onValueChange={() => {}}
                trackColor={{ false: '#ccc', true: colors.tint }}
                thumbColor={Platform.OS === 'ios' ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  rightPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  card: {
    borderRadius: 12,
    padding: 18,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    height: 44,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 22,
    position: 'relative',
    marginTop: 5,
  },
  themeToggleIndicator: {
    position: 'absolute',
    width: 100,
    height: 36,
    borderRadius: 18,
    top: 4,
    zIndex: 1,
  },
  themeToggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    zIndex: 2,
  },
  themeToggleText: {
    marginLeft: 4,
    fontSize: 14,
  },
}); 