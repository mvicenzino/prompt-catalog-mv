import React, { useState } from 'react';
import { X } from 'lucide-react';
import { usePrompts } from '../hooks/usePrompts';

const AddPromptModal = ({ isOpen, onClose }) => {
    const { addPrompt } = usePrompts();
    const [image, setImage] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'Images',
        source: 'Other',
        tags: ''
    });

    if (!isOpen) return null;

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with 0.7 quality to ensure it fits in localStorage
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    setImage(dataUrl);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addPrompt({
            ...formData,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
            userImage: image
        });
        onClose();
        setFormData({ title: '', content: '', category: 'Images', source: 'Other', tags: '' });
        setImage(null);
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

                    <div className="form-group">
                        <label>Upload Image (Optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="input"
                            style={{ padding: '0.5rem' }}
                        />
                        {image && (
                            <div style={{ marginTop: '0.5rem', width: '100px', height: '100px', overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                                <img src={image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        )}
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
