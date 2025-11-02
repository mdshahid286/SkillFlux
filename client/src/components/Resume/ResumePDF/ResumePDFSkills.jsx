import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles, spacing } from './styles';
import { ResumePDFSection, ResumePDFBulletList } from './common';

export const ResumePDFSkills = ({
  heading,
  skills,
  themeColor,
  showBulletPoints = true
}) => {
  const { featuredSkills, descriptions } = skills;
  const hasFeaturedSkills = featuredSkills && featuredSkills.some((skill) => skill.skill);

  return (
    <ResumePDFSection themeColor={themeColor} heading={heading}>
      {/* Featured Skills */}
      {hasFeaturedSkills && (
        <View style={{ ...styles.flexCol }}>
          {featuredSkills.map(({ skill, rating }, idx) => {
            if (!skill || !String(skill).trim()) return null;

            return (
              <View
                key={idx}
                style={{
                  ...styles.flexRow,
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 5
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    flex: 1,
                    color: '#111827',
                    fontWeight: 700 // skill bold only
                  }}
                >
                  {skill}
                </Text>
                <View style={{ ...styles.flexRow, gap: 6 }}>
                  {[1, 2, 3].map((level) => (
                    <View
                      key={level}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: rating >= level ? themeColor : '#d1d5db'
                      }}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Skills List */}
      {descriptions && descriptions.length > 0 && (
        <View style={{ marginTop: hasFeaturedSkills ? 6 : 0 }}>
          <ResumePDFBulletList
            items={descriptions}
            showBulletPoints={showBulletPoints}
          />
        </View>
      )}
    </ResumePDFSection>
  );
};

