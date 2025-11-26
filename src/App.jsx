import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Collections from './pages/Collections';
import CollectionDetail from './pages/CollectionDetail';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="category/:category" element={<Dashboard />} />
                    <Route path="favorites" element={<Dashboard />} />
                    <Route path="collections" element={<Collections />} />
                    <Route path="collections/:id" element={<CollectionDetail />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
