import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { exportResumeToPDF } from '../utils/pdfExport';
import ResumePreview from '../components/ResumePreview';
import './ResumeBuilder.css';

// Resume Builder Component - Based on OpenResume
export default function ResumeBuilder() {
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
  });
  
  const [activeSection, setActiveSection] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  // Load saved resume data on component mount
  useEffect(() => {
    const loadResumeData = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'resumes', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setResumeData(docSnap.data());
          }
        } catch (error) {
          console.error('Error loading resume:', error);
        }
      }
    };
    loadResumeData();
  }, [user]);

  // Save resume data to Firebase
  const saveResume = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const docRef = doc(db, 'resumes', user.uid);
      await setDoc(docRef, resumeData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving resume:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update resume data
  const updateResumeData = (section, data) => {
    setResumeData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  // Add new item to array sections
  const addItem = (section) => {
    const newItem = getDefaultItem(section);
    setResumeData(prev => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }));
  };

  // Remove item from array sections
  const removeItem = (section, index) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  // Get default item structure
  const getDefaultItem = (section) => {
    switch (section) {
      case 'experience':
        return {
          company: '',
          position: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: ''
        };
      case 'education':
        return {
          institution: '',
          degree: '',
          field: '',
          location: '',
          startDate: '',
          endDate: '',
          gpa: '',
          description: ''
        };
      case 'projects':
        return {
          name: '',
          description: '',
          technologies: '',
          url: '',
          github: ''
        };
      case 'certifications':
        return {
          name: '',
          issuer: '',
          date: '',
          url: ''
        };
      default:
        return {};
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    exportResumeToPDF(resumeData);
  };

  return (
    <div className="resume-builder-page">
      <div className="resume-builder-container">
        {/* Header */}
        <div className="resume-builder-header">
          <h1 className="resume-builder-title">RESUME BUILDER</h1>
          <div className="resume-builder-actions">
            <button 
              className="action-btn secondary"
              onClick={saveResume}
              disabled={loading}
            >
              {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Resume'}
            </button>
            <button 
              className="action-btn primary"
              onClick={exportToPDF}
            >
              Download PDF
            </button>
            <button 
              className="action-btn secondary"
              onClick={() => navigate('/resume')}
            >
              Back to Analysis
            </button>
          </div>
        </div>

        <div className="resume-builder-content">
          <div className="side-by-side-layout">
            {/* Left Panel - Form */}
            <div className="form-panel">
              <div className="section-nav">
                {[
                  { id: 'personal', label: 'Personal Info' },
                  { id: 'summary', label: 'Objective' },
                  { id: 'experience', label: 'Experience' },
                  { id: 'education', label: 'Education' },
                  { id: 'skills', label: 'Skills' },
                  { id: 'projects', label: 'Projects' },
                  { id: 'certifications', label: 'Certifications' }
                ].map(section => (
                  <button
                    key={section.id}
                    className={`section-nav-btn ${activeSection === section.id ? 'active' : ''}`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
              <div className="form-content">
                {activeSection === 'personal' && (
                  <PersonalInfoSection 
                    data={resumeData.personalInfo}
                    updateData={(data) => updateResumeData('personalInfo', data)}
                  />
                )}
                
                {activeSection === 'summary' && (
                  <SummarySection 
                    data={resumeData.summary}
                    updateData={(data) => updateResumeData('summary', data)}
                  />
                )}
                
                {activeSection === 'experience' && (
                  <ExperienceSection 
                    data={resumeData.experience}
                    updateData={(data) => updateResumeData('experience', data)}
                    addItem={() => addItem('experience')}
                    removeItem={(index) => removeItem('experience', index)}
                  />
                )}
                
                {activeSection === 'education' && (
                  <EducationSection 
                    data={resumeData.education}
                    updateData={(data) => updateResumeData('education', data)}
                    addItem={() => addItem('education')}
                    removeItem={(index) => removeItem('education', index)}
                  />
                )}
                
                {activeSection === 'skills' && (
                  <SkillsSection 
                    data={resumeData.skills}
                    updateData={(data) => updateResumeData('skills', data)}
                  />
                )}
                
                {activeSection === 'projects' && (
                  <ProjectsSection 
                    data={resumeData.projects}
                    updateData={(data) => updateResumeData('projects', data)}
                    addItem={() => addItem('projects')}
                    removeItem={(index) => removeItem('projects', index)}
                  />
                )}
                
                {activeSection === 'certifications' && (
                  <CertificationsSection 
                    data={resumeData.certifications}
                    updateData={(data) => updateResumeData('certifications', data)}
                    addItem={() => addItem('certifications')}
                    removeItem={(index) => removeItem('certifications', index)}
                  />
                )}
              </div>
            </div>

            {/* Right Panel - Live Preview */}
            <div className="preview-panel">
              <div className="preview-content">
                <div className="resume-preview">
                  <ResumePreview data={resumeData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .resume-builder-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f5f3 0%, #e6ded7 100%);
          padding: 2rem;
        }

        .resume-builder-container {
          max-width: 1400px;
          margin: 0 auto;
          background: #fff;
          border-radius: 1.5rem;
          box-shadow: 0 20px 60px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .resume-builder-header {
          background: linear-gradient(135deg, var(--brown) 0%, #bfae9e 100%);
          color: white;
          padding: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .resume-builder-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0;
          letter-spacing: 0.05em;
        }

        .resume-builder-actions {
          display: flex;
          gap: 1rem;
        }

        .action-btn {
          padding: 0.8rem 1.5rem;
          border: none;
          border-radius: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .action-btn.primary {
          background: #fff;
          color: var(--brown);
        }

        .action-btn.secondary {
          background: rgba(255,255,255,0.2);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .resume-builder-content {
          display: flex;
          min-height: 600px;
        }

        .resume-sidebar {
          width: 280px;
          background: #f8f9fa;
          border-right: 1px solid #e0e3ea;
        }

        .resume-nav {
          padding: 1rem 0;
        }

        .nav-item {
          width: 100%;
          padding: 1rem 1.5rem;
          border: none;
          background: transparent;
          text-align: left;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
          color: #666;
        }

        .nav-item:hover {
          background: rgba(141, 103, 72, 0.1);
          color: var(--brown);
        }

        .nav-item.active {
          background: var(--brown);
          color: white;
        }

        .nav-icon {
          font-size: 1.2rem;
        }

        .nav-label {
          font-weight: 600;
        }

        .resume-main-content {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        .resume-preview {
          flex: 1;
          padding: 2rem;
          background: #f8f9fa;
        }

        @media (max-width: 768px) {
          .resume-builder-content {
            flex-direction: column;
          }
          
          .resume-sidebar {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #e0e3ea;
          }
          
          .resume-nav {
            display: flex;
            overflow-x: auto;
            padding: 1rem;
          }
          
          .nav-item {
            min-width: 120px;
            flex-direction: column;
            text-align: center;
            padding: 0.8rem;
          }
          
          .resume-builder-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
          
          .resume-builder-actions {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

// Personal Information Section
function PersonalInfoSection({ data, updateData }) {
  const handleChange = (field, value) => {
    updateData({ ...data, [field]: value });
  };

  return (
    <div className="section-container">
      <h2 className="section-title">Personal Information</h2>
      <div className="form-grid">
        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Sal Khan"
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="hello@khanacademy.org"
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="(123) 456-7890"
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label>Website</label>
          <input
            type="url"
            value={data.website}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="linkedin.com/in/khanacademy"
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            value={data.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="NYC, NY"
            className="form-input"
          />
        </div>
      </div>
    </div>
  );
}

// Summary Section
function SummarySection({ data, updateData }) {
  return (
    <div className="section-container">
      <h2 className="section-title">Objective</h2>
      <div className="form-group">
        <label>Objective</label>
        <textarea
          value={data}
          onChange={(e) => updateData(e.target.value)}
          placeholder="Entrepreneur and educator obsessed with making education free for anyone"
          className="form-textarea"
          rows={4}
        />
      </div>
    </div>
  );
}

// Experience Section
function ExperienceSection({ data, updateData, addItem, removeItem }) {
  const updateItem = (index, field, value) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    updateData(newData);
  };

  return (
    <div className="section-container">
      <div className="section-header">
        <h2 className="section-title">Work Experience</h2>
        <button className="add-btn" onClick={addItem}>
          + Add Experience
        </button>
      </div>
      
      {data.map((item, index) => (
        <div key={index} className="item-card">
          <div className="item-header">
            <h3>Experience #{index + 1}</h3>
            <button className="remove-btn" onClick={() => removeItem(index)}>
              Remove
            </button>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Job Title *</label>
              <input
                type="text"
                value={item.position}
                onChange={(e) => updateItem(index, 'position', e.target.value)}
                placeholder="Software Engineer"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Company *</label>
              <input
                type="text"
                value={item.company}
                onChange={(e) => updateItem(index, 'company', e.target.value)}
                placeholder="Tech Company Inc."
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={item.location}
                onChange={(e) => updateItem(index, 'location', e.target.value)}
                placeholder="San Francisco, CA"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="month"
                value={item.startDate}
                onChange={(e) => updateItem(index, 'startDate', e.target.value)}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>End Date</label>
              <input
                type="month"
                value={item.endDate}
                onChange={(e) => updateItem(index, 'endDate', e.target.value)}
                className="form-input"
                disabled={item.current}
              />
            </div>
            
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={item.current}
                  onChange={(e) => updateItem(index, 'current', e.target.checked)}
                />
                Currently working here
              </label>
            </div>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={item.description}
              onChange={(e) => updateItem(index, 'description', e.target.value)}
              placeholder="Describe your key responsibilities and achievements..."
              className="form-textarea"
              rows={4}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Education Section
function EducationSection({ data, updateData, addItem, removeItem }) {
  const updateItem = (index, field, value) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    updateData(newData);
  };

  return (
    <div className="section-container">
      <div className="section-header">
        <h2 className="section-title">Education</h2>
        <button className="add-btn" onClick={addItem}>
          + Add Education
        </button>
      </div>
      
      {data.map((item, index) => (
        <div key={index} className="item-card">
          <div className="item-header">
            <h3>Education #{index + 1}</h3>
            <button className="remove-btn" onClick={() => removeItem(index)}>
              Remove
            </button>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Institution *</label>
              <input
                type="text"
                value={item.institution}
                onChange={(e) => updateItem(index, 'institution', e.target.value)}
                placeholder="University of California"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Degree *</label>
              <input
                type="text"
                value={item.degree}
                onChange={(e) => updateItem(index, 'degree', e.target.value)}
                placeholder="Bachelor of Science"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Field of Study</label>
              <input
                type="text"
                value={item.field}
                onChange={(e) => updateItem(index, 'field', e.target.value)}
                placeholder="Computer Science"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={item.location}
                onChange={(e) => updateItem(index, 'location', e.target.value)}
                placeholder="Berkeley, CA"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="month"
                value={item.startDate}
                onChange={(e) => updateItem(index, 'startDate', e.target.value)}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>End Date</label>
              <input
                type="month"
                value={item.endDate}
                onChange={(e) => updateItem(index, 'endDate', e.target.value)}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>GPA</label>
              <input
                type="text"
                value={item.gpa}
                onChange={(e) => updateItem(index, 'gpa', e.target.value)}
                placeholder="3.8/4.0"
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={item.description}
              onChange={(e) => updateItem(index, 'description', e.target.value)}
              placeholder="Relevant coursework, honors, or achievements..."
              className="form-textarea"
              rows={3}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Skills Section
function SkillsSection({ data, updateData }) {
  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    if (skillInput.trim() && !data.includes(skillInput.trim())) {
      updateData([...data, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    updateData(data.filter(s => s !== skill));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="section-container">
      <h2 className="section-title">Skills</h2>
      
      <div className="form-group">
        <label>Add Skills</label>
        <div className="skill-input-container">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter a skill and press Enter"
            className="form-input"
          />
          <button className="add-skill-btn" onClick={addSkill}>
            Add
          </button>
        </div>
      </div>
      
      <div className="skills-display">
        {data.map((skill, index) => (
          <div key={index} className="skill-tag">
            {skill}
            <button 
              className="remove-skill-btn"
              onClick={() => removeSkill(skill)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Projects Section
function ProjectsSection({ data, updateData, addItem, removeItem }) {
  const updateItem = (index, field, value) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    updateData(newData);
  };

  return (
    <div className="section-container">
      <div className="section-header">
        <h2 className="section-title">Projects</h2>
        <button className="add-btn" onClick={addItem}>
          + Add Project
        </button>
      </div>
      
      {data.map((item, index) => (
        <div key={index} className="item-card">
          <div className="item-header">
            <h3>Project #{index + 1}</h3>
            <button className="remove-btn" onClick={() => removeItem(index)}>
              Remove
            </button>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Project Name *</label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
                placeholder="E-commerce Website"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Technologies Used</label>
              <input
                type="text"
                value={item.technologies}
                onChange={(e) => updateItem(index, 'technologies', e.target.value)}
                placeholder="React, Node.js, MongoDB"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Project URL</label>
              <input
                type="url"
                value={item.url}
                onChange={(e) => updateItem(index, 'url', e.target.value)}
                placeholder="https://myproject.com"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>GitHub Repository</label>
              <input
                type="url"
                value={item.github}
                onChange={(e) => updateItem(index, 'github', e.target.value)}
                placeholder="https://github.com/username/project"
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={item.description}
              onChange={(e) => updateItem(index, 'description', e.target.value)}
              placeholder="Describe the project, your role, and key achievements..."
              className="form-textarea"
              rows={4}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Certifications Section
function CertificationsSection({ data, updateData, addItem, removeItem }) {
  const updateItem = (index, field, value) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    updateData(newData);
  };

  return (
    <div className="section-container">
      <div className="section-header">
        <h2 className="section-title">Certifications</h2>
        <button className="add-btn" onClick={addItem}>
          + Add Certification
        </button>
      </div>
      
      {data.map((item, index) => (
        <div key={index} className="item-card">
          <div className="item-header">
            <h3>Certification #{index + 1}</h3>
            <button className="remove-btn" onClick={() => removeItem(index)}>
              Remove
            </button>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Certification Name *</label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
                placeholder="AWS Certified Solutions Architect"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Issuing Organization</label>
              <input
                type="text"
                value={item.issuer}
                onChange={(e) => updateItem(index, 'issuer', e.target.value)}
                placeholder="Amazon Web Services"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Date Obtained</label>
              <input
                type="month"
                value={item.date}
                onChange={(e) => updateItem(index, 'date', e.target.value)}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Credential URL</label>
              <input
                type="url"
                value={item.url}
                onChange={(e) => updateItem(index, 'url', e.target.value)}
                placeholder="https://credly.com/badges/..."
                className="form-input"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Resume Preview Component (removed - using imported component)
