import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { store } from '../redux/store';
import { ResumeForm } from '../components/ResumeForm';
import { Resume } from '../components/Resume';
import { setResume } from '../redux/resumeSlice';
import { setSettings } from '../redux/settingsSlice';

// Inner component that has access to the store
const ResumeBuilderContent = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const loadFromFirebase = async () => {
      if (!user) return;

      try {
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
      } catch (error) {
        console.error('Error loading resume from Firebase:', error);
      }
    };

    loadFromFirebase();
  }, [user]);

  const saveToFirebase = async () => {
    if (!user) return;

    try {
      const state = store.getState();
      const docRef = doc(db, 'resumes', user.uid);
      await setDoc(docRef, {
        resume: state.resume,
        settings: state.settings,
        lastModified: new Date().toISOString()
      });
      alert('Resume saved successfully!');
    } catch (error) {
      console.error('Error saving resume:', error);
      alert('Failed to save resume');
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
              OpenResume Style
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={saveToFirebase}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              Save to Cloud
            </button>
            <button
              onClick={() => navigate('/resume')}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              Back to Analysis
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Split View */}
      <main className="relative flex h-full w-full overflow-hidden">
        <div className="grid h-full w-full grid-cols-1 md:grid-cols-2">
          {/* Left Panel - Form */}
          <div className="col-span-1 border-r border-gray-200 bg-gray-50">
            <ResumeForm />
          </div>

          {/* Right Panel - Preview */}
          <div className="col-span-1 bg-gray-100">
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

