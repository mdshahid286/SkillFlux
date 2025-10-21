import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts for professional typography
Font.register({
  family: 'Inter',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2',
      fontWeight: 600,
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYfAZ9hiJ-Ek-_EeA.woff2',
      fontWeight: 700,
    },
  ],
});

// Professional color scheme matching OpenResume
const colors = {
  primary: '#1a1a1a',      // Deep black for headers
  secondary: '#4a4a4a',    // Dark gray for subheaders
  text: '#2d2d2d',         // Main text color
  lightText: '#6b7280',    // Light gray for dates/locations
  accent: '#2563eb',       // Professional blue for links
  border: '#e5e7eb',       // Light border
  background: '#ffffff',   // White background
};

// Professional typography styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: colors.background,
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 10,
    lineHeight: 1.4,
    color: colors.text,
  },
  
  // Header Section
  header: {
    marginBottom: 24,
    borderBottom: `2px solid ${colors.border}`,
    paddingBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  contactItem: {
    fontSize: 9,
    color: colors.lightText,
    fontWeight: 400,
  },
  link: {
    color: colors.accent,
    textDecoration: 'none',
  },
  
  // Section Styles
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: 4,
  },
  
  // Experience & Education Items
  item: {
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.primary,
    flex: 1,
  },
  itemSubtitle: {
    fontSize: 10,
    fontWeight: 400,
    color: colors.secondary,
    fontStyle: 'italic',
  },
  itemMeta: {
    fontSize: 9,
    color: colors.lightText,
    textAlign: 'right',
    minWidth: 80,
  },
  itemLocation: {
    fontSize: 9,
    color: colors.lightText,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 9,
    color: colors.text,
    lineHeight: 1.4,
    marginTop: 4,
  },
  
  // Skills Section
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 8,
    color: colors.text,
    fontWeight: 500,
  },
  
  // Projects Section
  projectItem: {
    marginBottom: 10,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  projectName: {
    fontSize: 10,
    fontWeight: 600,
    color: colors.primary,
  },
  projectLinks: {
    flexDirection: 'row',
    gap: 8,
  },
  projectLink: {
    fontSize: 8,
    color: colors.accent,
    textDecoration: 'none',
  },
  projectTech: {
    fontSize: 8,
    color: colors.lightText,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  
  // Certifications
  certItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  certName: {
    fontSize: 10,
    fontWeight: 600,
    color: colors.primary,
    flex: 1,
  },
  certMeta: {
    fontSize: 8,
    color: colors.lightText,
    textAlign: 'right',
  },
  
  // Summary
  summary: {
    fontSize: 10,
    color: colors.text,
    lineHeight: 1.5,
    textAlign: 'justify',
  },
});

// Professional Resume PDF Component
export const ResumePDF = ({ resumeData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.name}>
          {resumeData.personalInfo.name || 'Your Name'}
        </Text>
        <View style={styles.contactInfo}>
          {resumeData.personalInfo.email && (
            <Text style={styles.contactItem}>
              {resumeData.personalInfo.email}
            </Text>
          )}
          {resumeData.personalInfo.phone && (
            <Text style={styles.contactItem}>
              {resumeData.personalInfo.phone}
            </Text>
          )}
          {resumeData.personalInfo.location && (
            <Text style={styles.contactItem}>
              {resumeData.personalInfo.location}
            </Text>
          )}
          {resumeData.personalInfo.website && (
            <Text style={[styles.contactItem, styles.link]}>
              {resumeData.personalInfo.website}
            </Text>
          )}
          {resumeData.personalInfo.linkedin && (
            <Text style={[styles.contactItem, styles.link]}>
              LinkedIn
            </Text>
          )}
          {resumeData.personalInfo.github && (
            <Text style={[styles.contactItem, styles.link]}>
              GitHub
            </Text>
          )}
        </View>
      </View>

      {/* Objective */}
      {resumeData.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objective</Text>
          <Text style={styles.summary}>{resumeData.summary}</Text>
        </View>
      )}

      {/* Experience Section */}
      {resumeData.experience && resumeData.experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Experience</Text>
          {resumeData.experience.map((exp, index) => (
            <View key={index} style={styles.item}>
              <View style={styles.itemHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{exp.position}</Text>
                  <Text style={styles.itemSubtitle}>{exp.company}</Text>
                </View>
                <Text style={styles.itemMeta}>
                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                </Text>
              </View>
              {exp.location && (
                <Text style={styles.itemLocation}>{exp.location}</Text>
              )}
              {exp.description && (
                <Text style={styles.itemDescription}>{exp.description}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Education Section */}
      {resumeData.education && resumeData.education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {resumeData.education.map((edu, index) => (
            <View key={index} style={styles.item}>
              <View style={styles.itemHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>
                    {edu.degree} {edu.field && `in ${edu.field}`}
                  </Text>
                  <Text style={styles.itemSubtitle}>{edu.institution}</Text>
                </View>
                <Text style={styles.itemMeta}>
                  {edu.startDate} - {edu.endDate}
                </Text>
              </View>
              {edu.location && (
                <Text style={styles.itemLocation}>{edu.location}</Text>
              )}
              {edu.gpa && (
                <Text style={styles.itemDescription}>GPA: {edu.gpa}</Text>
              )}
              {edu.description && (
                <Text style={styles.itemDescription}>{edu.description}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Skills Section */}
      {resumeData.skills && resumeData.skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Skills</Text>
          <View style={styles.skillsContainer}>
            {resumeData.skills.map((skill, index) => (
              <Text key={index} style={styles.skillTag}>
                {skill}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Projects Section */}
      {resumeData.projects && resumeData.projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {resumeData.projects.map((project, index) => (
            <View key={index} style={styles.projectItem}>
              <View style={styles.projectHeader}>
                <Text style={styles.projectName}>{project.name}</Text>
                <View style={styles.projectLinks}>
                  {project.url && (
                    <Text style={styles.projectLink}>Live Demo</Text>
                  )}
                  {project.github && (
                    <Text style={styles.projectLink}>GitHub</Text>
                  )}
                </View>
              </View>
              {project.technologies && (
                <Text style={styles.projectTech}>
                  Technologies: {project.technologies}
                </Text>
              )}
              {project.description && (
                <Text style={styles.itemDescription}>{project.description}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Certifications Section */}
      {resumeData.certifications && resumeData.certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {resumeData.certifications.map((cert, index) => (
            <View key={index} style={styles.certItem}>
              <Text style={styles.certName}>{cert.name}</Text>
              <Text style={styles.certMeta}>
                {cert.issuer} • {cert.date}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Page>
  </Document>
);

export default ResumePDF;
