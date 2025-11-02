import { createSlice } from '@reduxjs/toolkit';

export const DEFAULT_FONT_COLOR = '#334155';
export const DEFAULT_THEME_COLOR = '#3b82f6';

const initialSettings = {
  themeColor: DEFAULT_THEME_COLOR,
  fontFamily: 'Roboto',
  fontSize: '11',
  documentSize: 'LETTER',
  formToShow: {
    workExperiences: true,
    educations: true,
    projects: true,
    certifications: true,
    skills: true,
    custom: false
  },
  formToHeading: {
    workExperiences: 'WORK EXPERIENCE',
    educations: 'EDUCATION',
    projects: 'PROJECT',
    certifications: 'CERTIFICATIONS',
    skills: 'SKILLS',
    custom: 'CUSTOM SECTION'
  },
  formsOrder: ['workExperiences', 'educations', 'projects', 'certifications', 'skills', 'custom'],
  showBulletPoints: {
    workExperiences: true,
    educations: true,
    projects: true,
    skills: true,
    custom: true
  }
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState: initialSettings,
  reducers: {
    changeSettings: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
    },
    changeShowForm: (state, action) => {
      const { field, value } = action.payload;
      state.formToShow[field] = value;
    },
    changeFormHeading: (state, action) => {
      const { field, value } = action.payload;
      state.formToHeading[field] = value;
    },
    changeFormOrder: (state, action) => {
      const { form, type } = action.payload;
      const idx = state.formsOrder.indexOf(form);
      const newIdx = type === 'up' ? idx - 1 : idx + 1;
      const temp = state.formsOrder[idx];
      state.formsOrder[idx] = state.formsOrder[newIdx];
      state.formsOrder[newIdx] = temp;
    },
    changeShowBulletPoints: (state, action) => {
      const { field, value } = action.payload;
      state.showBulletPoints[field] = value;
    },
    setSettings: (state, action) => {
      return action.payload;
    }
  }
});

export const {
  changeSettings,
  changeShowForm,
  changeFormHeading,
  changeFormOrder,
  changeShowBulletPoints,
  setSettings
} = settingsSlice.actions;

// Selectors
export const selectSettings = (state) => state.settings;
export const selectThemeColor = (state) => state.settings.themeColor;
export const selectFormToShow = (state) => state.settings.formToShow;
export const selectFormToHeading = (state) => state.settings.formToHeading;
export const selectFormsOrder = (state) => state.settings.formsOrder;
export const selectShowByForm = (form) => (state) => state.settings.formToShow[form];
export const selectHeadingByForm = (form) => (state) => state.settings.formToHeading[form];
export const selectIsFirstForm = (form) => (state) => state.settings.formsOrder.indexOf(form) === 0;
export const selectIsLastForm = (form) => (state) => state.settings.formsOrder.indexOf(form) === state.settings.formsOrder.length - 1;
export const selectShowBulletPoints = (form) => (state) => state.settings.showBulletPoints[form];

export default settingsSlice.reducer;

