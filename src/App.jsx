import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp } from '@clerk/clerk-react';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Collections from './pages/Collections';
import CollectionDetail from './pages/CollectionDetail';
import LandingPage from './pages/LandingPage';

function App() {
    return (
        <Routes>
            <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
            <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />

            <Route path="/" element={<LandingPage />} />

            <Route path="/app" element={
                <>
                    <SignedIn>
                        <MainLayout />
                    </SignedIn>
                    <SignedOut>
                        <RedirectToSignIn />
                    </SignedOut>
                </>
            }>
                <Route index element={<Dashboard />} />
                <Route path="category/:category" element={<Dashboard />} />
                <Route path="favorites" element={<Dashboard />} />
                <Route path="collections" element={<Collections />} />
                <Route path="collections/:id" element={<CollectionDetail />} />
                <Route path="*" element={<Navigate to="/app" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
