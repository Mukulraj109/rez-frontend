/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#6366f1';
const tintColorDark = '#a5b4fc';

export const Colors = {
  light: {
    text: '#0f172a',
    background: '#ffffff',
    tint: tintColorLight,
    icon: '#64748b',
    tabIconDefault: '#94a3b8',
    tabIconSelected: tintColorLight,
    surface: '#f8fafc',
    surfaceSecondary: '#f1f5f9',
    border: '#e2e8f0',
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    textSecondary: '#475569',
    textMuted: '#64748b',
  },
  dark: {
    text: '#f8fafc',
    background: '#0f172a',
    tint: tintColorDark,
    icon: '#64748b',
    tabIconDefault: '#475569',
    tabIconSelected: tintColorDark,
    surface: '#1e293b',
    surfaceSecondary: '#334155',
    border: '#475569',
    primary: '#a5b4fc',
    secondary: '#c4b5fd',
    accent: '#67e8f9',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
  },
};
