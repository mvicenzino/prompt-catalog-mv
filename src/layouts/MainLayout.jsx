import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AddPromptModal from '../components/AddPromptModal';

const MainLayout = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="layout">
            <Sidebar onAddPrompt={() => setIsModalOpen(true)} />
            <main className="main-content">
                <Outlet />
            </main>
            <AddPromptModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default MainLayout;
