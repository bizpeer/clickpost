/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#FAE100';
const tintColorDark = '#FAE100';

export const Colors = {
  light: {
    text: '#1A1A1A',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#707070',
    tabIconDefault: '#707070',
    tabIconSelected: tintColorLight,
    card: '#F5F5F5',
    border: '#E0E0E0',
    primary: '#FAE100',
    secondary: '#1A1A1A',
  },
  dark: {
    text: '#FFFFFF',
    background: '#1A1A1A',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    card: '#2B2B2B',
    border: '#3A3A3A',
    primary: '#FAE100',
    secondary: '#FFFFFF',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'Pretendard-Medium',
    bold: 'Pretendard-Bold',
    light: 'Pretendard-Light',
  },
  android: {
    sans: 'sans-serif-medium',
    bold: 'sans-serif-bold',
    light: 'sans-serif-light',
  },
  default: {
    sans: 'normal',
    bold: 'bold',
    light: 'normal',
  },
});
