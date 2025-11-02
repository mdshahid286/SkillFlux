import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles, spacing } from './styles';
import { ResumePDFSection, ResumePDFBulletList, ResumePDFText } from './common';

export const ResumePDFWorkExperience = ({
  heading,
  workExperiences,
  themeColor
}) => {
  return (
    <ResumePDFSection themeColor={themeColor} heading={heading}>
      {workExperiences.map(({ company, jobTitle, date, descriptions }, idx) => {
        if (!company && !jobTitle) return null;

        return (
          <View
            key={idx}
            style={{
              ...styles.flexCol,
              marginBottom: 10
            }}
          >
            <View style={{ ...styles.flexRow, justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#111827'
                }}
              >
                {company}
              </Text>
              {date && (
                <Text style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>
                  {date}
                </Text>
              )}
            </View>
            {jobTitle && (
              <Text
                style={{
                  fontSize: 10,
                  color: '#111827', // change to black
                  marginTop: 1,
                  fontWeight: 500 // normal for job title
                }}
              >
                {jobTitle}
              </Text>
            )}
            {descriptions && descriptions.length > 0 && (
              <ResumePDFBulletList items={descriptions} showBulletPoints={true} />
            )}
          </View>
        );
      })}
    </ResumePDFSection>
  );
};

