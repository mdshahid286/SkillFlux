import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const LOCAL_PROGRESS_KEY_PREFIX = `roadmapProgress-`;

function loadLocalProgress(uid) {
  try { return JSON.parse(localStorage.getItem(`${LOCAL_PROGRESS_KEY_PREFIX}${uid}`)) || {}; }
  catch { return {}; }
}
function saveLocalProgress(uid, p) {
  try { localStorage.setItem(`${LOCAL_PROGRESS_KEY_PREFIX}${uid}`, JSON.stringify(p)); } catch {}
}

// removed seeding in favor of real user data

export default function Roadmap() {
  const navigate = useNavigate();
  const [uid, setUid] = useState('');
  const [activeTab, setActiveTab] = useState('roadmap');
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Real data from API
  const [userProfile, setUserProfile] = useState(null);
  const [onboardingData, setOnboardingData] = useState(null);
  const [skillSummary, setSkillSummary] = useState('');
  const [roadmapData, setRoadmapData] = useState([]);
  const [resourcesData, setResourcesData] = useState({});
  const [moduleProgress, setModuleProgress] = useState({});
  const [expandedWeek, setExpandedWeek] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      const effectiveUid = u?.uid || 'testuser1';
      setUid(effectiveUid);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (uid) fetchRoadmapData(uid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const fetchRoadmapData = async (currentUid) => {
    setLoading(true);
    setError('');
    try {
      // 1) Try to load saved plan from backend (Firestore)
      const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
      const saved = await fetch(`${baseUrl}/api/user/${currentUid}/plan`);
      let weeks = [];
      let resources = {};
      if (saved.ok) {
        const d = await saved.json();
        weeks = Array.isArray(d.roadmap) ? d.roadmap : [];
        resources = d.resources || {};
        // Set profile and analysis summary from saved plan
        if (d.profile) {
          setUserProfile(d.profile);
          // Extract onboarding data from profile
          if (d.profile.onboarding) {
            setOnboardingData(d.profile.onboarding);
          }
        }
        const summary = d?.aiPlan?.analysis?.summary || '';
        if (summary) setSkillSummary(summary);
      }

      // 2) If no saved roadmap, generate one using the correct endpoint
      if (!weeks.length) {
        const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
        const res = await fetch(`${baseUrl}/api/generate-roadmap`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: currentUid })
        });
        if (res.ok) {
          const data = await res.json();
          weeks = Array.isArray(data.roadmap) ? data.roadmap : [];
          resources = data.resources || {};
          // Update profile with generated data
          if (data.analysis) {
            setSkillSummary(data.analysis.summary || '');
          }
        } else {
          console.error('[Roadmap] Failed to generate roadmap:', res.status, res.statusText);
        }
      }

      // Fallback to guarantee UI (only if no data at all)
      if (!weeks.length) {
        console.warn('[Roadmap] No roadmap data available, showing empty state');
        weeks = [];
      }
      // Show at most 8 weeks
      setRoadmapData(weeks.slice(0, 8));

      setResourcesData(resources);

      // Set user profile from saved data or keep existing
      if (!userProfile) {
        setUserProfile({ role: 'Student', targetRole: 'Data Analyst', skills: ['Python', 'SQL'] });
      }
      
      // Set onboarding data fallback if not available
      if (!onboardingData) {
        setOnboardingData({ 
          primarySkill: 'General Skills', 
          careerAspiration: 'Data Analyst',
          learningGoal: 'Career Development',
          experienceLevel: 'intermediate',
          learningStyle: 'mixed'
        });
      }
      setModuleProgress(loadLocalProgress(currentUid));
    } catch (e) {
      setError('Failed to load roadmap data: ' + e.message);
      console.error('Roadmap fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleWeek = (weekIndex) => {
    setExpanded(prev => ({ ...prev, [weekIndex]: !prev[weekIndex] }));
  };

  const openWeekModal = (weekIndex) => {
    setExpandedWeek(weekIndex);
  };

  const closeWeekModal = () => {
    setExpandedWeek(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "In Progress": return "#8d6748";
      case "Completed": return "#22c55e";
      default: return "#9ca3af";
    }
  };

  const markModuleDone = async (weekIndex, moduleIndex, moduleName) => {
    const moduleKey = `week${weekIndex}_module${moduleIndex}`;

    // optimistic local update
    setModuleProgress(prev => {
      const next = { ...prev, [moduleKey]: { status: 'Completed', progress: 100, completedAt: new Date().toISOString() } };
      if (uid) saveLocalProgress(uid, next);
      return next;
    });

    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
      const resp = await fetch(`${baseUrl}/api/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, week: weekIndex + 1, topic: moduleName, type: 'module', completed: true })
      });
      if (!resp.ok) throw new Error('Progress save failed');
    } catch {
      // keep local progress; optionally show toast
    }
  };

  const getModuleStatus = (weekIndex, moduleIndex) => {
    const moduleKey = `week${weekIndex}_module${moduleIndex}`;
    return moduleProgress[moduleKey] || { status: "Not Started", progress: 0 };
  };

  // Transform roadmap data to match UI structure
  const transformedWeeks = roadmapData.slice(0, 8).map((week, index) => ({
    week: week.week || (index + 1),
    weeklyGoal: week.weeklyGoal || '',
    title: `Week ${week.week || (index + 1)}`,
    modules: [
      ...(week.topics || []).map(topic => ({
        name: topic,
        status: getModuleStatus(index, `topic-${topic}`).status,
        progress: getModuleStatus(index, `topic-${topic}`).progress
      })),
      ...(week.projects || []).map(project => ({
        name: project,
        status: getModuleStatus(index, `project-${project}`).status,
        progress: getModuleStatus(index, `project-${project}`).progress
      }))
    ]
  }));

  // Generate YouTube video suggestions based on roadmap topics
  const generateYouTubeSuggestions = () => {
    const suggestions = [];
    const primarySkill = onboardingData?.primarySkill || 'programming';
    const experienceLevel = onboardingData?.experienceLevel || 'intermediate';
    
    // Get all unique topics from roadmap
    const allTopics = Array.from(new Set(
      roadmapData.flatMap(week => [
        ...(week.topics || []),
        ...(week.projects || [])
      ])
    ));
    
    // Generate video suggestions for each topic
    allTopics.forEach(topic => {
      const searchTerms = [
        `${topic} tutorial`,
        `${topic} ${experienceLevel}`,
        `${primarySkill} ${topic}`,
        `learn ${topic}`
      ];
      
      searchTerms.forEach(term => {
        suggestions.push({
          type: "VIDEO",
          title: `${term.charAt(0).toUpperCase() + term.slice(1)} - YouTube Search`,
          source: "YouTube",
          description: `Search for "${term}" on YouTube to find relevant tutorials`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(term)}`,
          thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg", // Placeholder
          isSearchSuggestion: true,
          searchTerm: term
        });
      });
    });
    
    return suggestions;
  };

  // Transform resources data (support both topic-grouped and flat aiPlan.resources)
  const topicEntries = Object.entries(resourcesData).filter(([key]) => typeof resourcesData[key] === 'object' && !Array.isArray(resourcesData[key]));
  const flatVideos = Array.isArray(resourcesData?.videos) ? resourcesData.videos : [];
  const flatCourses = Array.isArray(resourcesData?.courses) ? resourcesData.courses : [];
  const flatBooks = Array.isArray(resourcesData?.books) ? resourcesData.books : [];

  const transformedResources = [
    // Flat videos from aiPlan.resources
    ...flatVideos.map(v => ({
      type: "VIDEO",
      title: v.title || v.name || 'Video',
      source: (v.platform || v.source || 'YouTube'),
      description: v.description || 'Recommended learning video',
      url: v.url || (v.videoUrl || ''),
      thumbnail: v.thumbnail
    })),
    // Flat courses
    ...flatCourses.map(c => ({
      type: "COURSE",
      title: c.title || c.name || 'Course',
      source: c.platform || 'Course',
      description: 'Recommended course',
      url: c.url,
      difficulty: c.difficulty,
      rating: c.rating
    })),
    // Flat books
    ...flatBooks.map(b => ({
      type: "BOOK",
      title: b.title || 'Book',
      source: b.author || 'Author',
      description: 'Recommended reading'
    })),
    // Topic-grouped resources
    ...topicEntries.flatMap(([topic, data]) => [
      ...(data.ytVideos || data.videos || []).map(video => ({
        type: "VIDEO",
        title: video.title,
        source: "YouTube",
        description: `Learn ${topic} with this tutorial`,
        url: video.url || video.videoUrl,
        thumbnail: video.thumbnail
      })),
      ...(data.courses || []).map(course => ({
        type: "COURSE",
        title: course.name || course.title,
        source: course.platform || 'Course',
        description: `Comprehensive course on ${topic}`,
        url: course.url,
        difficulty: course.difficulty,
        rating: course.rating
      })),
      ...(data.github || []).map(repo => ({
        type: "ARTICLE",
        title: repo.name,
        source: "GitHub",
        description: `Open source project for ${topic}`,
        url: repo.url,
        label: repo.label
      }))
    ]),
    // Generated YouTube suggestions based on roadmap topics
    ...generateYouTubeSuggestions()
  ];

  // Calculate progress data based on real module completion
  const totalModules = transformedWeeks.reduce((total, week) => total + week.modules.length, 0);
  const completedModules = transformedWeeks.reduce((sum, week, wi) => (
    sum + week.modules.reduce((acc, _m, mi) => acc + (getModuleStatus(wi, mi).status === 'Completed' ? 1 : 0), 0)
  ), 0);
  const roadmapCompletionPercentage = totalModules > 0 ? Math.floor((completedModules / totalModules) * 100) : 0;
  const weeksCompletedCount = transformedWeeks.filter(w => w.modules.length > 0 && w.modules.every((_, mi) => getModuleStatus(w.week - 1, mi).status === 'Completed')).length;
  const totalWeeksCount = transformedWeeks.length || 0;
  const weeksCompletionPct = totalWeeksCount > 0 ? Math.floor((weeksCompletedCount / totalWeeksCount) * 100) : 0;

  // Compute skill progress based on module names that include the skill string
  const computeSkillProgress = (skillName) => {
    const name = String(skillName || '').toLowerCase();
    if (!name) return 0;
    let total = 0;
    let done = 0;
    transformedWeeks.forEach((w, wi) => {
      w.modules.forEach((m, mi) => {
        const includes = String(m.name || '').toLowerCase().includes(name);
        if (includes) {
          total += 1;
          const ms = getModuleStatus(wi, mi);
          if (ms.status === 'Completed') done += 1;
        }
      });
    });
    return total > 0 ? Math.floor((done / total) * 100) : 0;
  };

  // Show topics suggested by Gemini (from roadmap) instead of user-entered skills
  const skillsForProgress = Array.from(new Set(
    roadmapData.flatMap(w => (w.topics || []))
  )).slice(0, 8);

  const progressData = {
    skills: skillsForProgress.map(skill => ({ name: skill, progress: computeSkillProgress(skill) })),
    roadmapCompletion: roadmapCompletionPercentage,
    achievements: [
      { icon: "🔥", text: `${completedModules} modules completed` },
      { icon: "🏁", text: `${weeksCompletedCount} weeks complete` },
      { icon: "📈", text: `${roadmapCompletionPercentage}% roadmap` }
    ]
  };

  if (loading) {
    return (
      <div className="roadmap-page">
        <div className="page-navigation">
          <button className="nav-btn" onClick={() => navigate('/')} title="Home">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Home
          </button>
        </div>
        <div className="roadmap-container">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '1.2rem', color: 'var(--brown)' }}>Loading your personalized roadmap...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="roadmap-page">
        <div className="page-navigation">
          <button className="nav-btn" onClick={() => navigate('/')} title="Home">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Home
          </button>
        </div>
        <div className="roadmap-container">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '1.2rem', color: '#ef4444' }}>Error: {error}</div>
            <button 
              onClick={fetchRoadmapData}
              style={{ 
                marginTop: '1rem', 
                padding: '0.5rem 1rem', 
                background: 'var(--brown)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="roadmap-page">
      <div className="page-navigation">
        <button className="nav-btn" onClick={() => navigate('/')} title="Home">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Home
        </button>
      </div>
      <div className="roadmap-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="roadmap-title">AI LEARNING PLAN</h1>
          <button 
            onClick={() => fetchRoadmapData(uid)}
            style={{
              background: 'var(--brown)',
              color: 'white',
              border: 'none',
              padding: '0.8rem 1.5rem',
              borderRadius: '0.8rem',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            🔄 Refresh Roadmap
          </button>
        </div>
        
        {/* User Summary */}
        <div className="user-summary-card">
          <div className="user-summary-content">
            <div className="user-role">
              <span className="current-role">Current: {userProfile?.role || '—'}</span>
              <span className="target-role">Target: {onboardingData?.careerAspiration || userProfile?.targetRole || '—'}</span>
            </div>
            <div className="skills-tags">
              {onboardingData?.primarySkill ? (
                <span className="skill-tag">{onboardingData.primarySkill}</span>
              ) : (
                (userProfile?.skills || []).slice(0, 4).map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Analysis Summary */}
        {!!skillSummary && (
          <div className="user-summary-card" style={{ marginTop: '0.8rem' }}>
            <div className="user-summary-content">
              <div style={{ color: 'var(--brown)', fontWeight: 700, marginBottom: '0.4rem' }}>Overview</div>
              <div style={{ color: '#555' }}>{skillSummary}</div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'roadmap' ? 'active' : ''}`}
            onClick={() => setActiveTab('roadmap')}
          >
            Roadmap
          </button>
          <button 
            className={`nav-tab ${activeTab === 'resources' ? 'active' : ''}`}
            onClick={() => setActiveTab('resources')}
          >
            View Resources
          </button>
          <button 
            className={`nav-tab ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            Track Progress
          </button>
      </div>

        {/* Content based on active tab */}
        {activeTab === 'roadmap' && (
          <div className="roadmap-content">
            {roadmapData.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem 2rem',
                background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
                borderRadius: '1.2rem',
                border: '2px dashed var(--accent)',
                marginBottom: '2rem'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                <h3 style={{ color: 'var(--brown)', marginBottom: '1rem' }}>No Roadmap Available</h3>
                <p style={{ color: '#666', marginBottom: '2rem', lineHeight: '1.6' }}>
                  Complete the onboarding process to generate your personalized learning roadmap.
                </p>
                <button 
                  onClick={() => window.location.href = '/onboarding'}
                  style={{
                    background: 'var(--brown)',
                    color: 'white',
                    border: 'none',
                    padding: '1rem 2rem',
                    borderRadius: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}
                >
                  Complete Onboarding →
                </button>
              </div>
            ) : (
              <>
                <div className="weeks-grid">
                  {transformedWeeks.map((week, index) => {
                    const weekData = roadmapData[index];
                    const weekProgress = week.modules.map((_, moduleIndex) => getModuleStatus(index, moduleIndex));
                    const weekCompletion = weekProgress.filter(p => p.status === "Completed").length;
                    const weekPercentage = week.modules.length > 0 ? Math.floor((weekCompletion / week.modules.length) * 100) : 0;
                    
                    return (
                      <div key={index} className="week-card">
                        <div className="week-header" onClick={() => toggleWeek(index)}>
                          <div className="week-title-section">
                            <h3 className="week-title">Week {week.week}</h3>
                            {week.weeklyGoal ? (
                              <div className="week-progress-badge" style={{ background: 'var(--brown)' }}>{week.weeklyGoal}</div>
                            ) : (
                              <div className="week-progress-badge">{weekPercentage}%</div>
                            )}
                          </div>
                          <div aria-hidden className="expand-arrow" style={{ color: 'var(--brown)' }} onClick={(e) => { e.stopPropagation(); openWeekModal(index); }}>▼</div>
                        </div>

                        {expanded[index] && (
                          <div className="week-details">
                            <div style={{ display:'flex', justifyContent:'flex-end' }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleWeek(index); }}
                                style={{ background:'transparent', border:'none', color:'#666', cursor:'pointer', fontSize:'1rem' }}
                                aria-label="Close week details"
                              >✕</button>
                            </div>
                            {/* Week Overview */}
                            <div className="week-overview">
                              <h4>Week {week.week} Overview</h4>
                              <p className="week-description">
                                {weekData?.description || `Focus on ${weekData?.topics?.join(', ') || 'core concepts'} this week.`}
                              </p>
                              <div className="week-stats">
                                <span className="stat-item">
                                  <strong>{week.modules.length}</strong> modules
                                </span>
                                <span className="stat-item">
                                  <strong>{weekCompletion}</strong> completed
                                </span>
                                <span className="stat-item">
                                  <strong>{weekData?.topics?.length || 0}</strong> topics
                                </span>
                              </div>
                            </div>

                            {/* Modules */}
                            <div className="week-modules">
                              <h4>Learning Modules</h4>
                              {week.modules.map((module, moduleIndex) => {
                                const moduleStatus = getModuleStatus(index, moduleIndex);
                                return (
                                  <div key={moduleIndex} className="module-card">
                                    <div className="module-info">
                                      <div className="module-header">
                                        <span className="module-name">{module.name}</span>
                                        <span 
                                          className="module-status" 
                                          style={{ color: getStatusColor(moduleStatus.status) }}
                                        >
                                          {moduleStatus.status}
                                        </span>
                                      </div>
                                      <div className="module-description">
                                        {module.name.includes('SQL') && 'Learn database querying fundamentals'}
                                        {module.name.includes('Python') && 'Master Python programming basics'}
                                        {module.name.includes('Data') && 'Explore data analysis techniques'}
                                        {module.name.includes('Project') && 'Apply your skills in real-world scenarios'}
                                        {!module.name.includes('SQL') && !module.name.includes('Python') && !module.name.includes('Data') && !module.name.includes('Project') && 'Build practical skills and knowledge'}
                                      </div>
                                    </div>
                                    <div className="module-actions">
                                      <div className="progress-bar">
                                        <div 
                                          className="progress-fill" 
                                          style={{ 
                                            width: `${moduleStatus.progress}%`,
                                            backgroundColor: getStatusColor(moduleStatus.status)
                                          }}
                                        ></div>
                                      </div>
                                      {moduleStatus.status !== "Completed" && (
                                        <button 
                                          className="mark-done-btn"
                                          onClick={() => markModuleDone(index, moduleIndex, module.name)}
                                        >
                                          Mark Done
                                        </button>
                                      )}
                                      {moduleStatus.status === "Completed" && (
                                        <div className="completed-badge">
                                          ✓ Completed
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Week Resources */}
                            {weekData?.topics && (
                              <div className="week-resources">
                                <h4>Week Resources</h4>
                                <div className="resource-tags">
                                  {weekData.topics.map((topic, topicIndex) => (
                                    <span key={topicIndex} className="resource-tag">
                                      {topic}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Overall Progress Indicator */}
                <div className="overall-progress">
                  <div className="progress-summary">
                    <span>Overall Progress: {progressData.roadmapCompletion}%</span>
                    <span>{completedModules} of {totalModules} modules completed</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-indicator" style={{ left: `${progressData.roadmapCompletion}%` }}></div>
                  </div>
                </div>
              </>
            )}

            {/* Expanded Week Modal */}
            {expandedWeek !== null && (
              <div onClick={closeWeekModal} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'2rem'}}>
                <div onClick={(e)=>e.stopPropagation()} style={{background:'#fff',borderRadius:'1.2rem',boxShadow:'0 20px 60px rgba(0,0,0,0.3)',width:'min(900px, 96vw)',maxHeight:'90vh',overflowY:'auto',border:'1px solid #e0e3ea'}}>
                  {(() => {
                    const w = transformedWeeks[expandedWeek];
                    const wData = roadmapData[expandedWeek];
                    const wProgress = w.modules.map((_, mi) => getModuleStatus(expandedWeek, mi));
                    const wCompleted = wProgress.filter(p => p.status === 'Completed').length;
                    const wPct = w.modules.length ? Math.floor((wCompleted / w.modules.length) * 100) : 0;
                    return (
                      <>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1.2rem 1.4rem',borderBottom:'1px solid #e0e3ea'}}>
                          <div style={{display:'flex',alignItems:'center',gap:'0.8rem'}}>
                            <h2 style={{margin:0,color:'var(--brown)'}}>Week {w.week}</h2>
                            <div style={{background:'var(--brown)',color:'#fff',padding:'0.35rem 0.8rem',borderRadius:'1rem',fontWeight:600}}>{wPct}% Complete</div>
                          </div>
                          <button onClick={closeWeekModal} aria-label="Close" style={{background:'transparent',border:'none',cursor:'pointer',color:'#666',padding:'0.4rem',borderRadius:'0.4rem'}}>✕</button>
                        </div>
                        <div style={{padding:'1.2rem 1.4rem'}}>
                          <div style={{marginBottom:'1.2rem',padding:'1rem',background:'#fafafa',border:'1px solid #e0e3ea',borderRadius:'0.8rem'}}>
                            <h3 style={{margin:'0 0 0.6rem 0',color:'var(--brown)'}}>Overview</h3>
                            <p style={{margin:0,color:'#666',lineHeight:1.6}}>{wData?.description || `Focus on ${wData?.topics?.join(', ') || 'core concepts'} this week.`}</p>
                          </div>
                          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'1rem'}}>
                            {w.modules.map((m, mi) => {
                              const ms = getModuleStatus(expandedWeek, mi);
                              return (
                                <div key={mi} style={{background:'#fafafa',border:'1px solid #e0e3ea',borderRadius:'0.8rem',padding:'1rem'}}>
                                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.6rem'}}>
                                    <span style={{fontWeight:600,color:'#333'}}>{m.name}</span>
                                    <span style={{fontSize:'0.85rem',fontWeight:500,background:'#f0f0f0',padding:'0.2rem 0.6rem',borderRadius:'0.4rem',color:getStatusColor(ms.status)}}>{ms.status}</span>
                                  </div>
                                  <div style={{color:'#666',fontSize:'0.95rem',lineHeight:1.5,marginBottom:'0.7rem'}}>
                                    {m.name.includes('SQL') && 'Learn database querying fundamentals and practice with real-world examples'}
                                    {m.name.includes('Python') && 'Master Python basics and build your first applications'}
                                    {m.name.includes('Data') && 'Explore data analysis and visualization methods'}
                                    {m.name.includes('Project') && 'Apply your skills in a portfolio-ready project'}
                                    {!m.name.includes('SQL') && !m.name.includes('Python') && !m.name.includes('Data') && !m.name.includes('Project') && 'Build practical skills and knowledge'}
                                  </div>
                                  <div style={{display:'flex',alignItems:'center',gap:'0.8rem'}}>
                                    <div style={{flex:1,height:'6px',background:'#e0e3ea',borderRadius:'3px',overflow:'hidden'}}>
                                      <div style={{height:'100%',width:`${ms.progress}%`,background:getStatusColor(ms.status),borderRadius:'3px'}}></div>
                                    </div>
                                    {ms.status !== 'Completed' ? (
                                      <button onClick={() => markModuleDone(expandedWeek, mi, m.name)} style={{background:'var(--brown)',color:'#fff',border:'none',padding:'0.5rem 0.9rem',borderRadius:'0.6rem',fontWeight:600,cursor:'pointer'}}>Mark Done</button>
                                    ) : (
                                      <div style={{background:'#22c55e',color:'#fff',padding:'0.5rem 0.9rem',borderRadius:'0.6rem',fontWeight:600}}>✓ Completed</div>
                                    )}
              </div>
            </div>
          );
        })}
                          </div>
                          {wData?.topics && (
                            <div style={{marginTop:'1.2rem',padding:'1rem',background:'#fafafa',border:'1px solid #e0e3ea',borderRadius:'0.8rem'}}>
                              <h3 style={{margin:'0 0 0.8rem 0',color:'var(--brown)'}}>Week Resources</h3>
                              <div style={{display:'flex',flexWrap:'wrap',gap:'0.6rem'}}>
                                {wData.topics.map((t, ti) => (
                                  <span key={ti} style={{background:'#fff',border:'1px solid #e0e3ea',color:'#555',padding:'0.4rem 0.9rem',borderRadius:'1.2rem',fontSize:'0.9rem',fontWeight:500}}>{t}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="resources-content">
            <div className="resources-header">
              <h3 style={{ color: 'var(--brown)', marginBottom: '1rem' }}>Learning Resources</h3>
              <p style={{ color: '#666', marginBottom: '2rem' }}>
                Curated resources based on your roadmap topics: <strong>{onboardingData?.primarySkill || 'General Skills'}</strong>
              </p>
            </div>
            
            <div className="resources-filters">
              <select className="filter-dropdown">
                <option>All Types</option>
                <option>Video</option>
                <option>Course</option>
                <option>Article</option>
              </select>
              <select className="filter-dropdown">
                <option>All Levels</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
              <input 
                type="text" 
                placeholder="Search resources" 
                className="search-input"
              />
            </div>
            
            <div className="resources-grid">
              {transformedResources.map((resource, index) => (
                <div key={index} className="resource-card" style={{
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                  border: '1px solid #e0e3ea',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}>
                  <div className="resource-type" style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: resource.type === 'VIDEO' ? '#ff0000' : 
                               resource.type === 'COURSE' ? 'var(--brown)' : 
                               resource.type === 'BOOK' ? '#8d6748' : '#6b7280',
                    color: 'white',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '1rem',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    {resource.type}
                  </div>
                  
                  {resource.isSearchSuggestion && (
                    <div style={{
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      🔍 YouTube Search Suggestion
                    </div>
                  )}
                  
                  <div className="resource-content">
                    <h4 className="resource-title" style={{
                      color: 'var(--brown)',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      lineHeight: '1.4'
                    }}>
                      {resource.title}
                    </h4>
                    <p className="resource-source" style={{
                      color: '#8d6748',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      marginBottom: '0.8rem'
                    }}>
                      {resource.source}
                    </p>
                    <p className="resource-description" style={{
                      color: '#666',
                      fontSize: '0.95rem',
                      lineHeight: '1.5',
                      marginBottom: '1.2rem'
                    }}>
                      {resource.description}
                    </p>
                    {resource.url && (
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="resource-link"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          background: resource.isSearchSuggestion ? 
                            'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)' : 
                            'var(--brown)',
                          color: 'white',
                          padding: '0.8rem 1.5rem',
                          borderRadius: '0.8rem',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }}
                      >
                        {resource.isSearchSuggestion ? '🔍 Search YouTube' : '📖 View Resource'}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {transformedResources.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '3rem 2rem',
                background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
                borderRadius: '1.2rem',
                border: '2px dashed var(--accent)',
                marginTop: '2rem'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                <h3 style={{ color: 'var(--brown)', marginBottom: '1rem' }}>No Resources Available</h3>
                <p style={{ color: '#666', marginBottom: '2rem', lineHeight: '1.6' }}>
                  Complete the onboarding process to generate your personalized learning resources.
                </p>
                <button 
                  onClick={() => window.location.href = '/onboarding'}
                  style={{
                    background: 'var(--brown)',
                    color: 'white',
                    border: 'none',
                    padding: '1rem 2rem',
                    borderRadius: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}
                >
                  Complete Onboarding →
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="progress-content">
            <div className="progress-grid">
              {/* Skills/Topics Progress (from roadmap suggestions) */}
              <div className="progress-section">
                <h3>Skills Progress</h3>
                {progressData.skills.map((skill, index) => (
                  <div key={index} className="skill-progress">
                    <div className="skill-name">{skill.name}</div>
                    <div className="skill-bar">
                      <div 
                        className="skill-fill" 
                        style={{ width: `${skill.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Roadmap Completion */}
              <div className="progress-section">
                <h3>Roadmap Completion</h3>
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'1rem'}}>
                  {/* Centered ring */}
                  <div style={{
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    background: `conic-gradient(var(--brown) ${progressData.roadmapCompletion * 3.6}deg, #e5e7eb 0deg)`,
                    display: 'grid',
                    placeItems: 'center'
                  }}>
                    <div style={{
                      width: 92,
                      height: 92,
                      borderRadius: '50%',
                      background: '#fff',
                      display: 'grid',
                      placeItems: 'center',
                      color: 'var(--brown)',
                      fontWeight: 800
                    }}>{progressData.roadmapCompletion}%</div>
                  </div>
                </div>
                {/* Week completion progress */}
                <div style={{marginTop:'1rem'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,color:'#666',fontWeight:600}}>
                    <span>Weeks</span>
                    <span>{weeksCompletedCount}/{totalWeeksCount}</span>
                  </div>
                  <div style={{height:10, background:'#e5e7eb', borderRadius:6, overflow:'hidden'}}>
                    <div style={{width:`${weeksCompletionPct}%`, height:'100%', background:'var(--brown)'}}></div>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="progress-section">
                <h3>Achievements</h3>
                {progressData.achievements.map((achievement, index) => (
                  <div key={index} className="achievement-badge">
                    {achievement.icon} {achievement.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
