// API Configuration - automatically uses environment variable or defaults
const getApiUrl = () => {
  // In production, use environment variable
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  // In development, use proxy or localhost
  if (process.env.NODE_ENV === 'development') {
    return ''; // Uses proxy from package.json
  }
  // Fallback (will be set by deployment platform)
  return '';
};

export const API_BASE_URL = getApiUrl();

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};

