import React from 'react';

export default function LearningHub() {
  return (
    <div className="section">
      <h2>Learning Hub</h2>
      <div className="filters">
        <select className="input"><option>All Types</option><option>Videos</option><option>Courses</option><option>Articles</option></select>
        <select className="input"><option>All Levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select>
        <input className="input" placeholder="Search resources" />
      </div>
      <div className="res-grid">
        <div className="res-card"><div className="thumb"></div><div className="body"><b>SQL Joins in 30 Minutes</b><div className="small">YouTube</div><p className="sub">Clear walkthrough with examples and practice.</p></div></div>
        <div className="res-card"><div className="thumb"></div><div className="body"><b>Intro to Pandas</b><div className="small">Coursera</div><p className="sub">Hands-on data wrangling with DataFrames.</p></div></div>
        <div className="res-card"><div className="thumb"></div><div className="body"><b>Data Storytelling</b><div className="small">Article</div><p className="sub">How to craft compelling insights for stakeholders.</p></div></div>
      </div>
    </div>
  );
}
