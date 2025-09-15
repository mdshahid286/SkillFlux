import React from 'react';

export default function Progress() {
  return (
    <div className="section">
      <h2>Progress Dashboard</h2>
      <div className="progress-bars">
        <div className="card"><div>SQL</div><div className="bar"><div className="fill" style={{width:'70%'}}></div></div></div>
        <div className="card"><div>Python</div><div className="bar"><div className="fill" style={{width:'45%'}}></div></div></div>
        <div className="card"><div>Data Viz</div><div className="bar"><div className="fill" style={{width:'25%'}}></div></div></div>
      </div>
      <div className="grid" style={{marginTop:16}}>
        <div className="card center">
          <div className="small">Roadmap Completion</div>
          <div className="gauge"><div className="inner"><div style={{fontWeight:800,fontSize:26}}>62%</div></div></div>
        </div>
        <div className="card">
          <b>Certificates</b>
          <div className="cert-grid" style={{marginTop:8}}>
            <div className="cert"><div className="small">SQL Level 1</div><a className="btn" href="#">Download</a></div>
            <div className="cert"><div className="small">Python Basics</div><a className="btn" href="#">Download</a></div>
            <div className="cert"><div className="small">Data Viz</div><a className="btn" href="#">Download</a></div>
          </div>
        </div>
        <div className="card">
          <b>Achievements</b>
          <div className="achievements" style={{marginTop:8}}>
            <div className="badge-tile">🔥 7‑day streak</div>
            <div className="badge-tile">🏁 Week 1 complete</div>
            <div className="badge-tile">📈 SQL 70%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
