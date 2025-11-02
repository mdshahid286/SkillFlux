import React from 'react';
import { Form, FormSection } from './Form';
import { Input } from './Form/InputGroup';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  changeCertifications,
  selectCertifications
} from '../../redux/resumeSlice';

export const CertificationsForm = () => {
  const certifications = useAppSelector(selectCertifications);
  const dispatch = useAppDispatch();

  const showDelete = certifications.length > 1;

  return (
    <Form form="certifications" addButtonText="Add Certification">
      {certifications.map(({ name, issuer, date, url }, idx) => {
        const handleCertificationChange = (field, value) => {
          dispatch(changeCertifications({ idx, field, value }));
        };

        const showMoveUp = idx !== 0;
        const showMoveDown = idx !== certifications.length - 1;

        return (
          <FormSection
            key={idx}
            form="certifications"
            idx={idx}
            showMoveUp={showMoveUp}
            showMoveDown={showMoveDown}
            showDelete={showDelete}
            deleteButtonTooltipText="Delete certification"
          >
            <Input
              label="Certification Name"
              labelClassName="col-span-full"
              name="name"
              placeholder="AWS Certified Solutions Architect"
              value={name}
              onChange={handleCertificationChange}
            />
            <Input
              label="Issuer"
              labelClassName="col-span-4"
              name="issuer"
              placeholder="Amazon Web Services"
              value={issuer}
              onChange={handleCertificationChange}
            />
            <Input
              label="Date"
              labelClassName="col-span-2"
              name="date"
              placeholder="Jan 2023"
              value={date}
              onChange={handleCertificationChange}
            />
            <Input
              label="Credential URL (Optional)"
              labelClassName="col-span-full"
              name="url"
              placeholder="https://www.credly.com/..."
              value={url}
              onChange={handleCertificationChange}
            />
          </FormSection>
        );
      })}
    </Form>
  );
};

