import React from 'react';
import { Search, Bell } from 'lucide-react';

const Header = ({ onSearch }) => {
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
                <button className="btn btn-ghost icon-only">
                    <Bell size={20} />
                </button>
                <div className="avatar">M</div>
            </div>
        </header>
    );
};

export default Header;
