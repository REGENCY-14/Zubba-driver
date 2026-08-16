/** @type {import('tailwindcss').Config} */
const nativewind = require("nativewind/preset");

module.exports = {
  presets: [nativewind],
  // App theming is handled entirely by our own ThemeContext (no `dark:`
  // variant classes are used anywhere), but NativeWind's default 'media'
  // mode still installs a web MutationObserver that calls its internal
  // colorScheme.set() -- which is guarded to throw for 'media'. 'class'
  // mode makes that internal set() a no-op instead of throwing, since we
  // never toggle the class ourselves.
  darkMode: 'class',
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
