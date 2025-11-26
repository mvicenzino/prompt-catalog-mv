import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AddPromptModal from '../components/AddPromptModal';

const MainLayout = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="layout">
            <Sidebar
                onAddPrompt={() => {
                    setIsModalOpen(true);
                    setIsSidebarOpen(false);
                }}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 40,
                        display: 'none' // Hidden by default, shown in media query
                    }}
                />
            )}

            <main className="main-content">
                <button
                    className="btn btn-ghost icon-only mobile-menu-btn"
                    onClick={() => setIsSidebarOpen(true)}
                    style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 30, display: 'none' }}
                >
                    <Menu size={24} />
                </button>
                <Outlet />
            </main>
            <AddPromptModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default MainLayout;
