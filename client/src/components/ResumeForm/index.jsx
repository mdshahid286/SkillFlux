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
  const [isHover, setIsHover] = useState(false);

  return (
    <div
      className={`flex justify-center md:h-[calc(100vh-120px)] md:justify-end md:overflow-y-scroll ${
        isHover ? 'scrollbar-thumb-gray-300' : 'scrollbar-thumb-gray-200'
      } scrollbar-thin scrollbar-track-gray-100`}
      onMouseOver={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <section className="flex max-w-2xl flex-col gap-8 p-6">
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

