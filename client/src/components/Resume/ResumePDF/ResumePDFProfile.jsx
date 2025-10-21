import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles, spacing } from './styles';
import { ResumePDFLink, ResumePDFText } from './common';

export const ResumePDFProfile = ({ profile, themeColor, baseFontPt = 11 }) => {
  const { name, email, phone, url, summary, location } = profile;
  const contactInfo = [email, phone, url, location].filter(Boolean);

  return (
    <View style={{ ...styles.flexCol, textAlign: 'center', marginBottom: 8 }}>
      {/* Name */}
      <Text
        style={{
          fontSize: baseFontPt + 8,
          fontWeight: 900,
          letterSpacing: 0.3,
          color: '#111827',
          textAlign: 'center',
          marginBottom: 2
        }}
      >
        {name || 'Your Name'}
      </Text>

      {/* Contact Info */}
      {contactInfo.length > 0 && (
        <View
          style={{
            ...styles.flexRow,
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginTop: 2
          }}
        >
          {email && (
            <Text style={{ fontSize: 10, color: '#64748b' }}>{email}</Text>
          )}
          {phone && <Text style={{ fontSize: 10, color: '#64748b' }}>{phone}</Text>}
          {url && (
            <Text style={{ fontSize: 10, color: '#64748b' }}>{url}</Text>
          )}
          {location && <Text style={{ fontSize: 10, color: '#64748b' }}>{location}</Text>}
        </View>
      )}

      {/* Summary/Objective */}
      {summary && (
        <View
          style={{
            borderTop: '1pt solid #e5e7eb',
            paddingTop: 10,
            marginTop: 10
          }}
        >
          <Text
            style={{ fontSize: 10, lineHeight: 1.4, textAlign: 'justify', color: '#111827' }}
          >
            {summary}
          </Text>
        </View>
      )}
    </View>
  );
};

