import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Simple Pie Chart SVG component
function PieChart({ score, size = 100, stroke = 12 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  
  // Determine color based on score
  let strokeColor = '#6c63ff'; // Default purple
  if (score >= 80) strokeColor = '#4caf50'; // Green for excellent
  else if (score >= 60) strokeColor = '#ff9800'; // Orange for good
  else strokeColor = '#f44336'; // Red for needs improvement
  
  return (
    <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#eee"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s' }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize="1.4rem"
        fontWeight="bold"
        fill={strokeColor}
      >
        {score}%
      </text>
    </svg>
  );
}

export default function ResumeResult() {
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve analysis result from sessionStorage
    const storedAnalysis = sessionStorage.getItem('resumeAnalysisResult');
    const storedResumeData = sessionStorage.getItem('resumeData');
    
    if (storedAnalysis) {
      try {
        setAnalysisData(JSON.parse(storedAnalysis));
        if (storedResumeData) {
          setResumeData(JSON.parse(storedResumeData));
        }
      } catch (error) {
        console.error('Error parsing stored data:', error);
      }
    }
    setLoading(false);
  }, []);

  // Use default/example data if no analysis data is available
  const atsScore = analysisData?.atsScore || 0;
  const pros = analysisData?.pros || [
    'No analysis data available. Please analyze a resume first.',
  ];
  const cons = analysisData?.cons || [];
  const recommendations = analysisData?.recommendations || [];
  const skills = analysisData?.skills || resumeData?.skills || [];
  const analysis = analysisData?.analysis || {};

  if (loading) {
    return (
      <div className="resume-analysis-page">
        <div className="resume-analysis-container">
          <div className="resume-analysis-card">
            <h1 className="resume-analysis-title">Loading Analysis...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="resume-analysis-page">
        <div className="resume-analysis-container">
          <div className="resume-analysis-card">
            <h1 className="resume-analysis-title">No Analysis Data</h1>
            <p style={{ textAlign: 'center', marginTop: '2rem' }}>
              Please analyze a resume first.
            </p>
            <button 
              className="upload-btn" 
              onClick={() => navigate('/resume')}
              style={{ marginTop: '2rem' }}
            >
              GO TO ANALYSIS
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        <button className="nav-btn" onClick={() => navigate('/resume')} title="Back to Analysis">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
      </div>
      <div className="resume-analysis-container">
        <div className="resume-analysis-card">
          <h1 className="resume-analysis-title">RESUME ANALYSIS RESULTS</h1>
          {/* ATS Score Pie Chart */}
          <div style={{ margin: '1rem 0 0.75rem 0', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '0.4rem', fontWeight: 700, color: 'var(--brown)', fontSize: '0.95rem', letterSpacing: '0.02em' }}>ATS Score</h2>
            <PieChart score={atsScore} />
            <div style={{ color: '#666', marginTop: '0.4rem', fontSize: '0.8rem', lineHeight: '1.4' }}>
              How well your resume matches ATS systems
            </div>
          </div>
          <div className="resume-result-card">
            <h2 className="result-title">Analysis Summary</h2>
            <div className="result-content">
              {analysis.summary && (
                <div className="analysis-section">
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#555', margin: 0 }}>
                    {analysis.summary}
                  </p>
                </div>
              )}
              
              {skills.length > 0 && (
                <div className="analysis-section">
                  <h3>Skills Detected</h3>
                  <div className="skills-list">
                    {skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {analysis.keywordMatch && (
                <div className="analysis-section">
                  <h3>Analysis Details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.9rem' }}>
                      <strong style={{ color: '#333' }}>Keyword Match:</strong> <span style={{ color: '#666' }}>{analysis.keywordMatch}</span>
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>
                      <strong style={{ color: '#333' }}>Formatting:</strong> <span style={{ color: '#666' }}>{analysis.formatting}</span>
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>
                      <strong style={{ color: '#333' }}>Content Quality:</strong> <span style={{ color: '#666' }}>{analysis.contentQuality}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {recommendations.length > 0 && (
                <div className="analysis-section">
                  <h3>Recommendations</h3>
                  <ul className="recommendations">
                    {recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Pros and Cons Section */}
              <div className="analysis-section">
                <h3>Strengths</h3>
                <ul style={{ color: '#2e7d32', fontWeight: 500, fontSize: '0.9rem', lineHeight: '1.6', margin: 0, paddingLeft: '1.25rem' }}>
                  {pros.map((item, idx) => <li key={idx} style={{ marginBottom: '0.4rem' }}>{item}</li>)}
                </ul>
                {cons.length > 0 && (
                  <>
                    <h3 style={{ marginTop: '1.25rem', marginBottom: '0.75rem' }}>Areas for Improvement</h3>
                    <ul style={{ color: '#c62828', fontWeight: 500, fontSize: '0.9rem', lineHeight: '1.6', margin: 0, paddingLeft: '1.25rem' }}>
                      {cons.map((item, idx) => <li key={idx} style={{ marginBottom: '0.4rem' }}>{item}</li>)}
                    </ul>
                  </>
                )}
              </div>
              
              <div className="action-buttons">
                <button 
                  className="upload-btn secondary" 
                  onClick={() => navigate('/resume')}
                  style={{ flex: '0 0 auto' }}
                >
                  ANALYZE ANOTHER
                </button>
                <button 
                  className="upload-btn" 
                  onClick={() => navigate('/roadmap')}
                  style={{ flex: '0 0 auto' }}
                >
                  VIEW ROADMAP
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
