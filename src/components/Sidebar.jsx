import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutGrid,
    Image,
    Smartphone,
    Camera,
    Code,
    PenTool,
    Star,
    PlusCircle,
    Layers,
    X
} from 'lucide-react';

const Sidebar = ({ onAddPrompt, isOpen, onClose }) => {
    const navItems = [
        { icon: LayoutGrid, label: 'All Prompts', path: '/app' },
        { icon: Layers, label: 'Collections', path: '/app/collections' },
        { icon: Camera, label: 'Photos', path: '/app/category/photos' },
        { icon: Smartphone, label: 'Apps', path: '/app/category/apps' },
        { icon: Image, label: 'Images', path: '/app/category/images' },
        { icon: Code, label: 'Coding', path: '/app/category/coding' },
        { icon: PenTool, label: 'Writing', path: '/app/category/writing' },
        { icon: Star, label: 'Favorites', path: '/app/favorites' },
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
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        onClick={onClose}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="btn btn-primary w-full" onClick={onAddPrompt}>
                    <PlusCircle size={18} />
                    <span>New Prompt</span>
                </button>
            </div>
        </aside >
    );
};

export default Sidebar;
