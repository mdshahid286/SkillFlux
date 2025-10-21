import { configureStore } from '@reduxjs/toolkit';
import resumeReducer from './resumeSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    resume: resumeReducer,
    settings: settingsReducer
  }
});

export default store;

