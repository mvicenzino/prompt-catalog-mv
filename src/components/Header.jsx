import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Wand2, PlusCircle } from 'lucide-react';
import { UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import NotificationDropdown from './NotificationDropdown';

const Header = ({ onSearch, onOpenBuilder, onAddPrompt }) => {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const notificationRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="header">
            <div className="search-bar">
                <Search size={18} className="text-secondary" />
                <input
                    type="text"
                    placeholder="Search prompts..."
                    className="search-input"
                    onChange={(e) => onSearch && onSearch(e.target.value)}
                />
            </div>
            <div className="header-actions">
                {/* Prompt Builder - Prominent CTA */}
                {onOpenBuilder && (
                    <button
                        className="btn"
                        onClick={onOpenBuilder}
                        style={{
                            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                            color: 'white',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            fontWeight: 500
                        }}
                    >
                        <Wand2 size={18} />
                        <span className="hide-mobile">Build Prompt</span>
                    </button>
                )}
                {/* Quick Add */}
                {onAddPrompt && (
                    <button
                        className="btn btn-ghost"
                        onClick={onAddPrompt}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <PlusCircle size={18} />
                        <span className="hide-mobile">Add</span>
                    </button>
                )}
                <div className="notification-container" ref={notificationRef} style={{ position: 'relative' }}>
                    <button
                        className={`btn btn-ghost icon-only ${isNotificationOpen ? 'active' : ''}`}
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    >
                        <Bell size={20} />
                        <span className="notification-badge" />
                    </button>
                    <NotificationDropdown
                        isOpen={isNotificationOpen}
                        onClose={() => setIsNotificationOpen(false)}
                    />
                </div>
                <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <SignedOut>
                    <SignInButton mode="modal">
                        <button className="btn btn-primary">Sign In</button>
                    </SignInButton>
                </SignedOut>
            </div>
        </header>
    );
};

export default Header;
