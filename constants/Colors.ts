/**
 * CulinaryLens Color Scheme
 * A modern palette with dark/white theme and green accent
 */

const primaryGreen = '#2E7D32';
const darkGreen = '#1B5E20';
const lightGreen = '#81C784';
const successGreen = '#4CAF50';

export const Colors = {
  light: {
    text: '#2D3748',
    background: '#FFFFFF',
    card: '#F7FAFC',
    tint: primaryGreen,
    accent: darkGreen,
    lighterAccent: lightGreen,
    icon: '#718096',
    tabIconDefault: '#A0AEC0',
    tabIconSelected: primaryGreen,
    border: '#E2E8F0',
    notification: '#FF4757',
    shadow: 'rgba(0, 0, 0, 0.1)',
    success: successGreen,
  },
  dark: {
    text: '#F7FAFC',
    background: '#1A202C',
    card: '#2D3748',
    tint: lightGreen,
    accent: primaryGreen,
    lighterAccent: darkGreen,
    icon: '#A0AEC0',
    tabIconDefault: '#718096',
    tabIconSelected: lightGreen,
    border: '#4A5568',
    notification: '#FF6B81',
    shadow: 'rgba(0, 0, 0, 0.3)',
    success: successGreen,
  },
};
