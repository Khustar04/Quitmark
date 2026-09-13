import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('quitmark_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
  }
  return 'dark';
};

const initialTheme = getInitialTheme();

// Synchronize initial root class
if (typeof document !== 'undefined') {
  if (initialTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

const initialState = {
  theme: initialTheme,
  mobileNavOpen: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      state.theme = nextTheme;
      if (typeof window !== 'undefined') {
        localStorage.setItem('quitmark_theme', nextTheme);
      }
      if (typeof document !== 'undefined') {
        if (nextTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    setTheme: (state, action) => {
      const newTheme = action.payload === 'light' ? 'light' : 'dark';
      state.theme = newTheme;
      if (typeof window !== 'undefined') {
        localStorage.setItem('quitmark_theme', newTheme);
      }
      if (typeof document !== 'undefined') {
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    toggleMobileNav: (state) => {
      state.mobileNavOpen = !state.mobileNavOpen;
    },
    closeMobileNav: (state) => {
      state.mobileNavOpen = false;
    },
  },
});

export const { toggleTheme, setTheme, toggleMobileNav, closeMobileNav } = uiSlice.actions;

export default uiSlice.reducer;
