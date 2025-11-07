import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from './styles';
import { ResumePDFSection, ResumePDFBulletList } from './common';

export const ResumePDFEducation = ({
  heading,
  educations,
  themeColor,
  showBulletPoints = true
}) => {
  return (
    <ResumePDFSection themeColor={themeColor} heading={heading}>
      {educations.map(({ school, degree, date, gpa, descriptions }, idx) => {
        if (!school && !degree) return null;

        const degreeWithGPA = gpa ? `${degree} - GPA: ${gpa}` : degree;

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
                {school}
              </Text>
              {date && (
                <Text style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>
                  {date}
                </Text>
              )}
            </View>
            {degree && (
              <Text
                style={{
                  fontSize: 10,
                  color: '#111827', // changed to black
                  marginTop: 1,
                  fontWeight: 500 // degree line normal weight
                }}
              >
                {degreeWithGPA}
              </Text>
            )}
            {descriptions && descriptions.length > 0 && (
              <ResumePDFBulletList
                items={descriptions}
                showBulletPoints={showBulletPoints}
              />
            )}
          </View>
        );
      })}
    </ResumePDFSection>
  );
};

