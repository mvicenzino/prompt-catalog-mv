import { Routes, Route, Navigate } from 'react-router-dom';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { Toaster } from 'sonner';
import Dashboard from './pages/Dashboard';
import Collections from './pages/Collections';
import CollectionDetail from './pages/CollectionDetail';
import Settings from './pages/Settings';
import LandingPage from './pages/LandingPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import SharedPrompt from './pages/SharedPrompt';
import ProtectedLayout from './components/ProtectedLayout';

function App() {
    return (
        <>
            <Toaster
                position="bottom-right"
                richColors
                theme="dark"
                toastOptions={{
                    style: {
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                    },
                }}
            />
            <Routes>
                <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
                <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />

                <Route path="/" element={<LandingPage />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/p/:shareId" element={<SharedPrompt />} />

                <Route path="/app" element={<ProtectedLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="category/:category" element={<Dashboard />} />
                    <Route path="favorites" element={<Dashboard />} />
                    <Route path="collections" element={<Collections />} />
                    <Route path="collections/:id" element={<CollectionDetail />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/app" replace />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}

export default App;

