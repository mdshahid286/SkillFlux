import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { auth as firebaseAuth, db, storage } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ResumeAnalysis from './pages/ResumeAnalysis';
import ResumeResult from './pages/ResumeResult';
// Stubs for Resume Builder and Tech News can route to existing components if needed
import Roadmap from './pages/Roadmap';
// Removed LearningHub and Progress pages
// Profile page removed; using in-nav modal instead

function Navbar({ onSeeHowItWorks, onNav, user }) {
  const [open, setOpen] = React.useState(false); // quick dropdown (unused now)
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
        const res = await fetch(`http://localhost:5000/api/user/${user.uid}/plan`);
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
            <a href="/resume" onClick={e => {e.preventDefault(); onNav('/resume');}}>Resume Analysis</a>
            <a href="/resume-builder" onClick={e => {e.preventDefault(); onNav('/resume-builder');}}>Resume Builder</a>
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
                            const res = await fetch('http://localhost:5000/api/onboarding',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
                            const dat = await res.json(); if(!res.ok) throw new Error(dat.error||'Save failed');
                            const r = await fetch(`http://localhost:5000/api/user/${user?.uid}/plan`); const d = await r.json(); if(r.ok) setProfile(d.profile||{});
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
      <div className="hero-right futuristic-fade-in hero-orbit-wrap">
        <div className="orbit-container">
          <div className="orbit-center">
            <div className="center-icon">⚡</div>
            <div className="center-text">AI</div>
          </div>
          {[
            { title: 'Resume Builder', desc: 'Tailored resumes fast', icon: '🧩', color:'#8d6748', radius: 110 },
            { title: 'Resume Parser', desc: 'Extract skills & gaps', icon: '🧠', color:'#bfae9e', radius: 135 },
            { title: 'Roadmap', desc: 'Weekly path to goals', icon: '🗺️', color:'#7c5a43', radius: 160 },
            { title: 'Tech News', desc: 'Stay updated, stay sharp', icon: '📰', color:'#a88d78', radius: 175 },
          ].map((c, idx) => (
            <div key={c.title} className={`orbit-node node-${idx}`} style={{ 
              '--orbit-delay': `${idx * 2}s`,
              '--orbit-duration': `12s`,
              '--orbit-radius': `${c.radius}px`,
              '--accent-color': c.color
            }}>
              <div className="node-ring" aria-hidden />
              <div className="node-core">
                <div className="node-icon">{c.icon}</div>
              </div>
              <div className="node-label">
                <div className="node-title">{c.title}</div>
                <div className="node-desc">{c.desc}</div>
              </div>
              <div className="node-trail" aria-hidden />
            </div>
          ))}
        </div>
        <div className="orbit-legend">
        </div>
      </div>
    </section>
  );
}

