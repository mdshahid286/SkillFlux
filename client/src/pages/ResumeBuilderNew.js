import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { store } from '../redux/store';
import { ResumeForm } from '../components/ResumeForm';
import { Resume } from '../components/Resume';
import { setResume, changeProfile } from '../redux/resumeSlice';
import { setSettings } from '../redux/settingsSlice';

// Inner component that has access to the store
const ResumeBuilderContent = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;
  const [targetRole, setTargetRole] = useState('');

  useEffect(() => {
    const loadFromFirebase = async () => {
      if (!user) return;

      try {
        // Load resume data
        const docRef = doc(db, 'resumes', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.resume) {
            store.dispatch(setResume(data.resume));
          }
          if (data.settings) {
            store.dispatch(setSettings(data.settings));
          }
        }

        // Load user profile data to get target role/career aspiration
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const profile = userData.profile || {};
          const onboarding = profile.onboarding || {};
          
          // Get target role from onboarding (careerAspiration) or profile (targetRole)
          const careerAspiration = onboarding.careerAspiration || profile.targetRole || '';
          setTargetRole(careerAspiration);

          // If resume summary is empty and we have a target role, pre-populate it
          const currentResume = store.getState().resume;
          if (!currentResume.profile.summary && careerAspiration) {
            store.dispatch(changeProfile({ 
              field: 'summary', 
              value: `Seeking a ${careerAspiration} position where I can apply my skills and contribute to innovative projects.` 
            }));
          }
        }
      } catch (error) {
        console.error('Error loading data from Firebase:', error);
      }
    };

    loadFromFirebase();
  }, [user]);


  return (
    <div className="resume-builder-new-page">
      {/* Combined Header with Navigation */}
      <header className="resume-builder-header-new">
        <div className="header-content">
          <div className="header-left">
            <div className="header-nav-buttons">
              <button className="nav-btn" onClick={() => navigate('/')} title="Home">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Home
              </button>
            </div>
            <h1 className="header-title">RESUME BUILDER</h1>
            {targetRole && (
              <span className="header-badge">
                🎯 Target: {targetRole}
              </span>
            )}
            {!targetRole && (
              <span className="header-badge">
                ✨ Professional Templates
              </span>
            )}
          </div>
          <div className="header-actions">
          </div>
        </div>
      </header>

      {/* Main Content - Split View */}
      <main className="resume-builder-main">
        <div className="resume-builder-grid">
          {/* Left Panel - Form */}
          <div className="resume-builder-form-panel">
            <ResumeForm />
          </div>

          {/* Divider */}
          <div className="resume-builder-divider"></div>

          {/* Right Panel - Preview */}
          <div className="resume-builder-preview-panel">
            <Resume />
          </div>
        </div>
      </main>
    </div>
  );
};

// Main component with Redux Provider
export default function ResumeBuilderNew() {
  return (
    <Provider store={store}>
      <ResumeBuilderContent />
    </Provider>
  );
}

