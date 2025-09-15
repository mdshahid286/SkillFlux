import React from 'react';

export default function ResumeAnalysis() {
  return (
    <div className="section">
      <h2>Resume Analysis</h2>
      <div className="card" style={{margin:'24px auto',maxWidth:600}}>
        <h3>Tell Us About Your Goals</h3>
        <p className="sub">What roles are you aiming for? What skills do you already have? What are your biggest challenges?</p>
        <textarea className="input" rows={6} placeholder="Write anything you'd like us to consider..." style={{width:'100%'}} />
        <div className="note">This helps us tailor your roadmap even before analyzing your resume.</div>
      </div>
      <div className="card" style={{margin:'24px auto',maxWidth:600}}>
        <h3>Upload Resume</h3>
        <input className="input" type="file" accept=".pdf,.doc,.docx" />
        <p className="note">Drag & drop or browse</p>
      </div>
    </div>
  );
}
