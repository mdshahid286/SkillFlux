// Professional PDF Export Utility for Resume Builder
// Uses React-PDF for high-quality PDF generation

import { pdf } from '@react-pdf/renderer';

export const exportResumeToPDF = async (resumeData) => {
  try {
    // Dynamic import to avoid build issues if @react-pdf/renderer is not installed
    const { default: ResumePDF } = await import('../components/ResumePDF');
    
    // Generate PDF blob
    const blob = await pdf(ResumePDF({ resumeData })).toBlob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeData.personalInfo.name || 'resume'}-resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback to print dialog
    fallbackPrintResume(resumeData);
  }
};

// Fallback print function
const fallbackPrintResume = (resumeData) => {
  const printWindow = window.open('', '_blank');
  const htmlContent = generateResumeHTML(resumeData);
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
};

const generateResumeHTML = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Resume - ${data.personalInfo.name || 'Your Name'}</title>
      <style>
        body {
          font-family: 'Times New Roman', serif;
          line-height: 1.4;
          color: #333;
          margin: 0;
          padding: 0.5in;
          background: white;
        }
        
        .resume-container {
          max-width: 8.5in;
          margin: 0 auto;
        }
        
        .resume-header {
          text-align: center;
          margin-bottom: 2rem;
          border-bottom: 2px solid #8d6748;
          padding-bottom: 1rem;
        }
        
        .resume-name {
          font-size: 2rem;
          font-weight: bold;
          margin: 0 0 0.5rem 0;
          color: #8d6748;
        }
        
        .resume-contact {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.9rem;
          color: #666;
        }
        
        .resume-section {
          margin-bottom: 1.5rem;
        }
        
        .section-title {
          font-size: 1.2rem;
          font-weight: bold;
          color: #8d6748;
          margin: 0 0 0.8rem 0;
          border-bottom: 1px solid #ddd;
          padding-bottom: 0.3rem;
        }
        
        .section-content {
          margin: 0;
          text-align: justify;
        }
        
        .experience-item, .education-item, .project-item, .certification-item {
          margin-bottom: 1rem;
        }
        
        .experience-header, .education-header, .project-header, .certification-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.3rem;
        }
        
        .job-title, .degree, .project-name, .cert-name {
          font-weight: bold;
          margin: 0;
          font-size: 1rem;
        }
        
        .company, .institution, .issuer {
          font-style: italic;
          color: #666;
        }
        
        .dates, .date {
          color: #666;
          font-size: 0.9rem;
        }
        
        .location, .technologies, .gpa {
          margin: 0.2rem 0;
          color: #666;
          font-size: 0.9rem;
        }
        
        .description {
          margin: 0.5rem 0 0 0;
          text-align: justify;
        }
        
        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .skill-item {
          background: #f5f5f3;
          padding: 0.3rem 0.8rem;
          border-radius: 1rem;
          font-size: 0.9rem;
          border: 1px solid #ddd;
        }
        
        .project-link, .cert-link {
          color: #8d6748;
          text-decoration: none;
          font-size: 0.9rem;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0.5in;
          }
          
          .resume-header {
            border-bottom: 2px solid #000;
          }
          
          .section-title {
            border-bottom: 1px solid #000;
          }
        }
      </style>
    </head>
    <body>
      <div class="resume-container">
        <!-- Header -->
        <div class="resume-header">
          <h1 class="resume-name">${data.personalInfo.name || 'Your Name'}</h1>
          <div class="resume-contact">
            ${data.personalInfo.email ? `<span>${data.personalInfo.email}</span>` : ''}
            ${data.personalInfo.phone ? `<span>${data.personalInfo.phone}</span>` : ''}
            ${data.personalInfo.location ? `<span>${data.personalInfo.location}</span>` : ''}
            ${data.personalInfo.website ? `<span>${data.personalInfo.website}</span>` : ''}
            ${data.personalInfo.linkedin ? `<span>${data.personalInfo.linkedin}</span>` : ''}
            ${data.personalInfo.github ? `<span>${data.personalInfo.github}</span>` : ''}
          </div>
        </div>

        <!-- Summary -->
        ${data.summary ? `
          <div class="resume-section">
            <h2 class="section-title">Professional Summary</h2>
            <p class="section-content">${data.summary}</p>
          </div>
        ` : ''}

        <!-- Experience -->
        ${data.experience.length > 0 ? `
          <div class="resume-section">
            <h2 class="section-title">Experience</h2>
            ${data.experience.map(exp => `
              <div class="experience-item">
                <div class="experience-header">
                  <h3 class="job-title">${exp.position}</h3>
                  <span class="company">${exp.company}</span>
                  <span class="dates">
                    ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                ${exp.location ? `<p class="location">${exp.location}</p>` : ''}
                ${exp.description ? `<p class="description">${exp.description}</p>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Education -->
        ${data.education.length > 0 ? `
          <div class="resume-section">
            <h2 class="section-title">Education</h2>
            ${data.education.map(edu => `
              <div class="education-item">
                <div class="education-header">
                  <h3 class="degree">${edu.degree} in ${edu.field}</h3>
                  <span class="institution">${edu.institution}</span>
                  <span class="dates">
                    ${edu.startDate} - ${edu.endDate}
                  </span>
                </div>
                ${edu.location ? `<p class="location">${edu.location}</p>` : ''}
                ${edu.gpa ? `<p class="gpa">GPA: ${edu.gpa}</p>` : ''}
                ${edu.description ? `<p class="description">${edu.description}</p>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Skills -->
        ${data.skills.length > 0 ? `
          <div class="resume-section">
            <h2 class="section-title">Skills</h2>
            <div class="skills-list">
              ${data.skills.map(skill => `
                <span class="skill-item">${skill}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Projects -->
        ${data.projects.length > 0 ? `
          <div class="resume-section">
            <h2 class="section-title">Projects</h2>
            ${data.projects.map(project => `
              <div class="project-item">
                <div class="project-header">
                  <h3 class="project-name">${project.name}</h3>
                  ${project.url ? `<a href="${project.url}" class="project-link">View Project</a>` : ''}
                  ${project.github ? `<a href="${project.github}" class="project-link">GitHub</a>` : ''}
                </div>
                ${project.technologies ? `<p class="technologies">${project.technologies}</p>` : ''}
                ${project.description ? `<p class="description">${project.description}</p>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Certifications -->
        ${data.certifications.length > 0 ? `
          <div class="resume-section">
            <h2 class="section-title">Certifications</h2>
            ${data.certifications.map(cert => `
              <div class="certification-item">
                <div class="certification-header">
                  <h3 class="cert-name">${cert.name}</h3>
                  <span class="issuer">${cert.issuer}</span>
                  <span class="date">${cert.date}</span>
                </div>
                ${cert.url ? `<a href="${cert.url}" class="cert-link">View Credential</a>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;
};

// Alternative: Export as downloadable HTML file
export const downloadResumeAsHTML = (resumeData) => {
  const htmlContent = generateResumeHTML(resumeData);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${resumeData.personalInfo.name || 'resume'}-resume.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};
