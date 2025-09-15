import React, { useEffect, useState } from 'react';

// TODO: Replace with real user authentication
const uid = 'testuser1';

export default function Roadmap() {
  const [roadmap, setRoadmap] = useState(null);
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const roadmapRes = await fetch('http://localhost:5000/api/generate-roadmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid })
        });
        const roadmapData = await roadmapRes.json();
        if (!roadmapRes.ok) throw new Error(roadmapData.error || 'Failed to fetch roadmap');
        setRoadmap(roadmapData.roadmap);
        const resourcesRes = await fetch(`http://localhost:5000/api/resources/${uid}`);
        const resourcesData = await resourcesRes.json();
        if (!resourcesRes.ok) throw new Error(resourcesData.error || 'Failed to fetch resources');
        setResources(resourcesData.resources);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const toggleWeek = (weekIndex) => {
    setExpanded(prev => ({ ...prev, [weekIndex]: !prev[weekIndex] }));
  };

  if (loading) {
    return (
      <div className="section roadmap-container">
        <h2>AI Learning Plan</h2>
        <div className="card roadmap-hero glow-border glass" style={{margin:'24px auto'}}>
          <div className="skeleton" style={{height:18,width:'40%',margin:'16px 0',background:'#eef1f6',borderRadius:8}}></div>
          <div className="skeleton" style={{height:12,width:'100%',margin:'8px 0',background:'#eef1f6',borderRadius:8}}></div>
          <div className="skeleton" style={{height:12,width:'95%',margin:'8px 0',background:'#eef1f6',borderRadius:8}}></div>
          <div className="skeleton" style={{height:12,width:'90%',margin:'8px 0',background:'#eef1f6',borderRadius:8}}></div>
        </div>
      </div>
    );
  }
  if (error) return <div className="section roadmap-container"><h2>AI Learning Plan</h2><div style={{color:'red'}}>{error}</div></div>;
  if (!roadmap) return <div className="section roadmap-container"><h2>AI Learning Plan</h2><div>No roadmap found.</div></div>;

  const weeks = Array.isArray(roadmap) ? roadmap : (roadmap.week ? Object.values(roadmap.week) : []);

  return (
    <div className="section roadmap-container">
      <h2>AI Learning Plan</h2>

      <div className="card roadmap-hero glow-border glass" style={{margin:'16px auto'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
          <div style={{fontWeight:700}}>Your personalized 6‑week roadmap</div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <span className="chip" style={{background:'#ecfdf5',color:'#059669'}}>Adaptive</span>
            <span className="chip" style={{background:'#eff6ff',color:'#2563eb'}}>{weeks.length} Weeks</span>
          </div>
        </div>
        <div className="note" style={{marginTop:8}}>Click a week to expand topics and resources.</div>
      </div>

      <div className="grid" style={{display:'grid',gridTemplateColumns:'1fr',gap:16,margin:'0 auto'}}>
        {weeks.map((week, i) => {
          const isOpen = !!expanded[i];
          const topics = Array.isArray(week.topics) ? week.topics : [];
          return (
            <div className="week-card" key={i}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}} onClick={() => toggleWeek(i)}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div className="week-pill">W{week.week || i+1}</div>
                  <div>
                    <div style={{fontWeight:800}}>Week {week.week || i+1}</div>
                    <div className="sub" style={{fontSize:12,opacity:0.8}}>{topics.length} topics</div>
                  </div>
                </div>
                <button className="week-toggle">{isOpen ? 'Hide' : 'Show'}</button>
              </div>

              <div className={`reveal ${isOpen ? 'open' : ''}`}>
                <div style={{marginTop:12}}>
                  {topics.length === 0 && <div className="note">No topics defined for this week.</div>}

                  {topics.length > 0 && (
                    <div>
                      <div style={{fontWeight:700,margin:'6px 0'}}>Topics</div>
                      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                        {topics.map((t, idx) => (
                          <span key={idx} className="topic-chip">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{marginTop:12}}>
                    <div style={{fontWeight:700,margin:'6px 0'}}>Recommended Resources</div>
                    {topics.map((t, idx) => {
                      const res = resources?.[t];
                      return (
                        <div key={idx} className="resource-card">
                          <div style={{fontWeight:600,marginBottom:6}}>{t}</div>
                          {!res && <div className="note">Fetching suggestions...</div>}
                          {res && (
                            <div className="res-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                              <div>
                                <div className="small" style={{fontWeight:600,marginBottom:6}}>YouTube</div>
                                {(res.ytVideos || []).map((v, k) => (
                                  <a key={k} href={v.url} target="_blank" rel="noopener noreferrer" className="yt-item">
                                    <img alt="thumb" src={v.thumbnail || 'https://i.ytimg.com/img/no_thumbnail.jpg'} className="yt-thumb" />
                                    <span className="sub" style={{lineHeight:1.2}}>{v.title}</span>
                                  </a>
                                ))}
                              </div>
                              <div>
                                <div className="small" style={{fontWeight:600,marginBottom:6}}>Courses & Projects</div>
                                {(res.courses || []).map((c, k) => (
                                  <div key={k} style={{margin:'4px 0'}}>
                                    <a href={c.url} target="_blank" rel="noopener noreferrer">{c.name}</a>
                                    <span className="sub" style={{marginLeft:6,opacity:0.7}}>({c.difficulty}, {c.rating}★)</span>
                                  </div>
                                ))}
                                {(res.github || []).map((g, k) => (
                                  <div key={k} style={{margin:'4px 0'}}>
                                    <a href={g.url} target="_blank" rel="noopener noreferrer">{g.name}</a>
                                    <span className="sub" style={{marginLeft:6,opacity:0.7}}>[{g.label}]</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
