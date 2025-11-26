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
    Layers
} from 'lucide-react';

const Sidebar = ({ onAddPrompt }) => {
    const navItems = [
        { icon: LayoutGrid, label: 'All Prompts', path: '/' },
        { icon: Layers, label: 'Collections', path: '/collections' },
        { icon: Camera, label: 'Photos', path: '/category/photos' },
        { icon: Smartphone, label: 'Apps', path: '/category/apps' },
        { icon: Image, label: 'Images', path: '/category/images' },
        { icon: Code, label: 'Coding', path: '/category/coding' },
        { icon: PenTool, label: 'Writing', path: '/category/writing' },
        { icon: Star, label: 'Favorites', path: '/favorites' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <img src="/logo.svg" alt="PromptPal Logo" style={{ width: '32px', height: '32px', borderRadius: '6px' }} />
                    <span className="logo-text">Prompt<span className="text-accent">Pal</span></span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
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
