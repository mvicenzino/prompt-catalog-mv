import React, { useState } from 'react';
import { X } from 'lucide-react';
import { usePrompts } from '../hooks/usePrompts';

const AddPromptModal = ({ isOpen, onClose }) => {
    const { addPrompt } = usePrompts();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'Images',
        source: 'Other',
        tags: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        addPrompt({
            ...formData,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        });
        onClose();
        setFormData({ title: '', content: '', category: 'Images', source: 'Other', tags: '' });
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h3>Add New Prompt</h3>
                    <button className="btn btn-ghost icon-only" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            className="input"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Content</label>
                        <textarea
                            className="input textarea"
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            required
                            rows={4}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>
                            <select
                                className="input"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option>Images</option>
                                <option>Photos</option>
                                <option>Apps</option>
                                <option>Coding</option>
                                <option>Writing</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Source</label>
                            <select
                                className="input"
                                value={formData.source}
                                onChange={e => setFormData({ ...formData, source: e.target.value })}
                            >
                                <option>X</option>
                                <option>Reddit</option>
                                <option>Midjourney</option>
                                <option>ChatGPT</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Tags (comma separated)</label>
                        <input
                            className="input"
                            value={formData.tags}
                            onChange={e => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="cyberpunk, 8k, portrait"
                        />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Add Prompt</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPromptModal;
