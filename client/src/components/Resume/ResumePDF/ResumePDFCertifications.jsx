import React from 'react';
import { View, Text, Link } from '@react-pdf/renderer';
import { styles, spacing } from './styles';
import { ResumePDFSection, ResumePDFBulletList, ResumePDFText } from './common';

export const ResumePDFCertifications = ({ heading, certifications, themeColor }) => {
  return (
    <ResumePDFSection themeColor={themeColor} heading={heading}>
      {certifications.map(({ name, issuer, date, url }, idx) => {
        if (!name) return null;

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
                  {name}
                </Link>
              ) : (
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: '#111827'
                  }}
                >
                  {name}
                </Text>
              )}
              {date && (
                <Text style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>
                  {date}
                </Text>
              )}
            </View>
            {issuer && (
              <Text
                style={{
                  fontSize: 10,
                  color: '#111827',
                  marginTop: 1,
                  fontWeight: 500
                }}
              >
                {issuer}
              </Text>
            )}
          </View>
        );
      })}
    </ResumePDFSection>
  );
};

