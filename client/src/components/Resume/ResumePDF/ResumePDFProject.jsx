import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles, spacing } from './styles';
import { ResumePDFSection, ResumePDFBulletList, ResumePDFText } from './common';

export const ResumePDFProject = ({ heading, projects, themeColor }) => {
  return (
    <ResumePDFSection themeColor={themeColor} heading={heading}>
      {projects.map(({ project, date, descriptions }, idx) => {
        if (!project) return null;

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
                  color: themeColor
                }}
              >
                {project}
              </Text>
              {date && (
                <Text style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>
                  {date}
                </Text>
              )}
            </View>
            {descriptions && descriptions.length > 0 && (
              <ResumePDFBulletList items={descriptions} showBulletPoints={true} />
            )}
          </View>
        );
      })}
    </ResumePDFSection>
  );
};

