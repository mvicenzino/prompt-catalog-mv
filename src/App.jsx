import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp } from '@clerk/clerk-react';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Collections from './pages/Collections';
import CollectionDetail from './pages/CollectionDetail';

function App() {
    return (
        <Routes>
            <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
            <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />

            <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="category/:category" element={<Dashboard />} />
                <Route path="favorites" element={
                    <>
                        <SignedIn>
                            <Dashboard />
                        </SignedIn>
                        <SignedOut>
                            <RedirectToSignIn />
                        </SignedOut>
                    </>
                } />
                <Route path="collections" element={
                    <>
                        <SignedIn>
                            <Collections />
                        </SignedIn>
                        <SignedOut>
                            <RedirectToSignIn />
                        </SignedOut>
                    </>
                } />
                <Route path="collections/:id" element={
                    <>
                        <SignedIn>
                            <CollectionDetail />
                        </SignedIn>
                        <SignedOut>
                            <RedirectToSignIn />
                        </SignedOut>
                    </>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}

export default App;
