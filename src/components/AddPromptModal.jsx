import { useState, useCallback, useEffect } from 'react';
import { X, Sparkles, Loader2, Variable } from 'lucide-react';
import { usePrompts } from '../hooks/usePrompts';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'sonner';

const AddPromptModal = ({ isOpen, onClose }) => {
    const { addPrompt } = usePrompts();
    const { getToken } = useAuth();
    const [attachment, setAttachment] = useState(null);
    const [isCategorizin, setIsCategorizing] = useState(false);
    const [hasAutoCategorzed, setHasAutoCategorized] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'Images',
        source: 'Other',
        tags: ''
    });

    // Auto-categorize when content is long enough and hasn't been categorized yet
    const autoCategorize = useCallback(async () => {
        if (!formData.content || formData.content.length < 20) return;
        if (isCategorizin || hasAutoCategorzed) return;

        setIsCategorizing(true);
        try {
            const token = await getToken();
            const response = await fetch('/api/ai/categorize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: formData.content,
                    title: formData.title
                })
            });

            if (response.ok) {
                const result = await response.json();
                setFormData(prev => ({
                    ...prev,
                    category: result.category,
                    tags: result.tags.join(', ')
                }));
                setHasAutoCategorized(true);
                toast.success('Auto-categorized!', {
                    description: `Category: ${result.category}`,
                    duration: 2000
                });
            }
        } catch (err) {
            console.error('Auto-categorize error:', err);
        } finally {
            setIsCategorizing(false);
        }
    }, [formData.content, formData.title, getToken, isCategorizin, hasAutoCategorzed]);

    // Debounce auto-categorization
    useEffect(() => {
        if (!isOpen || hasAutoCategorzed || formData.content.length < 50) return;

        const timer = setTimeout(() => {
            autoCategorize();
        }, 1500); // Wait 1.5s after typing stops

        return () => clearTimeout(timer);
    }, [formData.content, isOpen, hasAutoCategorzed, autoCategorize]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setHasAutoCategorized(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check size limit (1MB)
            if (file.size > 1024 * 1024) {
                alert('File is too large. Please select a file under 1MB.');
                e.target.value = ''; // Reset input
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target.result;

                if (file.type.startsWith('image/')) {
                    // Compress image
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

                        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                        setAttachment({
                            type: file.type,
                            name: file.name,
                            data: dataUrl,
                            size: Math.round((dataUrl.length * 3) / 4) // Approx size
                        });
                    };
                    img.src = result;
                } else {
                    // Store other files as is (base64)
                    setAttachment({
                        type: file.type || 'application/octet-stream',
                        name: file.name,
                        data: result,
                        size: file.size
                    });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addPrompt({
            ...formData,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
            attachment: attachment // Save the attachment object
        });
        onClose();
        setFormData({ title: '', content: '', category: 'Images', source: 'Other', tags: '' });
        setAttachment(null);
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
                            placeholder="Write a {{tone}} email to {{recipient}} about {{topic}}..."
                        />
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginTop: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            background: 'rgba(255, 225, 53, 0.08)',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)'
                        }}>
                            <Variable size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                            <span>
                                <strong style={{ color: 'var(--accent-primary)' }}>Pro tip:</strong> Use <code style={{ background: 'rgba(255, 225, 53, 0.15)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>{'{{variable}}'}</code> to create fill-in-the-blank templates
                            </span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Attachment (Image or File)</label>
                        <div className="file-upload-container" style={{ border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.5rem' }}>
                            <input
                                type="file"
                                onChange={handleFileSelect}
                                className="input"
                                style={{ border: 'none', padding: '0' }}
                            />
                            {attachment && (
                                <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {attachment.type.startsWith('image/') ? (
                                        <img src={attachment.data} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                    ) : (
                                        <div style={{ width: '40px', height: '40px', background: 'var(--border-subtle)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>FILE</span>
                                        </div>
                                    )}
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{attachment.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{(attachment.size / 1024).toFixed(1)} KB</div>
                                    </div>
                                    <button type="button" className="btn btn-ghost icon-only sm" onClick={() => setAttachment(null)}>
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-secondary mt-1">Max size: 1MB. Images will be compressed.</p>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                Category
                                <button
                                    type="button"
                                    onClick={() => {
                                        setHasAutoCategorized(false);
                                        autoCategorize();
                                    }}
                                    disabled={isCategorizin || formData.content.length < 20}
                                    className="btn btn-ghost icon-only sm"
                                    title="Auto-categorize with AI"
                                    style={{
                                        padding: '0.2rem',
                                        color: isCategorizin ? 'var(--accent-primary)' : 'var(--text-muted)'
                                    }}
                                >
                                    {isCategorizin ? (
                                        <Loader2 size={14} className="spin" />
                                    ) : (
                                        <Sparkles size={14} />
                                    )}
                                </button>
                            </label>
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
