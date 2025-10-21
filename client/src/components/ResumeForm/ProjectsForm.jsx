import React from 'react';
import { Form, FormSection } from './Form';
import { Input, BulletListTextarea } from './Form/InputGroup';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  changeProjects,
  selectProjects
} from '../../redux/resumeSlice';

export const ProjectsForm = () => {
  const projects = useAppSelector(selectProjects);
  const dispatch = useAppDispatch();

  const showDelete = projects.length > 1;

  return (
    <Form form="projects" addButtonText="Add Project">
      {projects.map(({ project, date, descriptions }, idx) => {
        const handleProjectChange = (field, value) => {
          dispatch(changeProjects({ idx, field, value }));
        };

        const showMoveUp = idx !== 0;
        const showMoveDown = idx !== projects.length - 1;

        return (
          <FormSection
            key={idx}
            form="projects"
            idx={idx}
            showMoveUp={showMoveUp}
            showMoveDown={showMoveDown}
            showDelete={showDelete}
            deleteButtonTooltipText="Delete project"
          >
            <Input
              label="Project Name"
              labelClassName="col-span-4"
              name="project"
              placeholder="OpenResume"
              value={project}
              onChange={handleProjectChange}
            />
            <Input
              label="Date"
              labelClassName="col-span-2"
              name="date"
              placeholder="Winter 2022"
              value={date}
              onChange={handleProjectChange}
            />
            <BulletListTextarea
              label="Description"
              labelClassName="col-span-full"
              name="descriptions"
              placeholder="Bullet points"
              value={descriptions}
              onChange={handleProjectChange}
            />
          </FormSection>
        );
      })}
    </Form>
  );
};

