import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { auth as firebaseAuth, db, storage } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Form1Page from './components/Form1Page';
import ResumeAnalysis from './pages/ResumeAnalysis';
import Roadmap from './pages/Roadmap';
import LearningHub from './pages/LearningHub';
import Progress from './pages/Progress';
import Profile from './pages/Profile';

function Navbar({ onSeeHowItWorks }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">SkillFlux</div>
      <div className="navbar-links">
        <a href="/" onClick={e => {e.preventDefault(); window.location.href = '/';}}>Home</a>
        <a href="/resume" onClick={e => {e.preventDefault(); window.location.href = '/resume';}}>Resume Analysis</a>
        <a href="/roadmap" onClick={e => {e.preventDefault(); window.location.href = '/roadmap';}}>Roadmap</a>
        <a href="/hub" onClick={e => {e.preventDefault(); window.location.href = '/hub';}}>Learning Hub</a>
        <a href="/progress" onClick={e => {e.preventDefault(); window.location.href = '/progress';}}>Progress</a>
        <a href="/profile" onClick={e => {e.preventDefault(); window.location.href = '/profile';}}>Profile</a>
        <a href="/login" className="navbar-cta" onClick={e => {e.preventDefault(); window.location.href = '/login';}}>Login</a>
      </div>
    </nav>
  );
}

function HeroSection({ onSeeHowItWorks, onNav }) {
  return (
    <section className="hero-section animated-gradient-bg">
      <div className="hero-left futuristic-fade-in">
        <h1>Everything You Need to Accelerate Your Career</h1>
        <p className="hero-subtitle">From intelligent resume analysis to personalized pathways, we guide you end-to-end.</p>
        <div className="hero-cta-row">
          <button className="neon-btn ripple" onClick={() => onNav('/onboarding')}>Get Started</button>
        </div>
        <div className="trust-row">
          <span className="trust-logo-placeholder" style={{background: 'var(--beige)'}} />
          <span className="trust-logo-placeholder" style={{background: 'var(--grey)'}} />
          <span className="trust-logo-placeholder" style={{background: 'var(--brown)'}} />
          <span className="trust-logo-placeholder" style={{background: 'var(--accent)'}} />
        </div>
      </div>
      <div className="hero-right futuristic-fade-in">
        {/* Futuristic animated SVG illustration with new palette */}
        <svg width="320" height="260" viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="futuristic-card">
          <defs>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#e6ded7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#232323" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="orb" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8d6748" />
              <stop offset="100%" stopColor="#bfae9e" />
            </linearGradient>
          </defs>
          <ellipse cx="160" cy="130" rx="120" ry="80" fill="url(#glow)">
            <animate attributeName="rx" values="120;130;120" dur="3s" repeatCount="indefinite" />
            <animate attributeName="ry" values="80;90;80" dur="3s" repeatCount="indefinite" />
          </ellipse>
          <circle cx="160" cy="130" r="60" fill="url(#orb)">
            <animate attributeName="r" values="60;70;60" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="160" cy="130" r="30" fill="#fff" fillOpacity="0.07">
            <animate attributeName="r" values="30;40;30" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <h2>How it works</h2>
      <div className="step-cards">
        <div className="step-card">
          <div className="step-number">1</div>
          <div className="step-title">Tell us your skills & goals</div>
          <div className="step-desc">or upload resume</div>
        </div>
        <div className="step-card">
          <div className="step-number">2</div>
          <div className="step-title">Get a personalized roadmap</div>
          <div className="step-desc">4–6 weeks</div>
        </div>
        <div className="step-card">
          <div className="step-number">3</div>
          <div className="step-title">Learn with curated videos/courses</div>
          <div className="step-desc">& track progress</div>
        </div>
      </div>
    </section>
  );
}

