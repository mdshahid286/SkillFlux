import React, { useState } from 'react';
import {
  useAppSelector,
  useSaveStateToLocalStorageOnChange,
  useSetInitialStore
} from '../../redux/hooks';
import { selectFormsOrder } from '../../redux/settingsSlice';
import { ProfileForm } from './ProfileForm';
import { WorkExperiencesForm } from './WorkExperiencesForm';
import { EducationsForm } from './EducationsForm';
import { ProjectsForm } from './ProjectsForm';
import { CertificationsForm } from './CertificationsForm';
import { SkillsForm } from './SkillsForm';
import { ThemeForm } from './ThemeForm';

const formTypeToComponent = {
  workExperiences: WorkExperiencesForm,
  educations: EducationsForm,
  projects: ProjectsForm,
  certifications: CertificationsForm,
  skills: SkillsForm
};

export const ResumeForm = () => {
  useSetInitialStore();
  useSaveStateToLocalStorageOnChange();

  const formsOrder = useAppSelector(selectFormsOrder);
  // const [isHover, setIsHover] = useState(false); // Unused

  return (
    <div
      className="flex justify-center h-full"
      style={{ overflowY: 'auto', overflowX: 'hidden' }}
    >
      <section className="flex max-w-4xl flex-col gap-8 p-6" style={{ width: '100%', maxWidth: '1000px' }}>
        <ProfileForm />
        {formsOrder.map((form) => {
          const Component = formTypeToComponent[form];
          return Component ? <Component key={form} /> : null;
        })}
        <ThemeForm />
        <br />
      </section>
    </div>
  );
};

