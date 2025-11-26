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
    PlusCircle
} from 'lucide-react';

const Sidebar = ({ onAddPrompt }) => {
    const navItems = [
        { icon: LayoutGrid, label: 'All Prompts', path: '/' },
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
                    <div className="logo-icon">P</div>
                    <span className="logo-text">Prompt<span className="text-accent">Catalog</span></span>
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
        </aside>
    );
};

export default Sidebar;
