import React from 'react';
import { View, Text, Link } from '@react-pdf/renderer';
import { styles } from './styles';
import { ResumePDFSection, ResumePDFBulletList } from './common';

export const ResumePDFProject = ({ heading, projects, themeColor }) => {
  return (
    <ResumePDFSection themeColor={themeColor} heading={heading}>
      {projects.map(({ project, date, descriptions, url }, idx) => {
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
              {url ? (
                <Link src={url.startsWith('http') ? url : `https://${url}`} style={{ fontSize: 11, fontWeight: 800, color: '#111827' }}>
                  {project}
                </Link>
              ) : (
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: '#111827'
                  }}
                >
                  {project}
                </Text>
              )}
              {date && (
                <Text style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>
                  {date}
                </Text>
              )}
            </View>
            {descriptions && descriptions.length > 0 && (
              <ResumePDFBulletList items={descriptions} showBulletPoints={true} textColor="#111827" fontWeight={400} />
            )}
          </View>
        );
      })}
    </ResumePDFSection>
  );
};

