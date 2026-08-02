import { createSlice } from '@reduxjs/toolkit';

interface UiState {
  isSidebarOpen: boolean;
}

const initialState: UiState = {
  isSidebarOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openSidebar: state => {
      state.isSidebarOpen = true;
    },
    closeSidebar: state => {
      state.isSidebarOpen = false;
    },
    toggleSidebar: state => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
  },
});

export const { openSidebar, closeSidebar, toggleSidebar } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
