import React, { useState, useEffect, useRef } from 'react';
import './StoryBasedQuickActions.css';

function StoryBasedQuickActions({ onNav }) {
  const [isVisible, setIsVisible] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const sectionRef = useRef(null);

  const actions = [
    {
      id: 'resume-builder',
      path: '/resume-builder',
      emoji: '📝',
      icon: '✨',
      question: 'Tired of spending hours formatting your resume?',
      subQuestion: 'What if you could build a professional, ATS-ready resume in minutes?',
      story: 'Alex spent 3 hours adjusting margins and fonts, only to realize the ATS system rejected it. Sound familiar?',
      answer: 'With SkillFlux Resume Builder, create stunning resumes with real-time preview. No more formatting headaches.',
      color: '#8d6748',
      gradient: 'linear-gradient(135deg, #8d6748 0%, #bfae9e 100%)'
    },
    {
      id: 'resume-analysis',
      path: '/resume',
      emoji: '🔍',
      icon: '🎯',
      question: 'Wondering why your resume isn\'t getting callbacks?',
      subQuestion: 'Could your resume be failing the ATS test?',
      story: 'Jordan applied to 50 jobs but got zero responses. The problem? Missing ATS keywords and poor formatting.',
      answer: 'Get instant AI-powered feedback with our Resume Analysis. Know exactly what\'s wrong and how to fix it.',
      color: '#bfae9e',
      gradient: 'linear-gradient(135deg, #bfae9e 0%, #a89f91 100%)'
    },
    {
      id: 'generate-plan',
      path: '/onboarding',
      emoji: '🗺️',
      icon: '🚀',
      question: 'Feeling lost in a sea of online courses?',
      subQuestion: 'Which skills actually matter for your dream job?',
      story: 'Taylor tried 10 different courses but still felt directionless. "What should I learn next?" became a daily question.',
      answer: 'Get a personalized learning roadmap tailored to your career goals. Know exactly what to learn and when.',
      color: '#a89f91',
      gradient: 'linear-gradient(135deg, #a89f91 0%, #c7b299 100%)'
    },
    {
      id: 'roadmap',
      path: '/roadmap',
      emoji: '📚',
      icon: '💡',
      question: 'Learning without seeing progress?',
      subQuestion: 'How do you know if you\'re on the right track?',
      story: 'Mia watched tutorials for weeks but couldn\'t connect the dots. "Am I learning the right things?" she wondered.',
      answer: 'Follow a structured, week-by-week learning plan with curated resources. Track your progress and stay motivated.',
      color: '#c7b299',
      gradient: 'linear-gradient(135deg, #c7b299 0%, #8d6748 100%)'
    },
    {
      id: 'tech-news',
      path: '/news',
      emoji: '📰',
      icon: '⚡',
      question: 'Feeling outdated in tech interviews?',
      subQuestion: 'Are you missing the latest industry trends?',
      story: 'Sam felt embarrassed in interviews. "I didn\'t know about that framework!" became a recurring nightmare.',
      answer: 'Stay current with curated tech news and industry insights. Never feel out of the loop again.',
      color: '#8d6748',
      gradient: 'linear-gradient(135deg, #8d6748 0%, #bfae9e 100%)'
    },
    {
      id: 'aptitude',
      path: '/aptitude',
      emoji: '🧠',
      icon: '🏆',
      question: 'Dreading those aptitude test rounds?',
      subQuestion: 'What if you could master logical reasoning?',
      story: 'Priya aced coding interviews but failed logical reasoning. "I wish I had practiced more," she thought.',
      answer: 'Master logical, quantitative, and verbal skills with interactive practice. Build confidence before the real test.',
      color: '#bfae9e',
      gradient: 'linear-gradient(135deg, #bfae9e 0%, #a89f91 100%)'
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const handleActionClick = (path) => {
    onNav(path);
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section ref={sectionRef} className="story-quick-actions-modern">
      <div className="story-qa-modern-container">
        <div className="story-header-section">
          <h2 className="story-qa-modern-title">Questions That Lead to Solutions</h2>
          <p className="story-qa-modern-subtitle">
            Every great career journey starts with the right questions. Click to explore answers.
          </p>
        </div>

        {/* Timeline Structure - Similar to AboutUs */}
        <div className="story-timeline-wrapper">
          {/* Vertical Timeline Line */}
          <div className={`story-timeline-line ${isVisible ? 'animate' : ''}`}></div>

          {/* Timeline Items */}
          {actions.map((action, index) => {
            const isLeft = index % 2 === 0;
            const isExpanded = expandedIndex === index;
            const animationDelay = 0.2 + (index * 0.15);

            return (
              <div
                key={action.id}
                className={`story-timeline-item ${isLeft ? 'left' : 'right'} ${isVisible ? 'visible' : ''} ${isExpanded ? 'expanded' : ''}`}
                style={{ 
                  '--delay': `${animationDelay}s`, 
                  '--action-color': action.color,
                  '--action-gradient': action.gradient
                }}
                onClick={() => toggleExpand(index)}
              >
                {/* Timeline Node */}
                <div className="story-timeline-node">
                  <div className="story-node-icon-wrapper">
                    <div className="story-node-icon">{action.emoji}</div>
                    <div className="story-node-pulse"></div>
                    <div className="story-node-ring"></div>
                  </div>
                </div>

                {/* Question Card */}
                <div className={`story-question-card ${isExpanded ? 'expanded' : ''}`}>
                  {/* Question Section */}
                  <div className="question-section">
                    <div className="question-mark">?</div>
                    <div className="question-content">
                      <h3 className="question-main">{action.question}</h3>
                      <p className="question-sub">{action.subQuestion}</p>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <div className={`expanded-content ${isExpanded ? 'show' : ''}`}>
                    {/* Story Section */}
                    <div className="story-section">
                      <div className="story-icon">💭</div>
                      <p className="story-text">{action.story}</p>
                    </div>

                    {/* Answer Section */}
                    <div className="answer-section">
                      <div className="answer-icon">{action.icon}</div>
                      <div className="answer-content">
                        <div className="answer-label">The Answer</div>
                        <p className="answer-text">{action.answer}</p>
                        <button
                          className="answer-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionClick(action.path);
                          }}
                        >
                          <span>Explore {action.id.replace('-', ' ')}</span>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expand Indicator */}
                  <div className="expand-indicator">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Access Footer */}
        <div className={`story-quick-footer ${isVisible ? 'visible' : ''}`}>
          <div className="footer-label">Or jump directly to:</div>
          <div className="footer-items">
            {actions.map((action) => (
              <button
                key={action.id}
                className="footer-item"
                onClick={(e) => {
                  e.stopPropagation && e.stopPropagation();
                  handleActionClick(action.path);
                }}
                style={{ '--item-color': action.color }}
              >
                <span className="footer-icon">{action.emoji}</span>
                <span className="footer-text">{action.id.replace('-', ' ')}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default StoryBasedQuickActions;
