import { NavLink } from 'react-router-dom';
import {
    LayoutGrid,
    Image,
    Smartphone,
    Camera,
    Code,
    PenTool,
    Star,
    Layers,
    Settings,
    X,
    Search,
    Users,
    Beaker
} from 'lucide-react';

// Section divider component
const SectionDivider = ({ label }) => (
    <div style={{
        fontSize: '0.65rem',
        fontWeight: 600,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        padding: '1rem 1rem 0.5rem',
        marginTop: '0.5rem'
    }}>
        {label}
    </div>
);

const Sidebar = ({ isOpen, onClose }) => {
    // Navigation structure with sections
    const navSections = [
        {
            label: 'Explore',
            items: [
                { icon: LayoutGrid, label: 'Discover', path: '/app' },
                { icon: Search, label: 'Browse', path: '/app/browse' },
            ]
        },
        {
            label: 'Categories',
            items: [
                { icon: Camera, label: 'Photos', path: '/app/category/photos' },
                { icon: Image, label: 'Images', path: '/app/category/images' },
                { icon: Code, label: 'Coding', path: '/app/category/coding' },
                { icon: PenTool, label: 'Writing', path: '/app/category/writing' },
                { icon: Smartphone, label: 'Apps', path: '/app/category/apps' },
            ]
        },
        {
            label: 'Experimental',
            items: [
                { icon: Users, label: 'Leaders & Thinkers', path: '/app/leaders' },
            ]
        },
        {
            label: 'Your Stuff',
            items: [
                { icon: Layers, label: 'Collections', path: '/app/collections' },
                { icon: Star, label: 'Favorites', path: '/app/favorites' },
            ]
        },
        {
            label: null, // No label for settings section
            items: [
                { icon: Settings, label: 'Settings', path: '/app/settings' },
            ]
        }
    ];

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="logo">
                    <img src="/logo.svg" alt="PromptPal Logo" style={{ width: '32px', height: '32px', borderRadius: '6px' }} />
                    <span className="logo-text">Prompt<span className="text-accent">Pal</span></span>
                </div>
                <button
                    className="btn btn-ghost icon-only mobile-close-btn"
                    onClick={onClose}
                    style={{ display: 'none' }}
                >
                    <X size={20} />
                </button>
            </div>

            <nav className="sidebar-nav">
                {navSections.map((section, sectionIdx) => (
                    <div key={sectionIdx}>
                        {section.label && <SectionDivider label={section.label} />}
                        {!section.label && sectionIdx > 0 && (
                            <div style={{
                                borderTop: '1px solid var(--border-subtle)',
                                margin: '0.75rem 1rem'
                            }} />
                        )}
                        {section.items.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/app'}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>
        </aside >
    );
};

export default Sidebar;
