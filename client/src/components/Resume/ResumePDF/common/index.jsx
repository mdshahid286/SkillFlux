import React from 'react';
import { Text, View, Link } from '@react-pdf/renderer';
import { styles, spacing } from '../styles';

export const ResumePDFSection = ({ themeColor, heading, children }) => {
  return (
    <View style={{ marginTop: 18 }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 0.3,
          color: '#38bdf8',
          borderBottom: '1pt solid #e5e7eb',
          marginBottom: 8,
          paddingBottom: 4
        }}
      >
        {typeof heading === 'string' ? heading.toUpperCase() : ''}
      </Text>
      {children}
    </View>
  );
};

export const ResumePDFBulletList = ({ items, showBulletPoints = true }) => {
  return (
    <View style={{ ...styles.flexCol, marginTop: 5 }}>
      {items.map((item, idx) => (
        <View
          key={idx}
          style={{
            ...styles.flexRow,
            gap: 10,
            alignItems: 'flex-start'
          }}
        >
          {showBulletPoints && (
            <Text style={{ fontSize: 10, color: '#111827' }}>•</Text>
          )}
          <Text style={{ fontSize: 10, lineHeight: 1.4, color: '#111827', flex: 1 }}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
};

export const ResumePDFText = ({ children, style = {}, bold = false }) => {
  return (
    <Text
      style={{
        fontSize: 10,
        color: '#374151',
        ...(bold && { fontWeight: 'bold' }),
        ...style
      }}
    >
      {typeof children === 'string' ? children : ''}
    </Text>
  );
};

export const ResumePDFLink = ({ src, children }) => {
  return (
    <Link
      src={src}
      style={{
        fontSize: 10,
        color: '#3b82f6',
        textDecoration: 'underline'
      }}
    >
      {typeof children === 'string' ? children : ''}
    </Link>
  );
};

