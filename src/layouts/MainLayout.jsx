import { useState, useRef, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/clerk-react';
import Sidebar from '../components/Sidebar';
import AddPromptModal from '../components/AddPromptModal';
import PromptBuilder from '../components/PromptBuilder';
import NotificationDropdown from '../components/NotificationDropdown';

const MainLayout = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobileNotificationOpen, setIsMobileNotificationOpen] = useState(false);
    const mobileNotificationRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mobileNotificationRef.current && !mobileNotificationRef.current.contains(event.target)) {
                setIsMobileNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="layout">
            <Sidebar
                onAddPrompt={() => {
                    setIsModalOpen(true);
                    setIsSidebarOpen(false);
                }}
                onOpenBuilder={() => {
                    setIsBuilderOpen(true);
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

            {/* Mobile Header */}
            <div className="mobile-header" style={{
                display: 'none',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '60px',
                background: 'var(--bg-app)',
                borderBottom: '1px solid var(--border-subtle)',
                zIndex: 30,
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1rem',
                overflow: 'visible', // Changed from hidden to allow dropdown
                pointerEvents: 'none' // Prevent blocking clicks
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', pointerEvents: 'auto' }}>
                    <button
                        className="btn btn-ghost icon-only"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                    <div className="logo" style={{ fontSize: '1.1rem' }}>
                        <img src="/logo.svg" alt="Logo" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
                        <span className="logo-text">Prompt<span className="text-accent">Pal</span></span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', pointerEvents: 'auto' }}>
                    <div className="notification-container" ref={mobileNotificationRef} style={{ position: 'relative' }}>
                        <button
                            className={`btn btn-ghost icon-only ${isMobileNotificationOpen ? 'active' : ''}`}
                            onClick={() => setIsMobileNotificationOpen(!isMobileNotificationOpen)}
                        >
                            <Bell size={20} />
                            <span className="notification-badge" />
                        </button>
                        <NotificationDropdown
                            isOpen={isMobileNotificationOpen}
                            onClose={() => setIsMobileNotificationOpen(false)}
                        />
                    </div>

                    <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="btn btn-primary sm">Sign In</button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </div>

            <main className="main-content">
                <Outlet />
            </main>
            <AddPromptModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <PromptBuilder isOpen={isBuilderOpen} onClose={() => setIsBuilderOpen(false)} />
        </div>
    );
};

export default MainLayout;
