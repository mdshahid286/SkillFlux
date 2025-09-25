import React from 'react';
import { useNavigate } from 'react-router-dom';

// Simple Pie Chart SVG component
function PieChart({ score, size = 120, stroke = 18 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
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
        stroke="#6c63ff"
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
        fontSize="1.7rem"
        fontWeight="bold"
        fill="#6c63ff"
      >
        {score}%
      </text>
    </svg>
  );
}

export default function ResumeResult() {
  const navigate = useNavigate();
  // Example data (replace with real data as needed)
  const atsScore = 78;
  const pros = [
    'Strong technical skills (JavaScript, React, Python)',
    'Relevant work experience in web development',
    'Good use of action verbs and quantifiable results',
  ];
  const cons = [
    'Lacks certifications section',
    'Could add more project details',
    'Missing some job-specific keywords',
  ];

  return (
    <div className="resume-analysis-page">
      <div className="resume-analysis-container">
        <div className="resume-analysis-card">
          <h1 className="resume-analysis-title">RESUME ANALYSIS RESULTS</h1>
          {/* ATS Score Pie Chart */}
          <div style={{ margin: '2rem 0 1.5rem 0', textAlign: 'center' }}>
            <h2 style={{ marginBottom: 8, fontWeight: 600, color: '#6c63ff' }}>ATS Score</h2>
            <PieChart score={atsScore} />
            <div style={{ color: '#888', marginTop: 8, fontSize: '1rem' }}>
              This score reflects how well your resume matches the job description for ATS systems.
            </div>
          </div>
          <div className="resume-result-card">
            <h2 className="result-title">Analysis Complete!</h2>
            <div className="result-content">
              <p>Your resume has been successfully analyzed. Here are the key findings:</p>
              <div className="analysis-section">
                <h3>Skills Detected</h3>
                <div className="skills-list">
                  <span className="skill-tag">JavaScript</span>
                  <span className="skill-tag">React</span>
                  <span className="skill-tag">Node.js</span>
                  <span className="skill-tag">Python</span>
                  <span className="skill-tag">SQL</span>
                </div>
              </div>
              <div className="analysis-section">
                <h3>Experience Level</h3>
                <p className="experience-level">Entry-Level Developer (0-1 years)</p>
              </div>
              <div className="analysis-section">
                <h3>Recommendations</h3>
                <ul className="recommendations">
                  <li>Consider adding more specific project examples</li>
                  <li>Include quantifiable achievements</li>
                  <li>Add relevant certifications</li>
                </ul>
              </div>
              {/* Pros and Cons Section */}
              <div className="analysis-section">
                <h3>Pros</h3>
                <ul style={{ color: '#2e7d32', fontWeight: 500 }}>
                  {pros.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
                <h3 style={{ marginTop: 18 }}>Cons</h3>
                <ul style={{ color: '#c62828', fontWeight: 500 }}>
                  {cons.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
              </div>
              <div className="action-buttons">
                <button 
                  className="upload-btn" 
                  onClick={() => navigate('/roadmap')}
                >
                  VIEW ROADMAP
                </button>
                <button 
                  className="upload-btn secondary" 
                  onClick={() => navigate('/resume')}
                >
                  ANALYZE ANOTHER
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