function QuickNav({ onNav }) {
  return (
    <section className="quick-nav" style={{ position:'relative', padding:'3rem 1rem', overflow:'hidden' }}>
      <style>{`
        @keyframes floaty { 0%{transform:translateY(0)} 50%{transform:translateY(-6px)} 100%{transform:translateY(0)} }
        @keyframes pulseGlow { 0%{box-shadow:0 0 0 0 rgba(141,103,72,0.25)} 70%{box-shadow:0 0 0 16px rgba(141,103,72,0)} 100%{box-shadow:0 0 0 0 rgba(141,103,72,0)} }
      `}</style>
      <div style={{
        position:'absolute', inset:0, background:'radial-gradient(1200px 300px at 20% -10%, #e6ded7 0%, rgba(230,222,215,0) 60%), radial-gradient(1200px 300px at 80% 110%, #bfae9e 0%, rgba(191,174,158,0) 60%)',
        pointerEvents:'none'
      }} />
      <h2 style={{ textAlign:'center', margin:'0 0 1.6rem 0', color:'var(--brown)', letterSpacing:'0.06em', fontSize:'1.8rem', animation:'sectionTitleSlide 1s ease-out' }}>QUICK ACTIONS</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,minmax(260px,1fr))', gap:'1.2rem', maxWidth:1200, margin:'0 auto' }}>
        {[
          { label:'Resume Analysis', path:'/resume' },
          { label:'Resume Builder', path:'/resume-builder' },
          { label:'Generate Plan', path:'/onboarding' },
          { label:'Roadmap', path:'/roadmap' },
          { label:'Tech News', path:'/news' },
          { label:'Aptitude Prep', path:'/aptitude' },
        ].map((item, i) => (
          <button key={item.label} onClick={() => onNav(item.path)}
            className="quick-nav-btn"
            style={{
              background:'linear-gradient(180deg,#ffffff 0%, #f7f7f7 100%)',
              border:'1px solid #e0e3ea', borderRadius:'1.4rem', padding:'1.6rem 1.2rem',
              display:'flex', alignItems:'center', justifyContent:'space-between',
              cursor:'pointer', transition:'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
              boxShadow:'0 14px 36px rgba(0,0,0,0.10)',
              animation:`quickActionSlide 0.8s ease-out both, floaty 6s ease-in-out infinite`, 
              animationDelay:`${i * 0.1}s, ${i * 0.12}s`
            }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-8px) scale(1.05)'; e.currentTarget.style.boxShadow='0 25px 60px rgba(0,0,0,0.2)'; e.currentTarget.style.borderColor = '#d4c8bc'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0) scale(1.0)'; e.currentTarget.style.boxShadow='0 14px 36px rgba(0,0,0,0.10)'; e.currentTarget.style.borderColor = '#e0e3ea'; }}
          >
            <span style={{ fontWeight:900, color:'#333', letterSpacing:'0.02em', fontSize:'1.05rem' }}>{item.label}</span>
            <span style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg, var(--brown), #bfae9e)', color:'#fff', display:'grid', placeItems:'center', fontWeight:900, animation:'pulseGlow 2.4s infinite', boxShadow:'0 8px 20px rgba(141,103,72,0.35)' }}>→</span>
          </button>
        ))}
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

function FeatureGrid() {
  const features = [
    { title: 'AI Plan Generation', desc: 'Gemini analyzes your past skills + goals to build a tailored weekly roadmap and tips.', icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="#8d6748" strokeWidth="3" fill="#f5f5f3" /><path d="M12 20h16" stroke="#8d6748" strokeWidth="3" strokeLinecap="round" /><path d="M12 14h10" stroke="#bfae9e" strokeWidth="3" strokeLinecap="round" /></svg>
    ) },
    { title: 'Roadmap + Resources', desc: '8-week plan with topics, projects, and curated YouTube videos, books, and courses.', icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="#bfae9e" strokeWidth="3" fill="#f5f5f3" /><path d="M10 26L20 16l10 10" stroke="#8d6748" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ) },
    { title: 'Inline Profile Editing', desc: 'Edit your profile in a beautiful modal. Save updates instantly to Firestore.', icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="#8d6748" strokeWidth="3" fill="#f5f5f3" /><path d="M24 14l2 2-10 10-3 1 1-3 10-10z" stroke="#8d6748" strokeWidth="2"/></svg>
    ) },
    { title: 'Resume Builder', desc: 'Craft a polished resume aligned to your target role.', icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="8" y="8" width="24" height="24" rx="4" fill="#f5f5f3" stroke="#bfae9e" strokeWidth="3" /><path d="M14 16h12M14 20h12M14 24h8" stroke="#8d6748" strokeWidth="2"/></svg>
    ) },
    { title: 'Aptitude Prep', desc: 'Sharpen logic and quantitative skills with curated practice.', icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="#bfae9e" strokeWidth="3" fill="#f5f5f3" /><path d="M20 12v16M12 20h16" stroke="#8d6748" strokeWidth="3" strokeLinecap="round"/></svg>
    ) },
    { title: 'Tech News', desc: 'Stay inspired with timely, curated tech headlines.', icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="8" y="10" width="24" height="20" rx="4" fill="#f5f5f3" stroke="#8d6748" strokeWidth="3" /><path d="M12 16h16M12 20h16M12 24h10" stroke="#8d6748" strokeWidth="2"/></svg>
    ) },
  ];
  return (
    <section className="features">
      <div className="features-container">
        {features.map((f, i) => (
          <div className="feature-card enhanced" key={i} style={{ animationDelay:`${0.05 * i + 0.1}s` }}>
            <div className="feature-icon-row">{f.icon}</div>
            <div className="feature-title">{f.title}</div>
            <div className="feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <section className="social-proof">
      <div className="social-proof-text">Join 10,000+ learners already transforming their careers</div>
    </section>
  );
}

function BigCTA({ onSeeHowItWorks }) {
  return (
    <section className="big-cta">
      <h2>Ready to Unlock Your Career Potential?</h2>
      <p>Get your personalized learning roadmap in minutes.</p>
      <div className="cta-btn-row">
        <button className="primary-btn">Start Free</button>
        <button className="outline-btn" onClick={onSeeHowItWorks}>See How It Works</button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <span>© {new Date().getFullYear()} CareerPath. All rights reserved.</span>
        <span className="footer-links">
          <a href="#">Privacy</a> | <a href="#">Terms</a> | <a href="#">Contact</a>
        </span>
      </div>
    </footer>
  );
}

function OnboardingPage({ user }) {
  const [form, setForm] = useState({
    goals: '',
    preference: '',
    mode: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // TODO: Replace with real Firebase Auth user
    const uid = user?.uid || 'testuser1';
    try {
      const res = await fetch('http://localhost:5000/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, uid })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save onboarding data');
      // trigger roadmap generation then navigate to roadmap page
      try {
        const gen = await fetch('http://localhost:5000/api/generate-roadmap', {
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
    return <div className="onboarding-success">Your personalized roadmap is ready! 🚀</div>;
  }

  return (
    <div className="onboarding-page" style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(120deg, #f5f5f3 60%, #e6ded7 100%)'}}>
      <div className="futuristic-card" style={{maxWidth: 520, width: '100%', boxSizing: 'border-box', padding: '3rem 2.5rem', borderRadius: '2rem', boxShadow: '0 12px 48px 0 rgba(80, 70, 50, 0.18)', textAlign: 'center', margin: '2rem auto', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{marginBottom: '2rem'}}>
          <span style={{fontSize: '2.5rem', color: '#3B82F6'}}>🗺️</span>
          <h2 style={{fontSize: '2.1rem', margin: '0.7rem 0 0.3rem 0', color: '#8d6748', fontWeight: 800, letterSpacing: '0.01em'}}>Let's Build Your Roadmap</h2>
          <p style={{color: '#888', fontSize: '1.15rem'}}>Answer a few quick questions to get a personalized learning journey.</p>
        </div>
        <form className="onboarding-form" onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'stretch', width: '100%'}}>
          <div style={{textAlign: 'left', marginBottom: '0.7rem'}}>
            <label style={{fontWeight: 700, color: '#2563EB', fontSize: '1.18rem'}}>What is your main learning goal?</label>
            <input name="goals" value={form.goals} onChange={handleChange} placeholder="e.g. Become a frontend developer" required style={{width: '100%', padding: '1rem 1.2rem', borderRadius: '0.9rem', border: '1.5px solid #e0e3ea', fontSize: '1.08rem', marginTop: '0.4rem', background: '#f8fafc'}} />
          </div>
          <div style={{textAlign: 'left', marginBottom: '0.7rem'}}>
            <label style={{fontWeight: 700, color: '#2563EB', fontSize: '1.18rem'}}>Preferred learning style</label>
            <div style={{display: 'flex', gap: '1rem', marginTop: '0.4rem'}}>
              <label style={{flex: 1, background: form.preference==='videos'?'#e0e7ff':'#f8fafc', border: '1.5px solid #e0e3ea', borderRadius: '0.9rem', padding: '1rem', cursor: 'pointer', textAlign: 'center', transition: 'none', fontWeight: 600, color: '#3B82F6', boxShadow: form.preference==='videos'?'0 2px 12px #3B82F622':'none'}}>
                <input type="radio" name="preference" value="videos" checked={form.preference==='videos'} onChange={handleChange} style={{marginRight: 8}} />
                <span role="img" aria-label="Videos" style={{fontSize: '1.3rem'}}>🎬</span> Videos
              </label>
              <label style={{flex: 1, background: form.preference==='courses'?'#e0e7ff':'#f8fafc', border: '1.5px solid #e0e3ea', borderRadius: '0.9rem', padding: '1rem', cursor: 'pointer', textAlign: 'center', transition: 'none', fontWeight: 600, color: '#3B82F6', boxShadow: form.preference==='courses'?'0 2px 12px #3B82F622':'none'}}>
                <input type="radio" name="preference" value="courses" checked={form.preference==='courses'} onChange={handleChange} style={{marginRight: 8}} />
                <span role="img" aria-label="Courses" style={{fontSize: '1.3rem'}}>📚</span> Courses
              </label>
              <label style={{flex: 1, background: form.preference==='projects'?'#e0e7ff':'#f8fafc', border: '1.5px solid #e0e3ea', borderRadius: '0.9rem', padding: '1rem', cursor: 'pointer', textAlign: 'center', transition: 'none', fontWeight: 600, color: '#3B82F6', boxShadow: form.preference==='projects'?'0 2px 12px #3B82F622':'none'}}>
                <input type="radio" name="preference" value="projects" checked={form.preference==='projects'} onChange={handleChange} style={{marginRight: 8}} />
                <span role="img" aria-label="Projects" style={{fontSize: '1.3rem'}}>🛠️</span> Projects
              </label>
              <label style={{flex: 1, background: form.preference==='docs'?'#e0e7ff':'#f8fafc', border: '1.5px solid #e0e3ea', borderRadius: '0.9rem', padding: '1rem', cursor: 'pointer', textAlign: 'center', transition: 'none', fontWeight: 600, color: '#3B82F6', boxShadow: form.preference==='docs'?'0 2px 12px #3B82F622':'none'}}>
                <input type="radio" name="preference" value="docs" checked={form.preference==='docs'} onChange={handleChange} style={{marginRight: 8}} />
                <span role="img" aria-label="Docs" style={{fontSize: '1.3rem'}}>📄</span> Docs
              </label>
            </div>
          </div>
          <div style={{textAlign: 'left', marginBottom: '0.7rem'}}>
            <label style={{fontWeight: 700, color: '#2563EB', fontSize: '1.18rem'}}>How do you want to learn?</label>
            <div style={{display: 'flex', gap: '1rem', marginTop: '0.4rem'}}>
              <label style={{flex: 1, background: form.mode==='self-paced'?'#e0e7ff':'#f8fafc', border: '1.5px solid #e0e3ea', borderRadius: '0.9rem', padding: '1rem', cursor: 'pointer', textAlign: 'center', transition: 'none', fontWeight: 600, color: '#3B82F6', boxShadow: form.mode==='self-paced'?'0 2px 12px #3B82F622':'none'}}>
                <input type="radio" name="mode" value="self-paced" checked={form.mode==='self-paced'} onChange={handleChange} style={{marginRight: 8}} />
                <span role="img" aria-label="Self-paced" style={{fontSize: '1.3rem'}}>⏳</span> Self-paced
              </label>
              <label style={{flex: 1, background: form.mode==='guided'?'#e0e7ff':'#f8fafc', border: '1.5px solid #e0e3ea', borderRadius: '0.9rem', padding: '1rem', cursor: 'pointer', textAlign: 'center', transition: 'none', fontWeight: 600, color: '#3B82F6', boxShadow: form.mode==='guided'?'0 2px 12px #3B82F622':'none'}}>
                <input type="radio" name="mode" value="guided" checked={form.mode==='guided'} onChange={handleChange} style={{marginRight: 8}} />
                <span role="img" aria-label="Guided" style={{fontSize: '1.3rem'}}>🧑‍🏫</span> Guided
              </label>
              <label style={{flex: 1, background: form.mode==='collaborative'?'#e0e7ff':'#f8fafc', border: '1.5px solid #e0e3ea', borderRadius: '0.9rem', padding: '1rem', cursor: 'pointer', textAlign: 'center', transition: 'none', fontWeight: 600, color: '#3B82F6', boxShadow: form.mode==='collaborative'?'0 2px 12px #3B82F622':'none'}}>
                <input type="radio" name="mode" value="collaborative" checked={form.mode==='collaborative'} onChange={handleChange} style={{marginRight: 8}} />
                <span role="img" aria-label="Collaborative" style={{fontSize: '1.3rem'}}>🤝</span> Collaborative
              </label>
            </div>
          </div>
          {error && <div className="form-error">{error}</div>}
          <button className="primary-btn" type="submit" disabled={loading} style={{fontSize: '1.25rem', padding: '1.1rem 0', borderRadius: '2rem', marginTop: '1.2rem', width: '100%'}}>{loading ? 'Generating Roadmap...' : 'Get My Roadmap'}</button>
        </form>
      </div>
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
      navigate('/onboarding');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          <button className="login-modern-btn" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'SIGN UP'}</button>
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
      const resp = await fetch('http://localhost:5000/api/onboarding', {
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
                style={{ borderBottom: '2px solid #e0e3ea', background: 'transparent', color: '#222', fontWeight: 600 }}
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
                style={{ borderBottom: '2px solid #e0e3ea', background: 'transparent', color: '#222', fontWeight: 600 }}
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.5rem' }}>
              {form.skills.map(skill => (
                <span key={skill} style={{ background: 'var(--beige)', color: 'var(--brown)', borderRadius: '1.2rem', padding: '0.25rem 0.9rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', marginBottom: '0.2rem' }}>
                  {skill} <button type="button" style={{ marginLeft: 6, background: 'none', border: 'none', color: 'var(--brown)', cursor: 'pointer', fontSize: '1.05rem' }} onClick={() => handleRemoveSkill(skill)}>&times;</button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.5rem' }}>
              {skillsList.filter(s => !form.skills.includes(s)).slice(0, 8).map(s => (
                <button type="button" key={s} style={{ background: '#f3f3f3', color: '#333', border: '1px solid #ccc', borderRadius: '1.2rem', padding: '0.25rem 1rem', fontSize: '1.05rem', cursor: 'pointer', marginBottom: '0.2rem' }} onClick={() => handleAddSkill(s)}>{s}</button>
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
      <Route path="/roadmap" element={<Roadmap />} />
      {/* Routes for Learning Hub and Progress removed */}
      {/* Temporary routing to existing pages; replace with real components later */}
      <Route path="/resume-builder" element={<ResumeAnalysis />} />
      <Route path="/news" element={<ResumeResult />} />
      <Route path="/aptitude" element={<ResumeResult />} />
      {/* Profile route removed; using navbar modal */}
      <Route path="/" element={
        <div className="landing-page">
          <Navbar onSeeHowItWorks={handleSeeHowItWorks} onNav={handleNav} user={user} />
          <HeroSection onSeeHowItWorks={handleSeeHowItWorks} onNav={handleNav} user={user} />
          <QuickNav onNav={handleNav} />
          <HowItWorks ref={howItWorksRef} />
          <FeatureGrid />
          <SocialProof />
          <BigCTA onSeeHowItWorks={handleSeeHowItWorks} />
          <Footer />
        </div>
      } />
    </Routes>
  );
}

export default App;
