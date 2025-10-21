import React from 'react';

const ResumePreview = ({ data }) => {
  return (
    <div className="resume-preview-container">
      <div className="resume-preview-content">
        {/* Header */}
        <div className="resume-header">
          <h1 className="resume-name">{data.personalInfo.name || 'Your Name'}</h1>
          <div className="contact-info">
            {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
            {data.personalInfo.website && <span>{data.personalInfo.website}</span>}
            {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
          </div>
        </div>

        {/* Objective */}
        {data.summary && (
          <div className="resume-section">
            <h2 className="section-title">Objective</h2>
            <p className="section-content">{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <div className="resume-section">
            <h2 className="section-title">Work Experience</h2>
            {data.experience.map((exp, index) => (
              <div key={index} className="experience-item">
                <div className="experience-header">
                  <h3 className="job-title">{exp.title}</h3>
                  <span className="company">{exp.company}</span>
                </div>
                <div className="experience-details">
                  <span className="date">{exp.startDate} - {exp.endDate}</span>
                  {exp.location && <span className="location">{exp.location}</span>}
                </div>
                {exp.description && (
                  <div className="experience-description">
                    {exp.description.split('\n').map((line, i) => (
                      <p key={i} className="description-line">{line}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div className="resume-section">
            <h2 className="section-title">Education</h2>
            {data.education.map((edu, index) => (
              <div key={index} className="education-item">
                <div className="education-header">
                  <h3 className="degree">{edu.degree} in {edu.fieldOfStudy}</h3>
                  <span className="institution">{edu.institution}</span>
                </div>
                <div className="education-details">
                  <span className="date">{edu.startDate} - {edu.endDate}</span>
                  {edu.location && <span className="location">{edu.location}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div className="resume-section">
            <h2 className="section-title">Skills</h2>
            <div className="skills-list">
              {data.skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <div className="resume-section">
            <h2 className="section-title">Projects</h2>
            {data.projects.map((proj, index) => (
              <div key={index} className="project-item">
                <h3 className="project-title">{proj.title}</h3>
                <p className="project-description">{proj.description}</p>
                {proj.technologies && (
                  <p className="project-tech">Technologies: {proj.technologies}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <div className="resume-section">
            <h2 className="section-title">Certifications</h2>
            {data.certifications.map((cert, index) => (
              <div key={index} className="certification-item">
                <h3 className="cert-name">{cert.name}</h3>
                <span className="cert-issuer">{cert.issuer}</span>
                <span className="cert-date">{cert.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;
