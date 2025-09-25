import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ResumeAnalysis() {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResume(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!resume) {
      setError('Please select a resume file');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // TODO: Implement actual resume upload and analysis
      console.log('Uploading resume:', resume);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to resume result page
      navigate('/resume-result');
    } catch (err) {
      setError('Failed to upload resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-analysis-page">
      <div className="resume-analysis-container">
        <div className="resume-analysis-card">
          <h1 className="resume-analysis-title">RESUME ANALYSIS</h1>
          <div className="resume-upload-card">
            <h2 className="upload-title">UPLOAD RESUME</h2>
            <div className="upload-area" onClick={() => document.getElementById('resume-file').click()}>
              <div className="upload-icon">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="10" y="25" width="40" height="20" rx="4" fill="var(--brown)" />
                  <path d="M30 15L30 35M25 20L30 15L35 20" stroke="var(--beige)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="upload-text">Click to choose your resume file</p>
              {resume && (
                <p className="file-selected">Selected: {resume.name}</p>
              )}
            </div>
            <input
              id="resume-file"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {error && <div className="upload-error">{error}</div>}
            <button 
              className="upload-btn" 
              onClick={handleUpload} 
              disabled={!resume || loading}
            >
              {loading ? 'UPLOADING...' : 'UPLOAD & ANALYZE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
