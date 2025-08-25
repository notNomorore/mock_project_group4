
import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../slices/authSlice";
import themeSlice from "../slices/themeSlice";
import taskReducer from "../slices/tasksSlice";

const store = configureStore({
  reducer: {
    auth: authSlice,
    theme: themeSlice,
    tasks: taskReducer,
  }
});

export default store;
