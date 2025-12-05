import React from 'react';
import { useAuth, RedirectToSignIn } from '@clerk/clerk-react';
import MainLayout from '../layouts/MainLayout';

const ProtectedLayout = () => {
    const { isSignedIn, isLoaded } = useAuth();

    if (!isLoaded) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-app)' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!isSignedIn) {
        return <RedirectToSignIn />;
    }

    return <MainLayout />;
};

export default ProtectedLayout;