function FeatureGrid() {
  const features = [
    { title: 'Smart Resume Analysis', desc: 'Upload your resume or LinkedIn. Our AI extracts skills, experience, and career gaps.', icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="#8d6748" strokeWidth="3" fill="#f5f5f3" /><rect x="12" y="14" width="16" height="12" rx="3" fill="#bfae9e" /><rect x="16" y="18" width="8" height="4" rx="1.5" fill="#232323" /></svg>
    ) },
    { title: 'AI-Powered Roadmaps', desc: 'Get tailored 4–6 week learning paths aligned to your goals.', icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="#bfae9e" strokeWidth="3" fill="#f5f5f3" /><path d="M12 28L28 12" stroke="#8d6748" strokeWidth="3" strokeLinecap="round" /><circle cx="28" cy="12" r="3" fill="#8d6748" /><circle cx="12" cy="28" r="3" fill="#bfae9e" /></svg>
    ) },
    { title: 'Curated Learning Hub', desc: 'Top YouTube, Coursera, Udemy picks with AI summaries, notes, and quizzes.', icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="6" y="10" width="28" height="20" rx="5" fill="#bfae9e" /><rect x="12" y="16" width="16" height="8" rx="2" fill="#fff" /></svg>
    ) },
    { title: 'Progress Tracking', desc: 'Visual dashboards track skills and roadmap completion.', icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="#8d6748" strokeWidth="3" fill="#f5f5f3" /><rect x="14" y="18" width="4" height="8" rx="2" fill="#bfae9e" /><rect x="22" y="14" width="4" height="12" rx="2" fill="#8d6748" /></svg>
    ) },
    { title: 'GitHub Projects', desc: 'Discover repos and open-source issues matched to your skills and goals.', icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="#bfae9e" strokeWidth="3" fill="#f5f5f3" /><rect x="14" y="14" width="12" height="12" rx="3" fill="#fff" /><path d="M20 18v4" stroke="#8d6748" strokeWidth="2" strokeLinecap="round" /><circle cx="20" cy="24" r="1.5" fill="#8d6748" /></svg>
    ) },
    { title: 'Reminders', desc: 'Timely nudges to keep your momentum.', icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="#8d6748" strokeWidth="3" fill="#f5f5f3" /><rect x="17" y="12" width="6" height="12" rx="3" fill="#bfae9e" /><circle cx="20" cy="28" r="2" fill="#fff" /></svg>
    ) },
  ];
  return (
    <section className="feature-grid">
      {features.map((f, i) => (
        <div className="feature-card futuristic-card futuristic-fade-in" key={i} style={{ animationDelay: `${0.1 * i + 0.2}s` }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>{f.icon}</div>
          <div className="feature-title">{f.title}</div>
          <div className="feature-desc">{f.desc}</div>
        </div>
      ))}
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

function OnboardingPage() {
  const [form, setForm] = useState({
    goals: '',
    preference: '',
    mode: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // TODO: Replace with real Firebase Auth user
    const uid = 'testuser1';
    try {
      const res = await fetch('http://localhost:5000/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, uid })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save onboarding data');
      setSubmitted(true);
      setLoading(false);
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
  const auth = getAuth();

  const handleEmailLogin = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
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
    <div className="login-split-layout">
      <div className="login-left">
        <img className="login-image" src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" alt="Career" />
        <div className="login-left-overlay">
          <h1>Welcome to SkillFlux</h1>
          <p>Your personalized learning and career growth assistant.</p>
        </div>
      </div>
      <div className="login-right">
        <form className="login-form-card" onSubmit={handleEmailLogin}>
          <div className="login-form-header">
            <h2>Welcome back</h2>
            <p className="login-form-sub">Access your personalized dashboard</p>
          </div>
          <label className="login-label" htmlFor="login-email">Email</label>
          <div className="input-icon-group">
            <span className="input-icon" role="img" aria-label="user">👤</span>
            <input id="login-email" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="login-input-highlight" />
          </div>
          <label className="login-label" htmlFor="login-password">Password</label>
          <div className="input-icon-group" style={{position:'relative'}}>
            <span className="input-icon" role="img" aria-label="lock">🔒</span>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="login-input-highlight"
              style={{paddingRight: '2.5rem'}}
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(v => !v)}
              style={{
                position: 'absolute',
                right: '0.7rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                margin: 0,
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                color: '#888',
                fontSize: '1.3rem'
              }}
            >
              {showPassword ? (
                // Eye-off SVG
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.21-3.06 3.62-5.44 6.58-6.47"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3.5 3.5 0 0 0 12 16a3.5 3.5 0 0 0 2.47-6.47"/></svg>
              ) : (
                // Eye SVG
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3.5"/></svg>
              )}
            </button>
          </div>
          {error && <div className="form-error">{error}</div>}
          <button className="primary-btn" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
          <div className="login-divider">OR</div>
          <div className="social-btn-row">
            <button className="google-btn" type="button" onClick={handleGoogleLogin} disabled={loading} title="Sign in with Google">
              <svg width="40" height="40" viewBox="0 0 48 48" style={{verticalAlign:'middle'}}><g><circle fill="#fff" cx="24" cy="24" r="24"/><path fill="#4285F4" d="M34.6 24.2c0-.7-.1-1.4-.2-2H24v4.1h6c-.3 1.5-1.3 2.7-2.7 3.5v2.9h4.4c2.6-2.4 4.1-5.9 4.1-10.5z"/><path fill="#34A853" d="M24 36c3.3 0 6-1.1 8-3l-4.4-2.9c-1.2.8-2.7 1.3-4.4 1.3-3.4 0-6.2-2.3-7.2-5.3h-4.5v3.1C13.8 33.7 18.5 36 24 36z"/><path fill="#FBBC05" d="M16.8 25.1c-.2-.7-.3-1.4-.3-2.1s.1-1.4.3-2.1v-3.1h-4.5C11.5 20.3 11 22.1 11 24s.5 3.7 1.3 5.2l4.5-3.1z"/><path fill="#EA4335" d="M24 18.7c1.8 0 3.4.6 4.6 1.7l3.4-3.4C30 15.1 27.3 14 24 14c-5.5 0-10.2 2.3-12.7 5.9l4.5 3.1c1-3 3.8-5.3 7.2-5.3z"/></g></svg>
            </button>
          </div>
          <div className="auth-link-row">
            <span>Don't have an account?</span>
            <button type="button" className="link-btn" onClick={() => onNav('/signup')}>Create an account</button>
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
      // Store profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: form.name,
        email: form.email,
        education: form.education,
        role: form.role,
        skills: form.skills,
        targetRole: form.targetRole,
        goal: form.goal,
        resumeUrl,
        createdAt: new Date().toISOString(),
      });
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-split-layout" style={{height: '100vh'}}>
      <div className="signup-left">
        <img className="signup-image" src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" alt="Career" />
        <div className="signup-left-overlay">
          <h1>Welcome to SkillFlux</h1>
          <p>Your personalized learning and career growth assistant.</p>
        </div>
      </div>
      <div className="signup-right" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
        <form className="signup-form-card compact-signup-form" onSubmit={handleSignup} style={{width: '100%', maxWidth: 700, padding: '2.5rem 2.2rem 2rem 2.2rem', borderRadius: '1.5rem', boxSizing: 'border-box', margin: 0, minHeight: 600}}>
          <div className="signup-form-header" style={{marginBottom: '0.3rem', textAlign: 'center'}}>
            <span className="signup-plane" style={{fontSize: '1.1rem', marginBottom: 0}}>✈️</span>
            <h2 style={{fontSize: '2rem', margin: 0, fontWeight: 700}}>Create Account</h2>
            <p className="signup-form-sub" style={{fontSize: '0.95rem', marginTop: 0}}>Sign up with Email</p>
          </div>
          <div className="profile-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem', alignItems: 'start'}}>
            <div className="profile-grid-col">
              <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} required style={{fontSize: '0.92rem', padding: '0.35rem 0.7rem', borderRadius: '0.5rem', marginBottom: '0.1rem', minHeight: '1.7rem'}} />
            </div>
            <div className="profile-grid-col">
              <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required style={{fontSize: '0.92rem', padding: '0.35rem 0.7rem', borderRadius: '0.5rem', marginBottom: '0.1rem', minHeight: '1.7rem'}} />
            </div>
            <div className="profile-grid-col">
              <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required style={{fontSize: '0.92rem', padding: '0.35rem 0.7rem', borderRadius: '0.5rem', marginBottom: '0.1rem', minHeight: '1.7rem'}} />
            </div>
            <div className="profile-grid-col">
              <select name="education" value={form.education} onChange={handleChange} required style={{fontSize: '0.92rem', padding: '0.35rem 0.7rem', borderRadius: '0.5rem', marginBottom: '0.1rem', minHeight: '1.7rem'}}>
                <option value="">Education</option>
                <option value="High School">High School</option>
                <option value="College">College</option>
                <option value="Graduate">Graduate</option>
                <option value="Professional">Professional</option>
              </select>
            </div>
            <div className="profile-grid-col">
              <select name="role" value={form.role} onChange={handleChange} required style={{fontSize: '0.92rem', padding: '0.35rem 0.7rem', borderRadius: '0.5rem', marginBottom: '0.1rem', minHeight: '1.7rem'}}>
                <option value="">Role</option>
                <option value="Student">Student</option>
                <option value="Intern">Intern</option>
                <option value="Fresher">Fresher</option>
                <option value="Professional">Professional</option>
              </select>
            </div>
            <div className="profile-grid-col">
              <input type="text" name="targetRole" placeholder="Target Role" value={form.targetRole} onChange={handleChange} list="target-role-list" autoComplete="off" required style={{fontSize: '0.92rem', padding: '0.35rem 0.7rem', borderRadius: '0.5rem', marginBottom: '0.1rem', minHeight: '1.7rem'}} />
              <datalist id="target-role-list">
                {filteredRoles.map(r => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>
            <div className="profile-grid-col profile-grid-col-span2" style={{padding: '1.2rem 0', marginBottom: '0.5rem'}}>
              <label style={{fontSize: '1.15rem', marginBottom: '0.4rem'}}>Skills</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.5rem' }}>
                {form.skills.map(skill => (
                  <span key={skill} style={{ background: 'var(--beige)', color: 'var(--brown)', borderRadius: '1.2rem', padding: '0.25rem 0.9rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', marginBottom: '0.2rem' }}>
                    {skill} <button type="button" style={{ marginLeft: 6, background: 'none', border: 'none', color: 'var(--brown)', cursor: 'pointer', fontSize: '1.05rem' }} onClick={() => handleRemoveSkill(skill)}>&times;</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.5rem' }}>
                {skillsList.filter(s => !form.skills.includes(s)).slice(0, 12).map(s => (
                  <button type="button" key={s} style={{ background: '#f3f3f3', color: '#333', border: '1px solid #ccc', borderRadius: '1.2rem', padding: '0.25rem 1rem', fontSize: '1.05rem', cursor: 'pointer', marginBottom: '0.2rem' }} onClick={() => handleAddSkill(s)}>{s}</button>
                ))}
              </div>
              <input type="text" name="skillInput" placeholder="Add custom skill..." value={form.skillInput} onChange={handleSkillInput} onKeyDown={handleSkillInputKeyDown} style={{fontSize: '1.05rem', padding: '0.5rem 1rem', borderRadius: '0.7rem', marginBottom: '0.1rem', minHeight: '2.1rem', width: '60%'}} />
            </div>
            {/* Remove Resume Upload field entirely */}
            {/* Save button and login link remain centered and large */}
            <div className="profile-grid-col profile-grid-col-span2" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '0.5rem'}}>
              <button className="primary-btn" type="submit" disabled={loading} style={{width: '70%', fontSize: '1.2rem', padding: '0.8rem 0', margin: '0.5rem 0', display: 'block', borderRadius: '2rem', textAlign: 'center'}}>{loading ? 'Saving...' : 'Save'}</button>
              <div style={{marginTop: '0.7rem', fontSize: '1.1rem', textAlign: 'center', width: '100%'}}>
                Already have an account?{' '}
                <button type="button" style={{background: 'none', border: 'none', color: '#3B82F6', textDecoration: 'underline', cursor: 'pointer', fontSize: '1.1rem', padding: 0}} onClick={() => onNav && onNav('/login')}>Login</button>
              </div>
            </div>
            {error && <div className="form-error profile-grid-col-span2">{error}</div>}
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
    navigate('/form1');
  };

  return (
    <Routes>
      <Route path="/form1" element={<Form1Page />} />
      <Route path="/signup" element={<SignupPage onLogin={handleLogin} onNav={handleNav} />} />
      <Route path="/login" element={<LoginPage onLogin={handleLogin} onNav={handleNav} />} />
      <Route path="/onboarding" element={user ? <OnboardingPage user={user} /> : <LoginPage onLogin={handleLogin} onNav={handleNav} />} />
      <Route path="/resume" element={<ResumeAnalysis />} />
      <Route path="/roadmap" element={<Roadmap />} />
      <Route path="/hub" element={<LearningHub />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/" element={
        <div className="landing-page">
          <Navbar onSeeHowItWorks={handleSeeHowItWorks} onNav={handleNav} />
          <HeroSection onSeeHowItWorks={handleSeeHowItWorks} onNav={() => handleNav(user ? '/onboarding' : '/login')} />
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
