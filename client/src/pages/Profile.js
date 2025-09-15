import React from 'react';

export default function Profile() {
  return (
    <div className="section">
      <h2>Profile</h2>
      <div className="profile">
        <div className="card">
          <b>Personal Info</b>
          <input className="input" placeholder="Name" />
          <input className="input" placeholder="Email" type="email" style={{marginTop:8}} />
          <input className="input" placeholder="Career Goal" style={{marginTop:8}} />
          <div className="cta" style={{marginTop:12}}><a className="btn primary" href="/">Save</a></div>
        </div>
        <div className="card">
          <b>Resume & Saved Progress</b>
          <div className="upload" style={{marginTop:8}}><input className="input" type="file" accept=".pdf,.doc,.docx" /></div>
          <div className="grid" style={{marginTop:12}}>
            <div className="card"><div className="small">Saved Resource</div><div>SQL Joins in 30 Minutes</div></div>
            <div className="card"><div className="small">Saved Resource</div><div>Intro to Pandas</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
