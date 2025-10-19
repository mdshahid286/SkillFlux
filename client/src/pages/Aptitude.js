import React, { useState, useEffect, useCallback } from 'react';
import './Aptitude.css';

export default function Aptitude() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('general');
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userAnswer, setUserAnswer] = useState(null);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [answers, setAnswers] = useState([]); // array of {answer, correct}
  const [timeSpent, setTimeSpent] = useState(0);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [hasSavedSession, setHasSavedSession] = useState(false);
  const [historySummary, setHistorySummary] = useState({ attempts: 0, bestScore: null, bestTime: null });
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyEntries, setHistoryEntries] = useState([]);

  const categories = [
    { id: 'general', name: 'General', icon: '🧩', color: '#8B4513' },
    { id: 'quantitative', name: 'Quantitative', icon: '🔢', color: '#2E8B57' },
    { id: 'logical', name: 'Logical', icon: '🧠', color: '#4169E1' },
    { id: 'verbal', name: 'Verbal', icon: '🗣️', color: '#DC143C' }
  ];

  // Keys
  const sessionKey = `aptitude_session_${category}`;
  const historyKey = 'aptitude_history';

  // Timer effect
  useEffect(() => {
    let interval;
    if (questions.length > 0 && !showSummary) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [questions.length, showSummary]);

  // Load resume availability and history on category change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(sessionKey);
      setHasSavedSession(!!saved);
      setShowResumePrompt(!!saved);
    } catch (_) {}

    // load history summary
    try {
      const raw = localStorage.getItem(historyKey);
      if (raw) {
        const map = JSON.parse(raw) || {};
        const arr = Array.isArray(map[category]) ? map[category] : [];
        setHistoryEntries(arr);
        const attempts = arr.length;
        const bestScore = attempts ? Math.max(...arr.map(a => a.score)) : null;
        const bestTime = attempts ? Math.min(...arr.map(a => a.timeSpent)) : null;
        setHistorySummary({ attempts, bestScore, bestTime });
      } else {
        setHistorySummary({ attempts: 0, bestScore: null, bestTime: null });
        setHistoryEntries([]);
      }
    } catch (_) {
      setHistorySummary({ attempts: 0, bestScore: null, bestTime: null });
      setHistoryEntries([]);
    }
    // eslint-disable-next-line
  }, [category]);

  // Fetch questions from backend
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError('');
    setQuestions([]);
    setShowSummary(false);
    setScore(0);
    setAnswers([]);
    setSelectedQuestion(0);
    setUserAnswer(null);
    setShowResult(false);
    setResult(null);
    setTimeSpent(0);
    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
      const res = await fetch(`${baseUrl}/api/aptitude-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, count: 20 }),
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.questions) || !data.questions.length) {
        throw new Error(data.error || 'No questions found');
      }
      setQuestions(data.questions);
      setSelectedQuestion(0);
    } catch (e) {
      setError('Failed to load questions for this category. Try again.');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    // If a saved session exists, prompt to resume instead of auto-fetch
    try {
      const saved = localStorage.getItem(sessionKey);
      if (saved) {
        setLoading(false);
        return; // wait for user choice
      }
    } catch (_) {}
    fetchQuestions();
    // eslint-disable-next-line
  }, [category]);

  const handleCategoryChange = (id) => {
    setCategory(id);
    // States auto-reset by fetchQuestions
  };

  // Resume / Start New
  const handleResume = () => {
    try {
      const raw = localStorage.getItem(sessionKey);
      if (!raw) return;
      const saved = JSON.parse(raw);
      setQuestions(saved.questions || []);
      setSelectedQuestion(saved.selectedQuestion || 0);
      setAnswers(saved.answers || []);
      setUserAnswer(saved.userAnswer ?? null);
      setShowResult(saved.showResult || false);
      setResult(saved.result ?? null);
      setScore(saved.score || 0);
      setShowSummary(saved.showSummary || false);
      setTimeSpent(saved.timeSpent || 0);
      setError('');
    } catch (_) {}
    setShowResumePrompt(false);
    setLoading(false);
  };

  const handleStartNew = () => {
    // clear and fetch fresh
    try { localStorage.removeItem(sessionKey); } catch (_) {}
    setShowResumePrompt(false);
    fetchQuestions();
  };

  const handleOptionClick = (option) => {
    if (!showResult) setUserAnswer(option);
  };

  const handleCheckAnswer = () => {
    if (!questions[selectedQuestion]) return;
    const correct = questions[selectedQuestion].answer;
    const isCorrect = userAnswer === correct;
    setShowResult(true);
    setResult(isCorrect);
    setAnswers(prev => {
      const next = [...prev];
      next[selectedQuestion] = { answer: userAnswer, correct: isCorrect };
      return next;
    });
    if (isCorrect) setScore(prev => prev + 1);
  };

  const handleNext = () => {
    if (selectedQuestion < questions.length - 1) {
      setSelectedQuestion(selectedQuestion + 1);
      setShowResult(false);
      setResult(null);
      setUserAnswer(answers[selectedQuestion + 1]?.answer ?? null);
    } else {
      setShowSummary(true);
    }
  };

  const handleRetry = () => {
    fetchQuestions();
  };

  // Auto-save session while in progress
  useEffect(() => {
    if (!questions.length || showSummary) return;
    try {
      const snapshot = {
        category,
        questions,
        selectedQuestion,
        answers,
        userAnswer,
        showResult,
        result,
        score,
        timeSpent,
        showSummary,
        savedAt: Date.now()
      };
      localStorage.setItem(sessionKey, JSON.stringify(snapshot));
    } catch (_) {}
  }, [category, questions, selectedQuestion, answers, userAnswer, showResult, result, score, timeSpent, showSummary, sessionKey]);

  // Record history on completion
  useEffect(() => {
    if (!showSummary || !questions.length) return;
    // Clear session
    try { localStorage.removeItem(sessionKey); } catch (_) {}

    try {
      const raw = localStorage.getItem(historyKey);
      const map = raw ? JSON.parse(raw) : {};
      const arr = Array.isArray(map[category]) ? map[category] : [];
      const entry = { score, total: questions.length, timeSpent, date: Date.now() };
      const next = [entry, ...arr].slice(0, 50);
      map[category] = next;
      localStorage.setItem(historyKey, JSON.stringify(map));

      // update summary
      const attempts = next.length;
      const bestScore = Math.max(...next.map(a => a.score));
      const bestTime = Math.min(...next.map(a => a.timeSpent));
      setHistorySummary({ attempts, bestScore, bestTime });
      setHistoryEntries(next);
    } catch (_) {}
    // eslint-disable-next-line
  }, [showSummary]);

  const openHistory = () => {
    try {
      const raw = localStorage.getItem(historyKey);
      const map = raw ? JSON.parse(raw) : {};
      const arr = Array.isArray(map[category]) ? map[category] : [];
      setHistoryEntries(arr);
    } catch (_) {}
    setShowHistoryModal(true);
  };

  const closeHistory = () => setShowHistoryModal(false);

  const handleQuestionJump = (index) => {
    if (index >= 0 && index < questions.length) {
      setSelectedQuestion(index);
      setShowResult(false);
      setResult(null);
      setUserAnswer(answers[index]?.answer ?? null);
    }
  };

  const getQuestionStatus = (index) => {
    if (answers[index]) {
      return answers[index].correct ? 'correct' : 'incorrect';
    }
    return 'unanswered';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return questions.length > 0 ? ((selectedQuestion + 1) / questions.length) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="aptitude-page">
        <div className="aptitude-container">
          <div className="loading-section">
            <div className="loading-spinner">🧩</div>
            <h2>Loading Aptitude Questions...</h2>
            <p>Preparing your personalized quiz experience</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="aptitude-page">
      <div className="aptitude-container">
        {/* Header Section */}
        <div className="aptitude-header">
          <div className="header-content">
            <h1 className="main-title">Aptitude Practice</h1>
            <p className="subtitle">Sharpen your skills with AI-generated practice questions!</p>
            <div className="stats-section">
              <div className="stat-card">
                <div className="stat-label">Attempts</div>
                <div className="stat-value">{historySummary.attempts}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Best Score</div>
                <div className="stat-value">{historySummary.bestScore ?? '-'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Best Time</div>
                <div className="stat-value">{historySummary.bestTime != null ? formatTime(historySummary.bestTime) : '-'}</div>
              </div>
              <button className="history-button" onClick={openHistory}>History</button>
            </div>
          </div>
          {questions.length > 0 && !showSummary && (
            <div className="timer-section">
              <div className="timer-display">
                <span className="timer-icon">⏱️</span>
                <span className="timer-text">{formatTime(timeSpent)}</span>
              </div>
            </div>
          )}
        </div>

        {showHistoryModal && (
          <div className="modal-overlay" onClick={closeHistory}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">{categories.find(c => c.id === category)?.name} History</h3>
                <button className="modal-close" onClick={closeHistory}>✖</button>
              </div>
              <div className="modal-content">
                {historyEntries.length === 0 ? (
                  <div className="empty-history">No attempts recorded yet.</div>
                ) : (
                  <div className="history-list">
                    {historyEntries.map((h, idx) => (
                      <div key={idx} className="history-item">
                        <div className="history-row">
                          <div className="history-meta">
                            <div className="history-date">{new Date(h.date).toLocaleString()}</div>
                          </div>
                          <div className="history-badges">
                            <span className="badge score">Score: {h.score}/{h.total}</span>
                            <span className="badge time">Time: {formatTime(h.timeSpent)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button className="modal-close-btn" onClick={closeHistory}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Category Selection Section */}
        <div className="category-section">
          <h3 className="section-title">Choose Your Category</h3>
          <div className="category-grid">
            {categories.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => handleCategoryChange(cat.id)} 
                className={`category-card ${cat.id === category ? 'active' : ''}`}
                style={{ '--category-color': cat.color }}
                disabled={loading}
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
              </button>
            ))}
          </div>
          {showResumePrompt && hasSavedSession && (
            <div className="resume-banner">
              <div className="resume-text">You have an unfinished quiz in {categories.find(c => c.id === category)?.name}. Would you like to resume?</div>
              <div className="resume-actions">
                <button className="resume-button" onClick={handleResume}>Resume</button>
                <button className="startnew-button" onClick={handleStartNew}>Start New</button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="error-section">
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          </div>
        )}
        {showSummary ? (
          <div className="results-section">
            <div className="results-header">
              <div className="completion-icon">🏁</div>
              <h2 className="completion-title">Quiz Complete!</h2>
              <div className="score-display">
                <span className="score-label">Your Score:</span>
                <span className="score-value">{score} / {questions.length}</span>
              </div>
              <div className="time-display">
                <span className="time-label">Time Taken:</span>
                <span className="time-value">{formatTime(timeSpent)}</span>
              </div>
            </div>
            
            <div className="results-breakdown">
              <h3 className="breakdown-title">Question Review</h3>
              <div className="questions-review">
                {questions.map((q, i) => (
                  <div key={i} className={`question-review-card ${getQuestionStatus(i)}`}>
                    <div className="question-header">
                      <span className="question-number">Q{i+1}</span>
                      <span className="question-status-icon">
                        {getQuestionStatus(i) === 'correct' ? '✅' : 
                         getQuestionStatus(i) === 'incorrect' ? '❌' : '⏸️'}
                      </span>
                    </div>
                    <div className="question-text">{q.question}</div>
                    <div className="answer-section">
                      <div className="user-answer">
                        <strong>Your Answer:</strong> 
                        {answers[i]?.answer ? (
                          <span className={`answer-text ${answers[i].correct ? 'correct' : 'incorrect'}`}>
                            {answers[i].answer}
                          </span>
                        ) : (
                          <span className="answer-text unanswered">Not answered</span>
                        )}
                      </div>
                      <div className="correct-answer">
                        <strong>Correct Answer:</strong> 
                        <span className="answer-text correct">{q.answer}</span>
                      </div>
                    </div>
                    <div className="explanation">
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="results-actions">
              <button onClick={handleRetry} className="retry-button">
                <span className="button-icon">🔄</span>
                Retry Quiz
              </button>
            </div>
          </div>
        ) : questions.length === 0 ? (
          <div className="no-questions-section">
            <div className="no-questions-content">
              <div className="no-questions-icon">📝</div>
              <h3>No Questions Available</h3>
              <p>No questions are available for this category at the moment.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Progress Section */}
            <div className="progress-section">
              <div className="progress-header">
                <h3 className="section-title">Quiz Progress</h3>
                <div className="progress-stats">
                  <span className="progress-text">
                    Question {selectedQuestion + 1} of {questions.length}
                  </span>
                  <span className="progress-percentage">
                    {Math.round(getProgressPercentage())}%
                  </span>
                </div>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>

            {/* Question Tracker */}
            <div className="question-tracker-section">
              <h4 className="tracker-title">Question Navigator</h4>
              <div className="question-tracker">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionJump(index)}
                    className={`question-indicator ${index === selectedQuestion ? 'current' : ''} ${getQuestionStatus(index)}`}
                    title={`Question ${index + 1} - ${getQuestionStatus(index)}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <div className="tracker-legend">
                <div className="legend-item">
                  <span className="legend-color correct"></span>
                  <span>Correct</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color incorrect"></span>
                  <span>Incorrect</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color unanswered"></span>
                  <span>Unanswered</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color current"></span>
                  <span>Current</span>
                </div>
              </div>
            </div>

            {/* Main Question Section */}
            <div className="question-section">
              <div className="question-card">
                <div className="question-header">
                  <span className="question-number">Question {selectedQuestion + 1}</span>
                  <span className="question-category">
                    {categories.find(cat => cat.id === category)?.icon} 
                    {categories.find(cat => cat.id === category)?.name}
                  </span>
                </div>
                <h3 className="question-text">{questions[selectedQuestion].question}</h3>
                
                <div className="options-grid">
                  {questions[selectedQuestion].options.map((opt, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleOptionClick(opt)} 
                      className={`option-button ${userAnswer === opt ? 'selected' : ''} ${showResult ? 'disabled' : ''}`}
                      disabled={showResult}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <div className="question-actions">
                  <button 
                    onClick={handleCheckAnswer} 
                    disabled={userAnswer == null || showResult} 
                    className="check-button"
                  >
                    Check Answer
                  </button>
                </div>

                {showResult && (
                  <div className="result-feedback">
                    <div className={`feedback-message ${result ? 'correct' : 'incorrect'}`}>
                      {result ? (
                        <>
                          <span className="feedback-icon">✅</span>
                          <span className="feedback-text">Correct!</span>
                        </>
                      ) : (
                        <>
                          <span className="feedback-icon">❌</span>
                          <span className="feedback-text">Incorrect</span>
                        </>
                      )}
                    </div>
                    
                    <div className="explanation-section">
                      <div className="explanation-text">
                        <strong>Explanation:</strong> {questions[selectedQuestion].explanation}
                      </div>
                      <div className="correct-answer-display">
                        <strong>Correct Answer:</strong> {questions[selectedQuestion].answer}
                      </div>
                    </div>

                    <button 
                      onClick={handleNext} 
                      className="next-button"
                    >
                      {selectedQuestion < questions.length - 1 ? (
                        <>
                          <span>Next Question</span>
                          <span className="button-arrow">➡️</span>
                        </>
                      ) : (
                        <>
                          <span>Finish & See Results</span>
                          <span className="button-arrow">🏁</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
