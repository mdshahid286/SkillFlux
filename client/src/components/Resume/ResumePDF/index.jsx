import React from 'react';
import { Page, View, Document } from '@react-pdf/renderer';
import { styles, spacing } from './styles';
import { ResumePDFProfile } from './ResumePDFProfile';
import { ResumePDFWorkExperience } from './ResumePDFWorkExperience';
import { ResumePDFEducation } from './ResumePDFEducation';
import { ResumePDFProject } from './ResumePDFProject';
import { ResumePDFSkills } from './ResumePDFSkills';
import { DEFAULT_FONT_COLOR } from '../../../redux/settingsSlice';

export const ResumePDF = ({ resume, settings, isPDF = false }) => {
  const { profile, workExperiences, educations, projects, skills } = resume;
  const { name } = profile;
  const {
    fontFamily,
    fontSize,
    documentSize,
    formToHeading,
    formToShow,
    formsOrder,
    showBulletPoints
  } = settings;
  const themeColor = settings.themeColor || DEFAULT_FONT_COLOR;

  const showFormsOrder = formsOrder.filter((form) => formToShow[form]);

  const formTypeToComponent = {
    workExperiences: () => (
      <ResumePDFWorkExperience
        heading={formToHeading['workExperiences']}
        workExperiences={workExperiences}
        themeColor={themeColor}
      />
    ),
    educations: () => (
      <ResumePDFEducation
        heading={formToHeading['educations']}
        educations={educations}
        themeColor={themeColor}
        showBulletPoints={showBulletPoints['educations']}
      />
    ),
    projects: () => (
      <ResumePDFProject
        heading={formToHeading['projects']}
        projects={projects}
        themeColor={themeColor}
      />
    ),
    skills: () => (
      <ResumePDFSkills
        heading={formToHeading['skills']}
        skills={skills}
        themeColor={themeColor}
        showBulletPoints={showBulletPoints['skills']}
      />
    )
  };

  // Map app font names to react-pdf built-ins
  const pdfFontFamily = (() => {
    const f = (fontFamily || '').toLowerCase();
    if (f.includes('times')) return 'Times-Roman';
    if (f.includes('courier')) return 'Courier';
    // Helvetica is built-in and closest to many sans fonts
    return 'Helvetica';
  })();

  const basePt = parseInt(fontSize) || 11;

  return (
    <Document title={`${name} Resume`} author={name} producer={'Resume Builder'}>
      <Page
        size={documentSize === 'A4' ? 'A4' : 'LETTER'}
        style={{
          ...styles.flexCol,
          color: DEFAULT_FONT_COLOR,
          fontFamily: pdfFontFamily,
          fontSize: basePt + 'pt',
          paddingLeft: '0.55in',
          paddingRight: '0.55in',
          paddingTop: '0.55in'
        }}
      >
        {Boolean(settings.themeColor) && (
          <View
            style={{
              width: 'calc(100% + 1.1in)',
              height: 6,
              backgroundColor: themeColor,
              marginLeft: '-0.55in',
              marginBottom: 14,
              marginTop: '-0.55in'
            }}
          />
        )}
        <ResumePDFProfile profile={profile} themeColor={themeColor} baseFontPt={basePt} />
        {showFormsOrder.map((form) => {
          const Component = formTypeToComponent[form];
          return Component ? <Component key={form} /> : null;
        })}
      </Page>
    </Document>
  );
};

