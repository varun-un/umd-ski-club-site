// App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './HomePage';
import TripPage from './TripPage';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

import { jwtDecode } from 'jwt-decode';

export interface User {
  name: string;
  email: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  /**
   * Handles a successful Google login.
   * The credential returned is a JWT that we decode to extract the user's name and email.
   */
  const handleGoogleLoginSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      try {
        // Decode the JWT to get user information
        const decoded: any = jwtDecode(credentialResponse.credential);
        const userInfo: User = {
          name: decoded.name,
          email: decoded.email,
        };
        setUser(userInfo);
      } catch (error) {
        console.error('Failed to decode JWT:', error);
      }
    }
  };

  /**
   * Handles a failed Google login.
   */
  const handleGoogleLoginError = () => {
    console.error('Google Login Failed');
  };

  return (
    // Wrap your app in the GoogleOAuthProvider and supply your Client ID.
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
        <div style={{ padding: '1rem' }}>
          {!user ? (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <h2>Please sign in with Google</h2>
              {/* 
                GoogleLogin component renders the sign‑in button.
                onSuccess and onError handle the login result.
              */}
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
              />
            </div>
          ) : (
            <>
              <nav style={{ marginBottom: '1rem' }}>
                <Link to="/">Home</Link>
              </nav>
              <Routes>
                <Route path="/" element={<HomePage user={user} />} />
                <Route path="/trip/:tripName" element={<TripPage user={user} />} />
              </Routes>
            </>
          )}
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
