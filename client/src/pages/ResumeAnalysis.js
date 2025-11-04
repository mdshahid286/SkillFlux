import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleFileUpload } from '../utils/resumeImport';

export default function ResumeAnalysis() {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jobDescription, setJobDescription] = useState('');
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
      // Extract resume data using the resumeImport utility
      handleFileUpload(
        resume,
        async (parsedData) => {
          try {
            // Send parsed resume data to server for ATS analysis
            const response = await fetch('/api/analyze-resume', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                resumeData: parsedData,
                jobDescription: jobDescription.trim() || undefined
              }),
            });

            // Check content type and get response text first (we can only read once)
            const contentType = response.headers.get('content-type');
            const responseText = await response.text();
            
            // Check if response is HTML (error page)
            if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
              console.error('Server returned HTML instead of JSON. Response:', responseText.substring(0, 500));
              throw new Error('Server error: The backend server may not be running or the endpoint is not found. Please ensure the server is running on port 5000.');
            }
            
            // Check content type
            if (!contentType || !contentType.includes('application/json')) {
              console.error('Non-JSON response:', responseText.substring(0, 200));
              throw new Error('Server returned an invalid response. Please ensure the server is running on port 5000 and the /api/analyze-resume endpoint exists.');
            }

            // Parse JSON response
            let analysisResult;
            try {
              analysisResult = JSON.parse(responseText);
            } catch (parseError) {
              console.error('JSON parse error. Response:', responseText.substring(0, 500));
              throw new Error('Server returned invalid JSON. Please check the server logs.');
            }

            // Check if response indicates an error
            if (!response.ok) {
              throw new Error(analysisResult.error || 'Failed to analyze resume');
            }
            
            // Store analysis result in sessionStorage to pass to result page
            sessionStorage.setItem('resumeAnalysisResult', JSON.stringify(analysisResult));
            sessionStorage.setItem('resumeData', JSON.stringify(parsedData));
            
            // Navigate to resume result page
            navigate('/resume-result');
          } catch (err) {
            console.error('Analysis error:', err);
            setError(err.message || 'Failed to analyze resume. Please try again.');
            setLoading(false);
          }
        },
        (err) => {
          setError(err || 'Failed to parse resume file. Please ensure it is a valid PDF, DOCX, or TXT file.');
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload resume. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="resume-analysis-page">
      <div className="page-navigation">
        <button className="nav-btn" onClick={() => navigate('/')} title="Home">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Home
        </button>
      </div>
      <div className="resume-analysis-container">
        <div className="resume-analysis-card">
          <h1 className="resume-analysis-title">RESUME ANALYSIS</h1>
          <div className="resume-upload-card">
            <h2 className="upload-title">UPLOAD RESUME</h2>
            <div className="upload-area" onClick={() => document.getElementById('resume-file').click()}>
              <div className="upload-icon">
                <svg width="48" height="48" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div style={{ marginTop: '1rem', width: '100%' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#333', fontSize: '0.85rem' }}>
                Job Description (Optional):
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here to get a more targeted ATS score..."
                style={{
                  width: '100%',
                  minHeight: '90px',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  background: '#fafafa',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--brown)';
                  e.target.style.background = '#fff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(141, 103, 72, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#ddd';
                  e.target.style.background = '#fafafa';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            {error && <div className="upload-error" style={{ marginTop: '0.75rem' }}>{error}</div>}
            <button 
              className="upload-btn" 
              onClick={handleUpload} 
              disabled={!resume || loading}
              style={{ marginTop: '1rem' }}
            >
              {loading ? 'ANALYZING...' : 'UPLOAD & ANALYZE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
