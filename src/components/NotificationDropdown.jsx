import React from 'react';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { usePrompts } from '../hooks/usePrompts';

const MOCK_TRENDING_PROMPTS = [
    {
        id: 'trend-1',
        title: 'Midjourney V6 Photorealism',
        content: 'A hyper-realistic portrait of a [subject] in the style of [photographer], 8k resolution, cinematic lighting --v 6.0',
        source: 'Reddit',
        category: 'Art',
        tags: ['midjourney', 'photorealism', 'v6'],
        rating: 4.9
    },
    {
        id: 'trend-2',
        title: 'Coding Assistant Persona',
        content: 'You are an expert senior software engineer specializing in [language]. Your task is to review the following code and suggest optimizations for performance and readability.',
        source: 'Twitter',
        category: 'Coding',
        tags: ['coding', 'productivity', 'gpt-4'],
        rating: 4.8
    },
    {
        id: 'trend-3',
        title: 'SEO Blog Post Generator',
        content: 'Write a comprehensive, SEO-optimized blog post about [topic]. Include a catchy title, meta description, and use the following keywords: [keywords].',
        source: 'Discord',
        category: 'Writing',
        tags: ['seo', 'marketing', 'blogging'],
        rating: 4.7
    },
    {
        id: 'trend-4',
        title: 'Data Analysis Python Script',
        content: 'Write a Python script using pandas to analyze [dataset]. Calculate the mean, median, and standard deviation of [column] and visualize the distribution using matplotlib.',
        source: 'Kaggle',
        category: 'Data',
        tags: ['python', 'data-analysis', 'pandas'],
        rating: 4.6
    }
];

const NotificationDropdown = ({ isOpen, onClose }) => {
    const { addPrompt } = usePrompts();

    if (!isOpen) return null;

    const handleAdd = (prompt) => {
        addPrompt({
            title: prompt.title,
            content: prompt.content,
            category: prompt.category,
            tags: prompt.tags,
            source: prompt.source
        });
        toast.success('Added to your library!', {
            description: prompt.title,
        });
        onClose();
    };

    return (
        <div className="notification-dropdown">
            <div className="notification-header">
                <h3>Trending Prompts</h3>
                <button className="btn btn-ghost icon-only sm" onClick={onClose}>
                    <X size={16} />
                </button>
            </div>
            <div className="notification-list">
                {MOCK_TRENDING_PROMPTS.map(prompt => (
                    <div key={prompt.id} className="notification-item">
                        <div className="notification-content">
                            <div className="notification-top">
                                <span className="badge source-badge">{prompt.source}</span>
                                <span className="notification-rating">★ {prompt.rating}</span>
                            </div>
                            <h4>{prompt.title}</h4>
                            <p className="line-clamp-2">{prompt.content}</p>
                        </div>
                        <button
                            className="btn btn-primary sm icon-only"
                            onClick={() => handleAdd(prompt)}
                            title="Add to Library"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationDropdown;
