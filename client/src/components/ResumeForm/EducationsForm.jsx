import React from 'react';
import { Form, FormSection } from './Form';
import { Input, BulletListTextarea } from './Form/InputGroup';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  changeEducations,
  selectEducations
} from '../../redux/resumeSlice';

export const EducationsForm = () => {
  const educations = useAppSelector(selectEducations);
  const dispatch = useAppDispatch();

  const showDelete = educations.length > 1;

  return (
    <Form form="educations" addButtonText="Add Education">
      {educations.map(({ school, degree, date, gpa, descriptions }, idx) => {
        const handleEducationChange = (field, value) => {
          dispatch(changeEducations({ idx, field, value }));
        };

        const showMoveUp = idx !== 0;
        const showMoveDown = idx !== educations.length - 1;

        return (
          <FormSection
            key={idx}
            form="educations"
            idx={idx}
            showMoveUp={showMoveUp}
            showMoveDown={showMoveDown}
            showDelete={showDelete}
            deleteButtonTooltipText="Delete education"
          >
            <Input
              label="School"
              labelClassName="col-span-full"
              name="school"
              placeholder="UC Berkeley"
              value={school}
              onChange={handleEducationChange}
            />
            <Input
              label="Degree"
              labelClassName="col-span-4"
              name="degree"
              placeholder="Bachelor of Science in Computer Science"
              value={degree}
              onChange={handleEducationChange}
            />
            <Input
              label="Date"
              labelClassName="col-span-2"
              name="date"
              placeholder="May 2021"
              value={date}
              onChange={handleEducationChange}
            />
            <Input
              label="GPA (Optional)"
              labelClassName="col-span-2"
              name="gpa"
              placeholder="3.8"
              value={gpa}
              onChange={handleEducationChange}
            />
            <BulletListTextarea
              label="Description (Optional)"
              labelClassName="col-span-full"
              name="descriptions"
              placeholder="Bullet points"
              value={descriptions}
              onChange={handleEducationChange}
            />
          </FormSection>
        );
      })}
    </Form>
  );
};

