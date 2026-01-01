import { useState, useRef, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Bell, PlusCircle } from 'lucide-react';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/clerk-react';
import Sidebar from '../components/Sidebar';
import AddPromptModal from '../components/AddPromptModal';
import NotificationDropdown from '../components/NotificationDropdown';
import UpgradeModal from '../components/UpgradeModal';
import InstallPrompt from '../components/InstallPrompt';
import { useSubscription } from '../hooks/useSubscription';

const MainLayout = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobileNotificationOpen, setIsMobileNotificationOpen] = useState(false);
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
    const [upgradeReason, setUpgradeReason] = useState('feature');
    const [newlyAddedPrompt, setNewlyAddedPrompt] = useState(null);
    const mobileNotificationRef = useRef(null);
    const subscription = useSubscription();

    // Handle when a prompt is added - pass to child pages to open detail view
    const handlePromptAdded = (prompt) => {
        setNewlyAddedPrompt(prompt);
    };

    // Clear the newly added prompt after it's been viewed
    const clearNewlyAddedPrompt = () => {
        setNewlyAddedPrompt(null);
    };

    // Function to show upgrade modal with reason
    const showUpgradeModal = (reason = 'feature') => {
        setUpgradeReason(reason);
        setUpgradeModalOpen(true);
    };

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
                <Outlet context={{
                    onAddPrompt: () => setIsModalOpen(true),
                    showUpgradeModal,
                    subscription,
                    newlyAddedPrompt,
                    clearNewlyAddedPrompt
                }} />
            </main>

            {/* Floating Action Button */}
            <button
                className="btn floating-action-btn"
                onClick={() => setIsModalOpen(true)}
                title="Add Prompt"
                style={{
                    position: 'fixed',
                    bottom: '1.5rem',
                    right: '1.5rem',
                    height: '52px',
                    borderRadius: '26px',
                    padding: '0 1.25rem 0 1rem',
                    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(168, 85, 247, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    color: 'white',
                    zIndex: 50,
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                }}
                onMouseOver={e => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(168, 85, 247, 0.6), 0 0 50px rgba(168, 85, 247, 0.3)';
                }}
                onMouseOut={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(168, 85, 247, 0.2)';
                }}
            >
                <PlusCircle size={22} />
                <span>Add Prompt</span>
            </button>

            <AddPromptModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onPromptAdded={handlePromptAdded}
            />
            <UpgradeModal
                isOpen={upgradeModalOpen}
                onClose={() => setUpgradeModalOpen(false)}
                reason={upgradeReason}
            />
            <InstallPrompt />
        </div>
    );
};

export default MainLayout;
