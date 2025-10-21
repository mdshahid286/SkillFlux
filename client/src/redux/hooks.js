import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Hook to save state to localStorage on change
export const useSaveStateToLocalStorageOnChange = () => {
  const resume = useAppSelector((state) => state.resume);
  const settings = useAppSelector((state) => state.settings);

  useEffect(() => {
    const stateToSave = { resume, settings };
    localStorage.setItem('resume-builder-state', JSON.stringify(stateToSave));
  }, [resume, settings]);
};

// Hook to initialize store from localStorage
export const useSetInitialStore = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const savedState = localStorage.getItem('resume-builder-state');
    if (savedState) {
      try {
        const { resume, settings } = JSON.parse(savedState);
        if (resume) {
          dispatch({ type: 'resume/setResume', payload: resume });
        }
        if (settings) {
          dispatch({ type: 'settings/setSettings', payload: settings });
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    }
  }, [dispatch]);
};

