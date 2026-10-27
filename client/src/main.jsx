import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { FeedbackProvider } from './context/FeedbackContext';
// Fonts are bundled with the site (no requests to Google Fonts)
import '@fontsource-variable/manrope';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <FeedbackProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </FeedbackProvider>
    </BrowserRouter>
  </React.StrictMode>
);
