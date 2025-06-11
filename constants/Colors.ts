/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    icon: '#000',
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    primary: '#007AFF',
    secondary: '#5856D6',
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    icon: '#fff',
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    primary: '#0A84FF',
    secondary: '#5E5CE6',
  },
};
