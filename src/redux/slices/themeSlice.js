// src/features/theme/themeSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isDarkMode: localStorage.getItem("theme") === "dark" 
    || window.matchMedia("(prefers-color-scheme: dark)").matches
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
      localStorage.setItem("theme", state.isDarkMode ? "dark" : "light");

      const root = document.documentElement;
      if (state.isDarkMode) root.classList.add("dark");
      else root.classList.remove("dark");
    },
    setTheme: (state, action) => {
      state.isDarkMode = action.payload === "dark";
      localStorage.setItem("theme", action.payload);

      const root = document.documentElement;
      if (state.isDarkMode) root.classList.add("dark");
      else root.classList.remove("dark");
    }
  }
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
