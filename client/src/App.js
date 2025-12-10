import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth as firebaseAuth, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ResumeAnalysis from './pages/ResumeAnalysis';
import ResumeResult from './pages/ResumeResult';
import ResumeBuilderNew from './pages/ResumeBuilderNew';
import TechNews from './pages/TechNews';
import Roadmap from './pages/Roadmap';
// Removed LearningHub and Progress pages
// Profile page removed; using in-nav modal instead
import Aptitude from './pages/Aptitude';
import StorySection from './components/StorySection';
import SectionTransition from './components/SectionTransition';
import './components/StorySection.css';
import './components/SectionTransition.css';
// (Assume AnimatedOutroCTA will be created next and imported here)
// ... existing code ...
import AnimatedOutroCTA from './components/AnimatedOutroCTA';
import './components/AnimatedOutroCTA.css';
import StoryBasedQuickActions from './components/StoryBasedQuickActions';
import './components/StoryBasedQuickActions.css';

function Navbar({ onSeeHowItWorks, onNav, user }) {
  const [showProfileModal, setShowProfileModal] = React.useState(false);
  const [profile, setProfile] = React.useState(null);
  const [editing, setEditing] = React.useState({});
  const [draft, setDraft] = React.useState({});
  const auth = getAuth();

  React.useEffect(() => {
    let abort = false;
    const fetchProfile = async () => {
      if (!user?.uid) return;
      try {
        const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
        const res = await fetch(`${baseUrl}/api/user/${user.uid}/plan`);
        const data = await res.json();
        if (!abort && res.ok) setProfile(data.profile || {});
      } catch {}
    };
    fetchProfile();
    return () => { abort = true; };
  }, [user]);

  const logout = async () => {
    try { await auth.signOut(); } catch {}
    window.location.href = '/login';
  };

  return (
    <nav className="navbar" style={{ paddingRight: '1.6rem', paddingLeft: '1rem' }}>
      <div className="navbar-logo">SkillFlux</div>
      <div className="navbar-links" style={{ marginLeft: 'auto', display: 'flex', flex: 1, justifyContent: 'flex-end', gap: '1.2rem', alignItems: 'center', paddingRight: '1rem' }}>
        {user ? (
          <>
            <a href="/" onClick={e => {e.preventDefault(); onNav('/');}}>Home</a>
            <a href="/resume-builder" onClick={e => {e.preventDefault(); onNav('/resume-builder');}}>Resume Builder</a>
            <a href="/resume" onClick={e => {e.preventDefault(); onNav('/resume');}}>Resume Analysis</a>
            <a href="/roadmap" onClick={e => {e.preventDefault(); onNav('/roadmap');}}>Roadmap</a>
            <a href="/news" onClick={e => {e.preventDefault(); onNav('/news');}}>Tech News</a>
            {/* Learning Hub and Progress removed */}

            <button
              aria-label="Profile"
              onClick={() => setShowProfileModal(true)}
              style={{
                border: 'none', background: 'transparent', cursor: 'pointer',
                display: 'grid', placeItems: 'center', padding: 6, marginRight: '0.5rem'
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="11" fill="#f5f5f3" stroke="#8d6748" strokeWidth="2"/>
                <circle cx="12" cy="9" r="3" fill="#8d6748"/>
                <path d="M5 19c1.8-3 5-4 7-4s5.2 1 7 4" stroke="#8d6748" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        ) : (
          <a href="/login" className="navbar-cta" onClick={e => {e.preventDefault(); onNav('/login');}}>Login</a>
        )}
        {/* Centered Profile Modal */}
        {showProfileModal && (
          <div onClick={() => setShowProfileModal(false)} style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(3px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'2.5rem'}}>
            <div onClick={e=>e.stopPropagation()} className="futuristic-card" style={{
              width:'min(980px,96vw)', maxHeight:'85vh', overflowY:'auto', background:'#fff', border:'1px solid #e0e3ea', borderRadius:'1.6rem', boxShadow:'0 28px 84px rgba(0,0,0,0.35)', margin:'auto', position:'relative'
            }}>
              <button aria-label="Close" onClick={()=>setShowProfileModal(false)} style={{position:'absolute', right:12, top:12, width:36, height:36, borderRadius:'50%', border:'1px solid #e0e3ea', background:'#fff', color:'#666', cursor:'pointer', boxShadow:'0 8px 18px rgba(0,0,0,0.12)', zIndex:2, display:'grid', placeItems:'center'}}>✕</button>
              <div style={{position:'sticky', top:0, zIndex:1, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.2rem', borderBottom:'1px solid #e0e3ea', background:'linear-gradient(120deg,#f5f5f3 60%,#e6ded7 100%)'}}>
                <div style={{display:'flex', alignItems:'center', gap:'0.8rem'}}>
                  <div style={{width:44,height:44,borderRadius:'50%',background:'#8d6748',display:'grid',placeItems:'center',color:'#fff',fontWeight:800}}>{(profile?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()}</div>
                  <div>
                    <div style={{fontWeight:800, color:'var(--brown)'}}>{profile?.name || user?.email || 'User'}</div>
                    <div style={{fontSize:12, color:'#666'}}>{profile?.role || '—'}{profile?.targetRole ? ` → ${profile.targetRole}` : ''}</div>
                  </div>
                </div>
                <div />
              </div>
              <div style={{padding:'1.2rem 1.4rem', display:'grid', gap:'1rem', background:'linear-gradient(180deg,#ffffff 0%, #fafafa 100%)'}}>
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'1rem'}}>
                  <div style={{background:'#fff', border:'1px solid #e0e3ea', borderRadius:'1rem', padding:'0.9rem 1rem'}}>
                    <div style={{fontSize:12, color:'#8d6748', fontWeight:800, letterSpacing:0.5, marginBottom:6}}>Account</div>
                    <div style={{fontSize:14, color:'#555'}}>Email: <b>{user?.email || profile?.email || '—'}</b></div>
                    <div style={{fontSize:14, color:'#555'}}>Updated: <b>{profile?.updatedAt ? new Date(profile.updatedAt).toLocaleString() : '—'}</b></div>
                  </div>
                  <div style={{background:'#fff', border:'1px solid #e0e3ea', borderRadius:'1rem', padding:'0.9rem 1rem'}}>
                    <div style={{fontSize:12, color:'#8d6748', fontWeight:800, letterSpacing:0.5, marginBottom:6}}>Status</div>
                    <div style={{fontSize:14, color:'#555'}}>Role: <b>{profile?.role || '—'}</b></div>
                    <div style={{fontSize:14, color:'#555'}}>Target: <b>{profile?.targetRole || '—'}</b></div>
                  </div>
                </div>
                {[
                  { key: 'name', label: 'Name' },
                  { key: 'email', label: 'Email' },
                  { key: 'education', label: 'Education' },
                  { key: 'role', label: 'Role' },
                  { key: 'targetRole', label: 'Target Role' },
                  { key: 'goals', label: 'Goals' },
                  { key: 'skills', label: 'Skills (comma separated)', isSkills: true }
                ].map(field => (
                  <div key={field.key} style={{display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', border:'1px solid #e0e3ea', borderRadius:'0.9rem', padding:'1rem 1.1rem', boxShadow:'0 2px 10px rgba(0,0,0,0.03)'}}>
                    <div style={{flex:1, marginRight:'1rem'}}>
                      <div style={{fontSize:12, color:'#666', marginBottom:4}}>{field.label}</div>
                      {!editing[field.key] && (
                        <div style={{color:'#333', fontWeight:600}}>{field.key==='skills' ? ((profile?.skills || []).join(', ') || '—') : (profile?.[field.key] || '—')}</div>
                      )}
                      {editing[field.key] && (
                        <input className="input" style={{width:'100%'}} value={draft[field.key] ?? (field.key==='skills' ? (profile?.skills || []).join(', ') : (profile?.[field.key] || ''))} onChange={e=>setDraft(prev=>({...prev,[field.key]:e.target.value}))} />
                      )}
                    </div>
                    {!editing[field.key] && (
                      <button aria-label={`Edit ${field.label}`} onClick={()=>{ setEditing(prev=>({...prev,[field.key]:true})); setDraft(prev=>({...prev,[field.key]: profile?.[field.key] || (field.key==='skills' ? (profile?.skills || []).join(', ') : '')})); }} style={{background:'transparent', border:'none', cursor:'pointer', color:'var(--brown)'}}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 20h9" stroke="#8d6748" strokeWidth="2" strokeLinecap="round"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" stroke="#8d6748" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    )}
                    {editing[field.key] && (
                      <div style={{display:'flex', gap:'0.5rem'}}>
                        <button onClick={async()=>{
                          const body = { uid: user?.uid };
                          const value = draft[field.key];
                          if (field.key==='skills') body.skills = String(value||'').split(',').map(s=>s.trim()).filter(Boolean); else body[field.key]=value||'';
                          try{
                            const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
                            const res = await fetch(`${baseUrl}/api/onboarding`,{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
                            const dat = await res.json(); if(!res.ok) throw new Error(dat.error||'Save failed');
                            const r = await fetch(`${baseUrl}/api/user/${user?.uid}/plan`); const d = await r.json(); if(r.ok) setProfile(d.profile||{});
                            setEditing(prev=>({...prev,[field.key]:false}));
                          }catch(e){ console.warn('save error', e.message); }
                        }} style={{background:'var(--brown)', color:'#fff', border:'none', padding:'0.55rem 0.9rem', borderRadius:'0.6rem', fontWeight:700, cursor:'pointer', boxShadow:'0 6px 16px rgba(141,103,72,0.35)'}}>Save</button>
                        <button onClick={()=>setEditing(prev=>({...prev,[field.key]:false}))} style={{background:'#f3f4f6', color:'#8d6748', border:'1px solid #e0e3ea', padding:'0.55rem 0.9rem', borderRadius:'0.6rem', fontWeight:700, cursor:'pointer'}}>Cancel</button>
                      </div>
                    )}
                  </div>
                ))}
                <div style={{display:'flex', justifyContent:'flex-end', marginTop:'0.4rem'}}>
                  <button onClick={logout} style={{background:'linear-gradient(90deg,#ef4444,#dc2626)', color:'#fff', border:'none', padding:'0.8rem 1.1rem', borderRadius:'0.9rem', fontWeight:800, cursor:'pointer', boxShadow:'0 8px 20px rgba(220,38,38,0.35)'}}>Logout</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function HeroSection({ onSeeHowItWorks, onNav, user }) {
  return (
    <section className="hero-section animated-gradient-bg">
      <div className="hero-left futuristic-fade-in">
        <h1>Everything You Need to Accelerate Your Career</h1>
        <p className="hero-subtitle">From intelligent resume analysis to personalized pathways, we guide you end-to-end.</p>
        <div className="hero-cta-row">
          <button className="neon-btn ripple" onClick={() => onNav(user ? '/onboarding' : '/login')}>Get Started</button>
        </div>
        <div className="trust-row">
          <span className="trust-logo-placeholder" style={{background: 'var(--beige)'}} />
          <span className="trust-logo-placeholder" style={{background: 'var(--grey)'}} />
          <span className="trust-logo-placeholder" style={{background: 'var(--brown)'}} />
          <span className="trust-logo-placeholder" style={{background: 'var(--accent)'}} />
        </div>
      </div>
      <div className="hero-right futuristic-fade-in hero-network-wrap">
        <div className="hero-visual-bg">
          {/* Particle Network Visualization */}
          <svg className="particle-network" width="400" height="400" viewBox="0 0 400 400">
            <defs>
              <linearGradient id="particleGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8d6748" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#bfae9e" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="particleGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#bfae9e" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#e6ded7" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8d6748" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#bfae9e" stopOpacity="0.7" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Connection lines */}
            <g className="connections">
              <line x1="80" y1="120" x2="200" y2="100" className="connection-line" />
              <line x1="320" y1="120" x2="200" y2="100" className="connection-line" />
              <line x1="200" y1="100" x2="200" y2="200" className="connection-line" />
              <line x1="200" y1="200" x2="120" y2="280" className="connection-line" />
              <line x1="200" y1="200" x2="280" y2="280" className="connection-line" />
              <line x1="120" y1="280" x2="80" y2="320" className="connection-line" />
              <line x1="280" y1="280" x2="320" y2="320" className="connection-line" />
              <line x1="200" y1="100" x2="150" y2="180" className="connection-line" />
              <line x1="200" y1="100" x2="250" y2="180" className="connection-line" />
            </g>
            
            {/* Particles/Nodes */}
            <g className="particles">
              <circle cx="80" cy="120" r="16" className="particle-node node-1" />
              <circle cx="200" cy="100" r="20" className="particle-node node-center" fill="url(#centerGradient)" />
              <circle cx="320" cy="120" r="16" className="particle-node node-2" />
              <circle cx="200" cy="200" r="18" className="particle-node node-3" />
              <circle cx="120" cy="280" r="15" className="particle-node node-4" />
              <circle cx="280" cy="280" r="15" className="particle-node node-5" />
              <circle cx="80" cy="320" r="14" className="particle-node node-6" />
              <circle cx="320" cy="320" r="14" className="particle-node node-7" />
              <circle cx="150" cy="180" r="14" className="particle-node node-8" />
              <circle cx="250" cy="180" r="14" className="particle-node node-9" />
            </g>
            
            {/* Animated pulse rings */}
            <circle cx="200" cy="200" r="80" className="pulse-ring ring-1" />
            <circle cx="200" cy="200" r="80" className="pulse-ring ring-2" />
          </svg>
          
          {/* Floating feature icons */}
          <div className="hero-feature-icons-network">
            <div className="feature-icon-network" style={{ top: '15%', left: '10%' }}>
              <span className="icon-emoji">🧩</span>
            </div>
            <div className="feature-icon-network" style={{ top: '15%', right: '10%' }}>
              <span className="icon-emoji">🧠</span>
            </div>
            <div className="feature-icon-network" style={{ bottom: '20%', left: '10%' }}>
              <span className="icon-emoji">🗺️</span>
            </div>
            <div className="feature-icon-network" style={{ bottom: '20%', right: '10%' }}>
              <span className="icon-emoji">📰</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="hiw" id="how-it-works">
      <h2 className="hiw-title">HOW IT WORKS</h2>
      <div className="hiw-grid">
        <div className="hiw-card">
          <div className="hiw-num">1</div>
          <div className="hiw-card-title">Onboard with your background</div>
          <div className="hiw-card-desc">Education, role, skills, goals, plus optional resume</div>
        </div>
        <div className="hiw-card">
          <div className="hiw-num">2</div>
          <div className="hiw-card-title">AI generates your plan</div>
          <div className="hiw-card-desc">Gemini builds roadmap + analysis + curated resources</div>
        </div>
        <div className="hiw-card">
          <div className="hiw-num">3</div>
          <div className="hiw-card-title">Learn, track, and iterate</div>
          <div className="hiw-card-desc">Follow weekly modules, watch videos, update profile inline</div>
        </div>
      </div>
    </section>
  );
}

function AboutUs() {
  const timelineItems = [
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
          <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: 'OUR MISSION',
      description: 'To democratize career growth by providing AI-powered, personalized learning pathways that help individuals unlock their full potential and achieve their professional dreams.'
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: 'OUR VISION',
      description: 'A world where every professional has access to intelligent career guidance, making skill development accessible, personalized, and achievable for everyone, regardless of their starting point.'
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: 'WHAT WE DO',
      description: 'We combine cutting-edge AI technology with expert career insights to create personalized learning roadmaps, analyze resumes, and provide the tools you need to advance your career.'
    }
  ];

  return (
    <section className="about-us" style={{ padding: '3.5rem 1rem 4rem', background: '#fff', position: 'relative' }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .about-card {
          background: linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
          border: 1px solid rgba(141, 103, 72, 0.12);
          border-radius: 1.2rem;
          padding: 1.35rem 1.25rem;
          box-shadow: 0 14px 36px rgba(0,0,0,0.06);
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          animation: fadeInUp 0.7s ease-out both;
        }
        .about-card + .about-card { margin-top: 1rem; }
        .about-card-icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: linear-gradient(135deg, var(--brown), #bfae9e);
          display: grid; place-items: center;
          box-shadow: 0 10px 22px rgba(141,103,72,0.25);
          flex-shrink: 0;
        }
        .about-card-title {
          color: #7a623f;
          font-size: 0.9rem;
          letter-spacing: 0.14em;
          font-weight: 800;
          margin-bottom: 0.35rem;
        }
        .about-card-desc {
          color: #4a3a29;
          font-size: 1.02rem;
          line-height: 1.55;
        }
        @media (max-width: 640px) {
          .about-us {
            padding: 2.5rem 0.8rem 3rem !important;
          }
          .about-card {
            padding: 1.05rem 1rem;
            border-radius: 1rem;
          }
          .about-card-icon {
            width: 46px; height: 46px; border-radius: 12px;
          }
          .about-card-title {
            font-size: 0.82rem;
            letter-spacing: 0.12em;
            margin-bottom: 0.3rem;
          }
          .about-card-desc {
            font-size: 0.98rem;
            line-height: 1.5;
          }
          .about-us h2 {
            font-size: 1.6rem !important;
            margin-bottom: 1.4rem !important;
          }
        }
      `}</style>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '2rem', 
          color: 'var(--brown)', 
          fontSize: '2rem', 
          letterSpacing: '0.08em',
          animation: 'fadeInUp 0.7s ease-out'
        }}>ABOUT US</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {timelineItems.map((item, index) => (
            <div className="about-card" key={item.title} style={{ animationDelay: `${index * 0.07}s` }}>
              <div className="about-card-icon">{item.icon}</div>
              <div style={{ flex: 1 }}>
                <div className="about-card-title">{item.title}</div>
                <div className="about-card-desc">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureGrid() {
  const features = [
    { 
      title: 'AI-Powered Resume Builder and Analysis', 
      desc: 'Get instant ATS scoring and detailed feedback on your resume using advanced AI technology. Identify strengths, weaknesses, and actionable improvements.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="#8d6748" strokeWidth="3" fill="#f5f5f3" /><path d="M12 20h16" stroke="#8d6748" strokeWidth="3" strokeLinecap="round" /><path d="M12 14h10" stroke="#bfae9e" strokeWidth="3" strokeLinecap="round" /></svg>
      ),
      color: 'linear-gradient(135deg, #8d6748, #bfae9e)',
      iconSize: 56,
      iconShape: 'circle',
      accent: 'left'
    },
    { 
      title: 'Personalized Learning Roadmap', 
      desc: 'AI-generated 8-week plans tailored to your skills, goals, and learning style. Includes topics, projects, and curated resources from YouTube, books, and courses.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="#bfae9e" strokeWidth="3" fill="#f5f5f3" /><path d="M10 26L20 16l10 10" stroke="#8d6748" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
      ),
      color: 'linear-gradient(135deg, #bfae9e, #8d6748)',
      iconSize: 64,
      iconShape: 'square',
      accent: 'top'
    },
    { 
      title: 'Professional Resume Builder', 
      desc: 'Create ATS-friendly, professionally designed resumes with our intuitive builder. Export to PDF and customize themes to match your style.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 40 40" fill="none"><rect x="8" y="8" width="24" height="24" rx="4" fill="#f5f5f3" stroke="#bfae9e" strokeWidth="3" /><path d="M14 16h12M14 20h12M14 24h8" stroke="#8d6748" strokeWidth="2"/></svg>
      ),
      color: 'linear-gradient(135deg, #8d6748, #c7b299)',
      iconSize: 56,
      iconShape: 'circle',
      accent: 'right'
    },
    { 
      title: 'Aptitude Test Preparation', 
      desc: 'Sharpen your logical reasoning, quantitative, and verbal skills with our comprehensive aptitude test preparation system. Practice makes perfect!',
      icon: (
        <svg width="48" height="48" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="#bfae9e" strokeWidth="3" fill="#f5f5f3" /><path d="M20 12v16M12 20h16" stroke="#8d6748" strokeWidth="3" strokeLinecap="round"/></svg>
      ),
      color: 'linear-gradient(135deg, #c7b299, #8d6748)',
      iconSize: 60,
      iconShape: 'square',
      accent: 'bottom'
    },
    { 
      title: 'Real-Time Tech News', 
      desc: 'Stay ahead of the curve with curated tech industry news and trends. Get insights that matter for your career development and industry knowledge.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 40 40" fill="none"><rect x="8" y="10" width="24" height="20" rx="4" fill="#f5f5f3" stroke="#8d6748" strokeWidth="3" /><path d="M12 16h16M12 20h16M12 24h10" stroke="#8d6748" strokeWidth="2"/></svg>
      ),
      color: 'linear-gradient(135deg, #8d6748, #bfae9e)',
      iconSize: 56,
      iconShape: 'circle',
      accent: 'left'
    },
    { 
      title: 'Profile Management', 
      desc: 'Edit and manage your profile seamlessly with our beautiful inline editing interface. Track your progress and update your skills in real-time.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="#8d6748" strokeWidth="3" fill="#f5f5f3" /><path d="M24 14l2 2-10 10-3 1 1-3 10-10z" stroke="#8d6748" strokeWidth="2"/></svg>
      ),
      color: 'linear-gradient(135deg, #bfae9e, #c7b299)',
      iconSize: 64,
      iconShape: 'square',
      accent: 'top'
    },
  ];
  return (
    <section className="features animated-gradient-bg" style={{ padding: '4rem 1rem', position: 'relative' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '2rem', 
          color: 'var(--brown)', 
          fontSize: '2.2rem', 
          letterSpacing: '0.08em'
        }}>FEATURES</h2>
        <p style={{ 
          textAlign: 'center', 
          color: '#666', 
          fontSize: '1rem', 
          marginBottom: '2.5rem',
          maxWidth: 600,
          lineHeight: '1.6'
        }}>
          Everything you need to accelerate your career in one powerful platform
        </p>
        <div className="features-container" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1.5rem',
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto',
          justifyContent: 'center',
          justifyItems: 'center'
        }}>
          {features.map((f, i) => {
            const accentStyles = {
              left: { borderLeft: '3px solid var(--brown)' },
              right: { borderRight: '3px solid var(--brown)' },
              top: { borderTop: '3px solid var(--brown)' },
              bottom: { borderBottom: '3px solid var(--brown)' }
            };
            
            const iconBorderRadius = f.iconShape === 'square' ? '12px' : '50%';
            const bgVariation = i % 3 === 0 ? 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)' :
                               i % 3 === 1 ? 'linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%)' :
                               'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)';
            
            return (
              <div 
                className="feature-card enhanced" 
                key={i} 
                style={{ 
                  animationDelay: `${0.1 * i + 0.2}s`,
                  padding: '1.8rem',
                  background: bgVariation,
                  border: '1px solid rgba(141,103,72,0.15)',
                  ...accentStyles[f.accent],
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: f.iconShape === 'square' ? '16px' : '12px',
                  width: '100%',
                  maxWidth: '350px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 16px 32px rgba(141,103,72,0.2)';
                  e.currentTarget.style.borderColor = 'var(--brown)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(141,103,72,0.15)';
                }}
              >
                <div style={{ 
                  width: f.iconSize, 
                  height: f.iconSize, 
                  borderRadius: iconBorderRadius, 
                  background: f.color,
                  display: 'grid', 
                  placeItems: 'center', 
                  marginBottom: '1.2rem',
                  boxShadow: '0 6px 20px rgba(141,103,72,0.25)',
                  transform: i % 2 === 0 ? 'rotate(-2deg)' : 'rotate(2deg)',
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = i % 2 === 0 ? 'rotate(0deg) scale(1.1)' : 'rotate(0deg) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = i % 2 === 0 ? 'rotate(-2deg)' : 'rotate(2deg)';
                }}>
                  {f.icon}
          </div>
                <h3 className="feature-title" style={{ 
                  fontSize: i % 2 === 0 ? '1.2rem' : '1.15rem', 
                  marginBottom: '0.8rem', 
                  color: 'var(--brown)',
                  fontWeight: i % 2 === 0 ? 700 : 600
                }}>{f.title}</h3>
                <p className="feature-desc" style={{ 
                  color: '#666', 
                  lineHeight: '1.6', 
                  fontSize: '0.95rem' 
                }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <section className="social-proof" style={{
      padding: '3rem 1rem',
      background: 'linear-gradient(135deg, rgba(230,222,215,0.3) 0%, rgba(255,255,255,0.8) 100%)',
      textAlign: 'center',
      position: 'relative'
    }}>
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '2rem',
        background: 'rgba(255,255,255,0.6)',
        borderRadius: '1.5rem',
        border: '1px solid rgba(141,103,72,0.15)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--brown)',
          marginBottom: '1rem',
          letterSpacing: '0.03em'
        }}>✨ We're Just Getting Started!</h3>
        <p className="social-proof-text" style={{
          fontSize: '1.1rem',
          color: '#555',
          lineHeight: '1.7',
          margin: 0
        }}>
          SkillFlux is live and ready to help you grow! We're in our early days, which means 
          you'll get personalized attention and help shape the platform as we evolve together.
        </p>
        <p style={{
          fontSize: '0.95rem',
          color: '#777',
          marginTop: '1rem',
          fontStyle: 'italic'
        }}>
          Be part of our growing community • Your feedback helps us improve every day
        </p>
      </div>
    </section>
  );
}

function BigCTA({ onSeeHowItWorks, onNav, user }) {
  return (
    <section className="big-cta">
      <h2>Ready to Unlock Your Career Potential?</h2>
      <p>Get your personalized learning roadmap in minutes.</p>
      <div className="cta-btn-row">
        <button className="primary-btn" onClick={() => onNav && onNav(user ? '/onboarding' : '/login')}>Start Free</button>
        <button className="outline-btn" onClick={onSeeHowItWorks}>See How It Works</button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer" style={{
      background: 'linear-gradient(180deg, #5a3f2a 0%, #4a3420 100%)',
      color: '#fff',
      padding: '4rem 1rem 2rem',
      marginTop: '4rem',
      position: 'relative'
    }}>
      <style>{`
        .footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(230,222,215,0.3), transparent);
        }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem'
        }}>
          {/* Brand Section */}
          <div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '1rem',
              color: '#e6ded7',
              letterSpacing: '0.05em'
            }}>SkillFlux</h3>
            <p style={{
              color: '#b0b0b0',
              lineHeight: '1.7',
              marginBottom: '1.5rem',
              fontSize: '0.95rem'
            }}>
              Your AI-powered career companion. Personalized learning pathways, resume analysis, and professional development tools.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" aria-label="Facebook" style={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                background: 'rgba(230,222,215,0.1)',
                display: 'grid',
                placeItems: 'center',
                transition: 'all 0.3s',
                border: '1px solid rgba(230,222,215,0.2)',
                cursor: 'pointer',
                padding: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(230,222,215,0.2)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(230,222,215,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <svg width="20" height="20" fill="#e6ded7" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </button>
              <button type="button" aria-label="Twitter" style={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                background: 'rgba(230,222,215,0.1)',
                display: 'grid',
                placeItems: 'center',
                transition: 'all 0.3s',
                border: '1px solid rgba(230,222,215,0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(230,222,215,0.2)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(230,222,215,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <svg width="20" height="20" fill="#e6ded7" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </button>
              <button type="button" aria-label="LinkedIn" style={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                background: 'rgba(230,222,215,0.1)',
                display: 'grid',
                placeItems: 'center',
                transition: 'all 0.3s',
                border: '1px solid rgba(230,222,215,0.2)',
                cursor: 'pointer',
                padding: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(230,222,215,0.2)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(230,222,215,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <svg width="20" height="20" fill="#e6ded7" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
              color: '#e6ded7',
              letterSpacing: '0.03em'
            }}>QUICK LINKS</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { label: 'Home', path: '/' },
                { label: 'Resume Builder', path: '/resume-builder' },
                { label: 'Resume Analysis', path: '/resume' },
                { label: 'Learning Roadmap', path: '/roadmap' },
                { label: 'Tech News', path: '/news' },
                { label: 'Aptitude Tests', path: '/aptitude' }
              ].map((link, i) => (
                <li key={i} style={{ marginBottom: '0.8rem' }}>
                  <a href={link.path} style={{
                    color: '#b0b0b0',
                    textDecoration: 'none',
                    transition: 'all 0.3s',
                    fontSize: '0.95rem',
                    display: 'inline-block'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#e6ded7';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#b0b0b0';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
              color: '#e6ded7',
              letterSpacing: '0.03em'
            }}>RESOURCES</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { label: 'Help Center', path: '#' },
                { label: 'Documentation', path: '#' },
                { label: 'Blog', path: '#' },
                { label: 'Career Tips', path: '#' },
                { label: 'Success Stories', path: '#' },
                { label: 'FAQ', path: '#' }
              ].map((link, i) => (
                <li key={i} style={{ marginBottom: '0.8rem' }}>
                  <a href={link.path} style={{
                    color: '#b0b0b0',
                    textDecoration: 'none',
                    transition: 'all 0.3s',
                    fontSize: '0.95rem',
                    display: 'inline-block'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#e6ded7';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#b0b0b0';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h4 style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
              color: '#e6ded7',
              letterSpacing: '0.03em'
            }}>CONTACT</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '2rem' }}>
              <li style={{ marginBottom: '0.8rem', color: '#b0b0b0', fontSize: '0.95rem' }}>
                📧 support@skillflux.com
              </li>
              <li style={{ marginBottom: '0.8rem', color: '#b0b0b0', fontSize: '0.95rem' }}>
                📞 +1 (555) 123-4567
              </li>
            </ul>
            <div style={{ marginTop: '2rem' }}>
              <button type="button" style={{
                color: '#b0b0b0',
                textDecoration: 'none',
                fontSize: '0.9rem',
                marginRight: '1.5rem',
                transition: 'color 0.3s',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#e6ded7'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#b0b0b0'}>
                Privacy Policy
              </button>
              <button type="button" style={{
                color: '#b0b0b0',
                textDecoration: 'none',
                fontSize: '0.9rem',
                marginRight: '1.5rem',
                transition: 'color 0.3s',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#e6ded7'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#b0b0b0'}>
                Terms of Service
              </button>
              <button type="button" style={{
                color: '#b0b0b0',
                textDecoration: 'none',
                fontSize: '0.9rem',
                transition: 'color 0.3s',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#e6ded7'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#b0b0b0'}>
                Cookie Policy
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(230,222,215,0.1)',
          paddingTop: '2rem',
          marginTop: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <p style={{ color: '#b0b0b0', fontSize: '0.9rem', margin: 0 }}>
            © {new Date().getFullYear()} SkillFlux. All rights reserved.
          </p>
          <p style={{ color: '#b0b0b0', fontSize: '0.9rem', margin: 0 }}>
            Built with ❤️ for career growth
          </p>
        </div>
      </div>
    </footer>
  );
}

function OnboardingPage({ user }) {
  const [form, setForm] = useState({
    primarySkill: '',
    customSkill: '',
    learningGoal: '',
    experienceLevel: '',
    careerAspiration: '',
    learningStyle: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const skillOptions = [
    'React', 'Data Science', 'Cloud Computing', 'UI/UX Design', 'Python', 'JavaScript', 
    'Machine Learning', 'DevOps', 'Mobile Development', 'Web Development', 'Cybersecurity',
    'Blockchain', 'AI/ML', 'Full Stack Development', 'Backend Development', 'Other'
  ];

  const goalOptions = [
    'Get a new job', 'Career switch', 'Build personal projects', 'Strengthen fundamentals',
    'Get promoted', 'Start freelancing', 'Learn for fun', 'Other'
  ];

  const experienceLevels = ['Beginner', 'Intermediate', 'Advanced'];
  
  const learningStyles = [
    { value: 'video', label: 'Video-based', icon: '🎬' },
    { value: 'reading', label: 'Reading', icon: '📚' },
    { value: 'hands-on', label: 'Hands-on Projects', icon: '🛠️' },
    { value: 'mixed', label: 'Mixed', icon: '🎯' }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const uid = user?.uid || 'testuser1';
    
    // Prepare form data with custom skill handling
    const formData = { ...form };
    if (form.primarySkill === 'Other' && form.customSkill) {
      formData.primarySkill = form.customSkill;
    }
    delete formData.customSkill; // Remove the custom skill field as it's now merged
    
    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
      const res = await fetch(`${baseUrl}/api/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, uid })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save onboarding data');
      
      try {
        const gen = await fetch(`${baseUrl}/api/generate-roadmap`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid })
        });
        if (!gen.ok) {
          const g = await gen.json().catch(() => ({}));
          console.warn('generate-roadmap failed', g.error || gen.status);
        }
      } catch (err) {
        console.warn('generate-roadmap error:', err.message);
      }
      setSubmitted(true);
      setLoading(false);
      navigate('/roadmap');
    } catch (err) {
      setError('Server error: ' + err.message);
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '2rem',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          maxWidth: '500px',
          width: '100%'
        }}>
          <div style={{fontSize: '4rem', marginBottom: '1rem'}}>🚀</div>
          <h2 style={{color: '#333', marginBottom: '1rem', fontSize: '2rem'}}>Your personalized roadmap is ready!</h2>
          <p style={{color: '#666', fontSize: '1.1rem'}}>Let's start your learning journey together.</p>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="onboarding-step">
            <div className="step-icon">🎯</div>
            <h3 className="step-title">What skill would you like to learn next?</h3>
            <p className="step-subtitle">Choose your primary focus area</p>
            <div className="skill-grid">
              {skillOptions.map(skill => (
                <button
                  key={skill}
                  type="button"
                  className={`skill-option ${form.primarySkill === skill ? 'selected' : ''}`}
                  onClick={() => setForm(f => ({ ...f, primarySkill: skill, customSkill: skill === 'Other' ? f.customSkill : '' }))}
                >
                  {skill}
                </button>
              ))}
            </div>
            {form.primarySkill === 'Other' && (
              <div className="custom-skill-container">
                <input
                  type="text"
                  name="customSkill"
                  value={form.customSkill}
                  onChange={handleChange}
                  placeholder="Please specify your skill..."
                  className="custom-skill-input"
                  required
                />
              </div>
            )}
          </div>
        );
      
      case 2:
        return (
          <div className="onboarding-step">
            <div className="step-icon">💡</div>
            <h3 className="step-title">Why do you want to learn this skill?</h3>
            <p className="step-subtitle">What's driving your learning journey?</p>
            <div className="goal-grid">
              {goalOptions.map(goal => (
                <button
                  key={goal}
                  type="button"
                  className={`goal-option ${form.learningGoal === goal ? 'selected' : ''}`}
                  onClick={() => setForm(f => ({ ...f, learningGoal: goal }))}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="onboarding-step">
            <div className="step-icon">📊</div>
            <h3 className="step-title">What's your current knowledge in this skill?</h3>
            <p className="step-subtitle">Help us tailor the perfect learning path</p>
            <div className="experience-grid">
              {experienceLevels.map(level => (
                <button
                  key={level}
                  type="button"
                  className={`experience-option ${form.experienceLevel === level ? 'selected' : ''}`}
                  onClick={() => setForm(f => ({ ...f, experienceLevel: level }))}
                >
                  <div className="experience-level">{level}</div>
                  <div className="experience-desc">
                    {level === 'Beginner' && 'Just starting out'}
                    {level === 'Intermediate' && 'Some experience'}
                    {level === 'Advanced' && 'Ready for complex topics'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="onboarding-step">
            <div className="step-icon">🎯</div>
            <h3 className="step-title">What is your target role or outcome?</h3>
            <p className="step-subtitle">Where do you want to be in your career?</p>
            <div className="career-input-container">
              <input
                name="careerAspiration"
                value={form.careerAspiration}
                onChange={handleChange}
                placeholder="e.g. Frontend Developer, Data Analyst, AI Engineer..."
                className="career-input"
                required
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="onboarding-step">
            <div className="step-icon">🎨</div>
            <h3 className="step-title">How do you prefer to learn?</h3>
            <p className="step-subtitle">Choose your preferred learning style (optional)</p>
            <div className="learning-style-grid">
              {learningStyles.map(style => (
                <button
                  key={style.value}
                  type="button"
                  className={`learning-style-option ${form.learningStyle === style.value ? 'selected' : ''}`}
                  onClick={() => setForm(f => ({ ...f, learningStyle: style.value }))}
                >
                  <div className="style-icon">{style.icon}</div>
                  <div className="style-label">{style.label}</div>
                </button>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="onboarding-page">
      <div className="page-navigation">
        <button className="nav-btn" onClick={() => navigate('/')} title="Home">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Home
        </button>
      </div>
      <div className="onboarding-container">
        <div className="onboarding-header">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
          <div className="step-indicator">
            Step {currentStep} of 5
          </div>
        </div>

        <div className="onboarding-content">
          {renderStep()}
        </div>

        <div className="onboarding-actions">
          {currentStep > 1 && (
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={handlePrev}
            >
              ← Previous
            </button>
          )}
          
          {currentStep < 5 ? (
            <button 
              type="button" 
              className="btn-primary" 
              onClick={handleNext}
              disabled={
                (currentStep === 1 && (!form.primarySkill || (form.primarySkill === 'Other' && !form.customSkill))) ||
                (currentStep === 2 && !form.learningGoal) ||
                (currentStep === 3 && !form.experienceLevel) ||
                (currentStep === 4 && !form.careerAspiration)
              }
            >
              Next →
            </button>
          ) : (
            <button 
              type="button" 
              className="btn-primary" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Generating Roadmap...' : 'Get My Roadmap 🚀'}
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>

      <style>{`
        .onboarding-page {
          min-height: 100vh;
          background: var(--primary-gradient);
          background-size: 400% 400%;
          animation: gradientShift 8s ease infinite;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          padding-top: 5rem;
          position: relative;
          overflow: hidden;
        }

        .onboarding-page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          opacity: 0.3;
          animation: float 20s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        .onboarding-container {
          background: #ffffff;
          backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          padding: 2rem;
          max-width: 850px;
          width: 100%;
          box-shadow: 0 8px 32px rgba(141, 103, 72, 0.12);
          border: 1px solid rgba(141, 103, 72, 0.15);
          position: relative;
          z-index: 1;
          animation: fadeInUp 0.9s cubic-bezier(0.23, 1, 0.32, 1);
          transition: all 0.3s ease;
        }

        .onboarding-container:hover {
          box-shadow: 0 12px 40px rgba(141, 103, 72, 0.16);
          border-color: rgba(141, 103, 72, 0.2);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .onboarding-header {
          margin-bottom: 1.5rem;
        }

        .progress-bar {
          height: 6px;
          background: rgba(141, 103, 72, 0.15);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 1rem;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #6d4c2d 0%, #8d6748 100%);
          border-radius: 3px;
          transition: width 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .step-indicator {
          text-align: center;
          color: var(--brown);
          font-weight: 600;
          font-size: 0.9rem;
          letter-spacing: 0.03em;
        }

        .onboarding-step {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .step-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          animation: bounce 2s infinite;
          filter: drop-shadow(0 2px 6px rgba(141, 103, 72, 0.2));
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-12px); }
          60% { transform: translateY(-6px); }
        }

        .step-title {
          font-family: 'Orbitron', 'Segoe UI', 'Roboto', 'Arial', sans-serif;
          font-size: 1.5rem;
          color: var(--brown);
          margin-bottom: 0.5rem;
          font-weight: 700;
          letter-spacing: 0.03em;
        }

        .step-subtitle {
          color: #666;
          font-size: 0.95rem;
          margin-bottom: 1.5rem;
          font-weight: 500;
        }

        .skill-grid, .goal-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .experience-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .learning-style-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .skill-option, .goal-option, .experience-option, .learning-style-option {
          padding: 0.85rem 1rem;
          border: 2px solid rgba(141, 103, 72, 0.2);
          border-radius: 0.75rem;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 600;
          color: var(--brown);
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(141, 103, 72, 0.08);
          font-size: 0.9rem;
        }

        .skill-option::before, .goal-option::before, .experience-option::before, .learning-style-option::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: left 0.4s;
        }

        .skill-option:hover::before, .goal-option:hover::before, .experience-option:hover::before, .learning-style-option:hover::before {
          left: 100%;
        }

        .skill-option:hover, .goal-option:hover, .experience-option:hover, .learning-style-option:hover {
          border-color: rgba(141, 103, 72, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(141, 103, 72, 0.15);
          background: #fafafa;
        }

        .skill-option.selected, .goal-option.selected, .experience-option.selected, .learning-style-option.selected {
          border-color: var(--brown);
          background: linear-gradient(135deg, #6d4c2d 0%, #8d6748 100%);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(109, 76, 45, 0.3);
        }

        .experience-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1rem;
        }

        .experience-level {
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .experience-desc {
          font-size: 0.8rem;
          opacity: 0.85;
          font-weight: 500;
        }

        .experience-option.selected .experience-desc {
          opacity: 0.95;
        }

        .learning-style-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1rem;
        }

        .style-icon {
          font-size: 1.5rem;
          filter: drop-shadow(0 2px 4px rgba(141, 103, 72, 0.15));
        }

        .style-label {
          font-size: 0.85rem;
          font-weight: 600;
        }

        .career-input-container {
          margin-bottom: 1.25rem;
          width: 100%;
          max-width: 100%;
        }

        .career-input {
          width: 100%;
          max-width: 100%;
          padding: 0.85rem 1.25rem;
          border: 2px solid rgba(141, 103, 72, 0.2);
          border-radius: 0.75rem;
          font-size: 0.95rem;
          background: #ffffff;
          transition: all 0.3s ease;
          color: var(--brown);
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(141, 103, 72, 0.08);
          box-sizing: border-box;
        }

        .custom-skill-container {
          margin-top: 1.25rem;
          width: 100%;
          max-width: 100%;
        }

        .custom-skill-input {
          width: 100%;
          max-width: 100%;
          padding: 0.85rem 1.25rem;
          border: 2px solid rgba(141, 103, 72, 0.2);
          border-radius: 0.75rem;
          font-size: 0.95rem;
          background: #ffffff;
          transition: all 0.3s ease;
          color: var(--brown);
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(141, 103, 72, 0.08);
          box-sizing: border-box;
        }

        .career-input:focus, .custom-skill-input:focus {
          outline: none;
          border-color: var(--brown);
          box-shadow: 0 0 0 3px rgba(141, 103, 72, 0.12), 0 4px 12px rgba(141, 103, 72, 0.15);
          transform: translateY(-1px);
          background: #ffffff;
        }

        .career-input::placeholder, .custom-skill-input::placeholder {
          color: #a89f91;
          font-weight: 400;
        }

        .onboarding-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-top: 0.75rem;
        }

        .btn-primary, .btn-secondary {
          padding: 0.85rem 2rem;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          letter-spacing: 0.02em;
          position: relative;
          overflow: hidden;
        }

        .btn-primary {
          background: linear-gradient(90deg, #6d4c2d 0%, #8d6748 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(109, 76, 45, 0.25);
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transition: left 0.4s;
        }

        .btn-primary:hover::before {
          left: 100%;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(109, 76, 45, 0.35);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: #ffffff;
          color: var(--brown);
          border: 1px solid rgba(141, 103, 72, 0.3);
          box-shadow: 0 2px 6px rgba(141, 103, 72, 0.1);
        }

        .btn-secondary:hover {
          background: #fafafa;
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(141, 103, 72, 0.15);
          border-color: rgba(141, 103, 72, 0.4);
        }

        .error-message {
          background: linear-gradient(145deg, #fee 0%, #fdd 100%);
          color: #c33;
          padding: 1.2rem;
          border-radius: 1rem;
          margin-top: 1.5rem;
          text-align: center;
          border: 2px solid #fcc;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(204, 51, 51, 0.2);
        }

        @media (max-width: 768px) {
          .onboarding-container {
            padding: 2rem 1.5rem;
            margin: 1rem;
            max-width: 95vw;
          }
          
          .skill-grid, .goal-grid, .experience-grid, .learning-style-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .onboarding-actions {
            flex-direction: column;
            gap: 1rem;
          }
          
          .btn-primary, .btn-secondary {
            width: 100%;
            padding: 1rem 2rem;
          }

          .step-title {
            font-size: 1.6rem;
          }

          .step-icon {
            font-size: 3rem;
          }

          .career-input, .custom-skill-input {
            font-size: 1rem;
            padding: 1rem 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .onboarding-page {
            padding: 1rem;
          }
          
          .onboarding-container {
            padding: 1.5rem 1rem;
          }

          .step-title {
            font-size: 1.4rem;
          }

          .step-subtitle {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

function LoginPage({ onLogin, onNav }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // <-- add state
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setEmailValid(email.length > 3 && email.includes('@'));
    setPasswordValid(password.length > 5);
  }, [email, password]);

  const handleEmailLogin = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Optionally, use rememberMe for localStorage or auth persistence
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
      navigate('/'); // Change redirect to home page
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Google login handler (currently unused but kept for future use)
  // const handleGoogleLogin = async () => {
  //   setLoading(true);
  //   setError('');
  //   try {
  //     const provider = new GoogleAuthProvider();
  //     await signInWithPopup(auth, provider);
  //     onLogin();
  //   } catch (err) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="login-modern-split">
      <div className="login-modern-left">
        {/* Decorative SVG shapes for visual appeal */}
        <svg className="login-bg-svg" width="100%" height="100%" viewBox="0 0 600 900" fill="none" xmlns="http://www.w3.org/2000/svg" style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',zIndex:0,pointerEvents:'none'}}>
          <defs>
            <radialGradient id="bgOrb1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#e6ded7" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#bfae9e" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="bgWave1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#bfae9e" />
              <stop offset="100%" stopColor="#8d6748" />
            </linearGradient>
            <linearGradient id="bgWave2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e6ded7" />
              <stop offset="100%" stopColor="#a89f91" />
            </linearGradient>
            <linearGradient id="neonCurve" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#bfae9e" stopOpacity="0.7" />
              <stop offset="60%" stopColor="#8d6748" stopOpacity="1" />
              <stop offset="100%" stopColor="#e6ded7" stopOpacity="0.7" />
            </linearGradient>
            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Large soft orb */}
          <circle cx="500" cy="200" r="180" fill="url(#bgOrb1)">
            <animate attributeName="cy" values="200;220;200" dur="7s" repeatCount="indefinite" />
          </circle>
          {/* Neon brown curves */}
          <path d="M60 300 Q 200 200 540 320" stroke="url(#neonCurve)" strokeWidth="10" fill="none" filter="url(#neonGlow)" opacity="0.7">
            <animate attributeName="d" values="M60 300 Q 200 200 540 320;M60 320 Q 220 180 540 340;M60 300 Q 200 200 540 320" dur="7s" repeatCount="indefinite" />
          </path>
          <path d="M100 600 Q 300 700 500 600" stroke="url(#neonCurve)" strokeWidth="8" fill="none" filter="url(#neonGlow)" opacity="0.5">
            <animate attributeName="d" values="M100 600 Q 300 700 500 600;M100 620 Q 320 720 500 620;M100 600 Q 300 700 500 600" dur="9s" repeatCount="indefinite" />
          </path>
          {/* Wavy path - learning/career theme */}
          <path d="M0 700 Q 200 600 400 800 T 600 700" stroke="url(#bgWave1)" strokeWidth="32" fill="none" opacity="0.18">
            <animate attributeName="d" values="M0 700 Q 200 600 400 800 T 600 700;M0 720 Q 220 620 420 820 T 600 720;M0 700 Q 200 600 400 800 T 600 700" dur="8s" repeatCount="indefinite" />
          </path>
          {/* Abstract polygon - tech/career */}
          <polygon points="120,120 180,80 240,120 210,180 150,180" fill="url(#bgWave2)" opacity="0.13">
            <animateTransform attributeName="transform" type="rotate" from="0 180 130" to="360 180 130" dur="18s" repeatCount="indefinite" />
          </polygon>
          {/* Small floating dot */}
          <circle cx="80" cy="300" r="18" fill="#8d6748" opacity="0.12">
            <animate attributeName="cy" values="300;320;300" dur="6s" repeatCount="indefinite" />
          </circle>
          {/* Book/roadmap icon - subtle */}
          <g opacity="0.10">
            <rect x="420" y="60" width="60" height="40" rx="8" fill="#8d6748" />
            <rect x="430" y="70" width="40" height="20" rx="4" fill="#fff" />
          </g>
          {/* App name branding */}
          <text x="50%" y="54%" textAnchor="middle" fontFamily="Orbitron,Segoe UI,Arial,sans-serif" fontSize="3.2rem" fontWeight="bold" fill="#fff" filter="url(#neonGlow)" style={{letterSpacing:'0.08em',textShadow:'0 0 32px #8d6748,0 0 64px #bfae9e'}}>
            SkillFlux
          </text>
        </svg>
      </div>
      <div className="login-modern-right">
        <form className="login-modern-form" onSubmit={handleEmailLogin}>
          <h1 className="login-modern-title">LOGIN</h1>
          <div className="login-modern-field">
            <label htmlFor="login-email" className="login-modern-label">Username</label>
            <div className="login-modern-input-row">
              <input
                id="login-email"
                type="email"
                placeholder=""
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="login-modern-input"
                autoComplete="username"
              />
              {emailValid && (
                <span className="login-modern-check">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#1de9b6"/><path d="M6 10.5l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              )}
            </div>
          </div>
          <div className="login-modern-field">
            <label htmlFor="login-password" className="login-modern-label">Password</label>
            <div className="login-modern-input-row">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder=""
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="login-modern-input"
                autoComplete="current-password"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(v => !v)}
                className="login-modern-eye"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#009688" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.21-3.06 3.62-5.44 6.58-6.47"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3.5 3.5 0 0 0 12 16a3.5 3.5 0 0 0 2.47-6.47"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#009688" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3.5"/></svg>
                )}
              </button>
              {passwordValid && (
                <span className="login-modern-check">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#1de9b6"/><path d="M6 10.5l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              )}
            </div>
          </div>
          <div className="login-modern-remember-row">
            <input
              type="checkbox"
              id="remember-me"
              className="login-modern-checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember-me" className="login-modern-remember-label">Agree to remember the password.</label>
          </div>
          {error && <div className="form-error login-modern-error">{error}</div>}
          <button className="login-modern-btn" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'LOGIN'}</button>
          <div className="login-modern-bottom-row">
            <span className="login-modern-no-account">No account?</span>
            <button type="button" className="login-modern-link" onClick={() => onNav('/signup')}>Sign up</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SignupPage({ onLogin, onNav }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    education: '',
    role: '',
    skills: [],
    skillInput: '',
    targetRole: '',
    goal: '',
    resume: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [targetRoleSuggestions] = useState([
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'Product Manager', 'DevOps Engineer', 'UI/UX Designer', 'Mobile Developer', 'QA Engineer', 'AI Engineer', 'Cloud Architect', 'Business Analyst', 'Cybersecurity Specialist', 'ML Engineer', 'Project Manager', 'Other',
  ]);
  const [filteredRoles, setFilteredRoles] = useState(targetRoleSuggestions);
  const [skillsList] = useState([
    'Python', 'JavaScript', 'HTML', 'CSS', 'SQL', 'Java', 'C++', 'React', 'Node.js', 'Django', 'Flask', 'Angular', 'Vue', 'TypeScript', 'Swift', 'Kotlin', 'Go', 'Ruby', 'PHP', 'R', 'C#', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Figma', 'Photoshop', 'Illustrator', 'Other',
  ]);
  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [nameValid, setNameValid] = useState(false);

  useEffect(() => {
    setEmailValid(form.email.length > 3 && form.email.includes('@'));
    setPasswordValid(form.password.length > 5);
    setNameValid(form.name.length > 1);
  }, [form.email, form.password, form.name]);

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
    if (name === 'targetRole') {
      setFilteredRoles(targetRoleSuggestions.filter(r => r.toLowerCase().includes(value.toLowerCase())));
    }
  };
  const handleSkillInput = e => {
    setForm(f => ({ ...f, skillInput: e.target.value }));
  };
  const handleAddSkill = skill => {
    if (skill && !form.skills.includes(skill)) {
      setForm(f => ({ ...f, skills: [...f.skills, skill], skillInput: '' }));
    }
  };
  const handleRemoveSkill = skill => {
    setForm(f => ({ ...f, skills: f.skills.filter(s => s !== skill) }));
  };
  const handleSkillInputKeyDown = e => {
    if (e.key === 'Enter' && form.skillInput) {
      e.preventDefault();
      handleAddSkill(form.skillInput);
    }
  };
  const handleSignup = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, form.email, form.password);
      const user = userCredential.user;
      let resumeUrl = '';
      if (form.resume) {
        // Upload resume to Firebase Storage
        const storageRef = ref(storage, `resumes/${user.uid}/${form.resume.name}`);
        await uploadBytes(storageRef, form.resume);
        resumeUrl = await getDownloadURL(storageRef);
      }

      // Persist profile via backend (Admin SDK) to avoid client Firestore rule issues
      const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
      const resp = await fetch(`${baseUrl}/api/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
        name: form.name,
        email: form.email,
        education: form.education,
        role: form.role,
        skills: form.skills,
        targetRole: form.targetRole,
          goals: form.goal,
          resumeUrl
        })
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to store profile on server');
      }
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modern-split signup-compact">
      <div className="login-modern-left">
        {/* Decorative SVG shapes for visual appeal */}
        <svg className="login-bg-svg" width="100%" height="100%" viewBox="0 0 600 900" fill="none" xmlns="http://www.w3.org/2000/svg" style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',zIndex:0,pointerEvents:'none'}}>
          <defs>
            <radialGradient id="bgOrb1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#e6ded7" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#bfae9e" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="bgWave1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#bfae9e" />
              <stop offset="100%" stopColor="#8d6748" />
            </linearGradient>
            <linearGradient id="bgWave2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e6ded7" />
              <stop offset="100%" stopColor="#a89f91" />
            </linearGradient>
            <linearGradient id="neonCurve" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#bfae9e" stopOpacity="0.7" />
              <stop offset="60%" stopColor="#8d6748" stopOpacity="1" />
              <stop offset="100%" stopColor="#e6ded7" stopOpacity="0.7" />
            </linearGradient>
            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Large soft orb */}
          <circle cx="500" cy="200" r="180" fill="url(#bgOrb1)">
            <animate attributeName="cy" values="200;220;200" dur="7s" repeatCount="indefinite" />
          </circle>
          {/* Neon brown curves */}
          <path d="M60 300 Q 200 200 540 320" stroke="url(#neonCurve)" strokeWidth="10" fill="none" filter="url(#neonGlow)" opacity="0.7">
            <animate attributeName="d" values="M60 300 Q 200 200 540 320;M60 320 Q 220 180 540 340;M60 300 Q 200 200 540 320" dur="7s" repeatCount="indefinite" />
          </path>
          <path d="M100 600 Q 300 700 500 600" stroke="url(#neonCurve)" strokeWidth="8" fill="none" filter="url(#neonGlow)" opacity="0.5">
            <animate attributeName="d" values="M100 600 Q 300 700 500 600;M100 620 Q 320 720 500 620;M100 600 Q 300 700 500 600" dur="9s" repeatCount="indefinite" />
          </path>
          {/* Wavy path - learning/career theme */}
          <path d="M0 700 Q 200 600 400 800 T 600 700" stroke="url(#bgWave1)" strokeWidth="32" fill="none" opacity="0.18">
            <animate attributeName="d" values="M0 700 Q 200 600 400 800 T 600 700;M0 720 Q 220 620 420 820 T 600 720;M0 700 Q 200 600 400 800 T 600 700" dur="8s" repeatCount="indefinite" />
          </path>
          {/* Abstract polygon - tech/career */}
          <polygon points="120,120 180,80 240,120 210,180 150,180" fill="url(#bgWave2)" opacity="0.13">
            <animateTransform attributeName="transform" type="rotate" from="0 180 130" to="360 180 130" dur="18s" repeatCount="indefinite" />
          </polygon>
          {/* Small floating dot */}
          <circle cx="80" cy="300" r="18" fill="#8d6748" opacity="0.12">
            <animate attributeName="cy" values="300;320;300" dur="6s" repeatCount="indefinite" />
          </circle>
          {/* Book/roadmap icon - subtle */}
          <g opacity="0.10">
            <rect x="420" y="60" width="60" height="40" rx="8" fill="#8d6748" />
            <rect x="430" y="70" width="40" height="20" rx="4" fill="#fff" />
          </g>
          {/* App name branding */}
          <text x="50%" y="54%" textAnchor="middle" fontFamily="Orbitron,Segoe UI,Arial,sans-serif" fontSize="3.2rem" fontWeight="bold" fill="#fff" filter="url(#neonGlow)" style={{letterSpacing:'0.08em',textShadow:'0 0 32px #8d6748,0 0 64px #bfae9e'}}>
            SkillFlux
          </text>
        </svg>
      </div>
      <div className="login-modern-right">
        <form className="login-modern-form" onSubmit={handleSignup}>
          <h1 className="login-modern-title">SIGN UP</h1>
          <div className="login-modern-field">
            <label htmlFor="signup-name" className="login-modern-label">Name</label>
            <div className="login-modern-input-row">
              <input
                id="signup-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="login-modern-input"
                autoComplete="name"
              />
              {nameValid && (
                <span className="login-modern-check">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#1de9b6"/><path d="M6 10.5l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              )}
            </div>
          </div>
          <div className="login-modern-field">
            <label htmlFor="signup-email" className="login-modern-label">Email</label>
            <div className="login-modern-input-row">
              <input
                id="signup-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="login-modern-input"
                autoComplete="email"
              />
              {emailValid && (
                <span className="login-modern-check">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#1de9b6"/><path d="M6 10.5l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              )}
            </div>
          </div>
          <div className="login-modern-field">
            <label htmlFor="signup-password" className="login-modern-label">Password</label>
            <div className="login-modern-input-row">
              <input
                id="signup-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="login-modern-input"
                autoComplete="new-password"
              />
              {passwordValid && (
                <span className="login-modern-check">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#1de9b6"/><path d="M6 10.5l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              )}
            </div>
          </div>
          <div className="login-modern-field">
            <label htmlFor="signup-education" className="login-modern-label">Education</label>
            <div className="login-modern-input-row">
              <select
                id="signup-education"
                name="education"
                value={form.education}
                onChange={handleChange}
                required
                className="login-modern-input"
              >
                <option value="">Select education</option>
                <option value="High School">High School</option>
                <option value="College">College</option>
                <option value="Graduate">Graduate</option>
                <option value="Professional">Professional</option>
              </select>
            </div>
          </div>
          <div className="login-modern-field">
            <label htmlFor="signup-role" className="login-modern-label">Role</label>
            <div className="login-modern-input-row">
              <select
                id="signup-role"
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                className="login-modern-input"
              >
                <option value="">Select role</option>
                <option value="Student">Student</option>
                <option value="Intern">Intern</option>
                <option value="Fresher">Fresher</option>
                <option value="Professional">Professional</option>
              </select>
            </div>
          </div>
          <div className="login-modern-field">
            <label htmlFor="signup-targetRole" className="login-modern-label">Target Role</label>
            <div className="login-modern-input-row">
              <input
                id="signup-targetRole"
                type="text"
                name="targetRole"
                value={form.targetRole}
                onChange={handleChange}
                list="target-role-list"
                autoComplete="off"
                required
                className="login-modern-input"
              />
              <datalist id="target-role-list">
                {filteredRoles.map(r => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>
          </div>
          <div className="login-modern-field">
            <label className="login-modern-label">Skills</label>
            {form.skills.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.4rem' }}>
                {form.skills.map(skill => (
                  <span key={skill} style={{ background: 'var(--beige)', color: 'var(--brown)', borderRadius: '1rem', padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(141, 103, 72, 0.2)' }}>
                    {skill} <button type="button" style={{ background: 'none', border: 'none', color: 'var(--brown)', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: 0, width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }} onClick={() => handleRemoveSkill(skill)}>&times;</button>
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.4rem' }}>
              {skillsList.filter(s => !form.skills.includes(s)).slice(0, 8).map(s => (
                <button type="button" key={s} style={{ background: '#f8f9fa', color: '#555', border: '1px solid #e0e3ea', borderRadius: '0.9rem', padding: '0.3rem 0.7rem', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }} onClick={() => handleAddSkill(s)}>{s}</button>
              ))}
            </div>
            <input type="text" name="skillInput" placeholder="Add custom skill..." value={form.skillInput} onChange={handleSkillInput} onKeyDown={handleSkillInputKeyDown} className="login-modern-input" />
          </div>
          {error && <div className="form-error login-modern-error">{error}</div>}
          <button className="login-modern-btn" type="submit" disabled={loading}>{loading ? 'Signing up...' : 'SIGN UP'}</button>
          <div className="login-modern-bottom-row">
            <span className="login-modern-no-account">Already have an account?</span>
            <button type="button" className="login-modern-link" onClick={() => onNav && onNav('/login')}>Login</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function App() {
  const howItWorksRef = useRef(null);
  const [user, setUser] = useState(null);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, u => {
      setUser(u);
    });
    return () => unsubscribe();
    // eslint-disable-next-line
  }, []);

  const handleSeeHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };
  const handleNav = path => {
    window.history.pushState({}, '', path);
    navigate(path);
  };
  const handleLogin = () => {
    navigate('/');
  };

  return (
    <Routes>
      <Route path="/signup" element={<SignupPage onLogin={handleLogin} onNav={handleNav} />} />
      <Route path="/login" element={<LoginPage onLogin={handleLogin} onNav={handleNav} />} />
      <Route path="/onboarding" element={<OnboardingPage user={user} />} />
      <Route path="/resume" element={<ResumeAnalysis />} />
      <Route path="/resume-result" element={<ResumeResult />} />
      <Route path="/resume-builder" element={<ResumeBuilderNew />} />
      <Route path="/roadmap" element={<Roadmap />} />
      <Route path="/news" element={<TechNews />} />
      <Route path="/aptitude" element={<Aptitude />} />
      {/* Profile route removed; using navbar modal */}
      <Route path="/" element={
        <div className="landing-page">
          <Navbar onSeeHowItWorks={handleSeeHowItWorks} onNav={handleNav} user={user} />
          <HeroSection onSeeHowItWorks={handleSeeHowItWorks} onNav={handleNav} user={user} />
          <StoryBasedQuickActions onNav={handleNav} />
          <AboutUs />
          <HowItWorks ref={howItWorksRef} />
          <FeatureGrid />
          <SocialProof />
          <BigCTA onSeeHowItWorks={handleSeeHowItWorks} onNav={handleNav} user={user} />
          <Footer />
        </div>
      } />
      <Route path="/" element={<StoryHomePage />} />
    </Routes>
  );
}

export default App;

// Placeholder for new StoryHomePage at the bottom:
function StoryHomePage() {
  // This will be a unique, animated, story-driven landing page
  // Each section: pain point & story, visual animation, then feature as solution
  return (
    <main className="story-home">
      {/* Story Section 1: The Resume Struggle */}
      <StorySection
        title="The Resume Struggle"
        painPoint="Endless formatting, confusing feedback, getting lost in a sea of templates."
        narrative="Meet Sam, frustrated after hours tinkering with word processors..."
        solutionTitle="SkillFlux Resume Builder"
        solutionDesc="Meet your new superpower—instant ATS-ready resumes, drag&drop sections, realtime preview and theming."
        animationType="resume-pain-to-builder"
      />
      {/* Animation/transition separator */}
      <SectionTransition type="parallax-fade" />
      {/* Story Section 2: Growth Uncertainty */}
      <StorySection
        title="Lost In Learning?"
        painPoint="Overwhelmed by courses, not sure what skills matter for your dream job."
        narrative="Taylor tries dozens of tutorials, but keeps second-guessing every step."
        solutionTitle="SkillFlux AI Roadmap"
        solutionDesc="Personalized, AI-powered learning path—right skills, right order, all mapped to your career goal."
        animationType="ai-roadmap-hero"
      />
      <SectionTransition type="step-dissolve" />
      <StorySection
        title="Am I Really Ready?"
        painPoint="Self-doubt before interviews, too much generic advice, no way to benchmark yourself."
        narrative="Jordan wishes for a personal interview coach to point out real gaps."
        solutionTitle="SkillFlux Resume Analysis"
        solutionDesc="Upload or build your resume and get instant, AI-powered feedback and interview tips."
        animationType="resume-analysis-animated"
      />
      <SectionTransition type="slide-split" />
      <StorySection
        title="Aptitude Anxiety"
        painPoint="Dreading reasoning and logic rounds, frustrated with dry practice sites."
        narrative="Priya can code, but panics at pattern-based questions."
        solutionTitle="SkillFlux Aptitude Arena"
        solutionDesc="Interactive, fun practice for logical, quant, verbal, and general career skills—with progress analytics."
        animationType="aptitude-flipcards"
      />
      <SectionTransition type="swirl-scroll" />
      <StorySection
        title="Tech Moves Fast"
        painPoint="Stuck in an information rut, missing the latest trends."
        narrative="Mina wants to sound up-to-date, but it's hard to curate real news from noise."
        solutionTitle="SkillFlux Tech News"
        solutionDesc="Tailored, snackable tech news briefings—stay current and sound smart."
        animationType="news-fade-slides"
      />
      {/* StoryHomePage outro/CTA with light animation */}
      <AnimatedOutroCTA />
    </main>
  );
}
