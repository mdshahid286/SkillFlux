import { createSlice } from '@reduxjs/toolkit';

const initialProfile = {
  name: '',
  email: '',
  phone: '',
  url: '',
  summary: '',
  location: ''
};

const initialWorkExperience = {
  company: '',
  jobTitle: '',
  date: '',
  descriptions: []
};

const initialEducation = {
  school: '',
  degree: '',
  date: '',
  gpa: '',
  descriptions: []
};

const initialProject = {
  project: '',
  date: '',
  descriptions: [],
  url: ''
};

const initialCertification = {
  name: '',
  issuer: '',
  date: '',
  url: ''
};

const initialSkills = {
  featuredSkills: [
    { skill: '', rating: 0 },
    { skill: '', rating: 0 },
    { skill: '', rating: 0 }
  ],
  descriptions: []
};

const initialCustom = {
  descriptions: []
};

const initialResumeState = {
  profile: initialProfile,
  workExperiences: [initialWorkExperience],
  educations: [initialEducation],
  projects: [initialProject],
  certifications: [initialCertification],
  skills: initialSkills,
  custom: initialCustom
};

export const resumeSlice = createSlice({
  name: 'resume',
  initialState: initialResumeState,
  reducers: {
    changeProfile: (state, action) => {
      const { field, value } = action.payload;
      state.profile[field] = value;
    },
    changeWorkExperiences: (state, action) => {
      const { idx, field, value } = action.payload;
      const workExperience = state.workExperiences[idx];
      workExperience[field] = value;
    },
    changeEducations: (state, action) => {
      const { idx, field, value } = action.payload;
      const education = state.educations[idx];
      education[field] = value;
    },
    changeProjects: (state, action) => {
      const { idx, field, value } = action.payload;
      const project = state.projects[idx];
      project[field] = value;
    },
    changeCertifications: (state, action) => {
      const { idx, field, value } = action.payload;
      const certification = state.certifications[idx];
      certification[field] = value;
    },
    changeSkills: (state, action) => {
      const { field, value, idx, skill, rating } = action.payload;
      if (field === 'featuredSkills') {
        state.skills.featuredSkills[idx] = { skill, rating };
      } else {
        state.skills[field] = value;
      }
    },
    changeCustom: (state, action) => {
      const { field, value } = action.payload;
      state.custom[field] = value;
    },
    addSectionInForm: (state, action) => {
      const { form } = action.payload;
      switch (form) {
        case 'workExperiences':
          state.workExperiences.push(initialWorkExperience);
          break;
        case 'educations':
          state.educations.push(initialEducation);
          break;
        case 'projects':
          state.projects.push(initialProject);
          break;
        case 'certifications':
          state.certifications.push(initialCertification);
          break;
        default:
          break;
      }
    },
    deleteSectionInFormByIdx: (state, action) => {
      const { form, idx } = action.payload;
      state[form].splice(idx, 1);
    },
    moveSectionInForm: (state, action) => {
      const { form, idx, direction } = action.payload;
      const section = state[form][idx];
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      state[form].splice(idx, 1);
      state[form].splice(newIdx, 0, section);
    },
    setResume: (state, action) => {
      return action.payload;
    }
  }
});

export const {
  changeProfile,
  changeWorkExperiences,
  changeEducations,
  changeProjects,
  changeCertifications,
  changeSkills,
  changeCustom,
  addSectionInForm,
  deleteSectionInFormByIdx,
  moveSectionInForm,
  setResume
} = resumeSlice.actions;

// Selectors
export const selectProfile = (state) => state.resume.profile;
export const selectWorkExperiences = (state) => state.resume.workExperiences;
export const selectEducations = (state) => state.resume.educations;
export const selectProjects = (state) => state.resume.projects;
export const selectCertifications = (state) => state.resume.certifications;
export const selectSkills = (state) => state.resume.skills;
export const selectCustom = (state) => state.resume.custom;
export const selectResume = (state) => state.resume;

export default resumeSlice.reducer;

