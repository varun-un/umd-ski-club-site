// App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './HomePage';
import TripPage from './TripPage';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

export interface User {
    name: string;
    email: string;
    accessToken: string;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const AuthenticatedApp: React.FC<{ user: User | null; setUser: (user: User | null) => void }> = ({ user, setUser }) => {
    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            const accessToken = tokenResponse.access_token;

            // Fetch user profile information using the access token.
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const userInfo = await userInfoResponse.json();

            console.log("Access Token:", accessToken);

            const userData: User = {
                name: userInfo.name,
                email: userInfo.email,
                accessToken: accessToken,
            };
            setUser(userData);
        },
        onError: (error) => {
            console.error('Google Login Failed:', error);
        },
        scope: 'openid email profile', // Request necessary scopes
    });

    return (
        <Router>
            <div style={{ padding: '1rem' }}>
                {!user ? (
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <h2>Please sign in with Google</h2>
                        <button onClick={() => login()}>Sign in with Google</button>
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
    );
};

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AuthenticatedApp user={user} setUser={setUser} />
        </GoogleOAuthProvider>
    );
};

export default App;
