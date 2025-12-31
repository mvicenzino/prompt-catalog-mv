import { useState, useEffect, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Trash2, RefreshCw, Shield, AlertTriangle, CheckSquare, Square, Wand2, Sparkles, X, Check, Eye } from 'lucide-react';
import { toast } from 'sonner';
import Header from '../components/Header';

const Admin = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(new Set());
    const [deleting, setDeleting] = useState(false);
    const [improving, setImproving] = useState(false);
    const [improvements, setImprovements] = useState(null);
    const [previewPrompt, setPreviewPrompt] = useState(null);

    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const authToken = await getToken();
            const response = await fetch('/api/prompts/admin/templates', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (response.status === 403) {
                setError('You do not have admin access.');
                setTemplates([]);
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch templates');
            }

            const data = await response.json();
            setTemplates(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const toggleSelect = (id) => {
        const newSelected = new Set(selected);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelected(newSelected);
    };

    const selectAll = () => {
        if (selected.size === templates.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(templates.map(t => t.id)));
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this template prompt?')) return;

        try {
            const authToken = await getToken();
            const response = await fetch(`/api/prompts/admin/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (!response.ok) {
                throw new Error('Failed to delete');
            }

            toast.success('Template deleted');
            setTemplates(templates.filter(t => t.id !== id));
            selected.delete(id);
            setSelected(new Set(selected));
        } catch (err) {
            toast.error('Failed to delete template');
        }
    };

    const handleBulkDelete = async () => {
        if (selected.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selected.size} template prompt(s)?`)) return;

        setDeleting(true);
        try {
            const authToken = await getToken();
            const response = await fetch('/api/prompts/admin/bulk-delete', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids: Array.from(selected) })
            });

            if (!response.ok) {
                throw new Error('Failed to delete');
            }

            const result = await response.json();
            toast.success(`Deleted ${result.deletedIds.length} templates`);
            setTemplates(templates.filter(t => !result.deletedIds.includes(t.id)));
            setSelected(new Set());
        } catch (err) {
            toast.error('Failed to delete templates');
        } finally {
            setDeleting(false);
        }
    };

    const handleBulkImprove = async () => {
        if (selected.size === 0) return;
        if (selected.size > 10) {
            toast.error('Maximum 10 prompts per batch');
            return;
        }

        setImproving(true);
        try {
            const authToken = await getToken();
            const selectedTemplates = templates.filter(t => selected.has(t.id));

            const response = await fetch('/api/ai/improve-batch', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompts: selectedTemplates.map(t => ({
                        id: t.id,
                        title: t.title,
                        content: t.content
                    }))
                })
            });

            if (!response.ok) {
                throw new Error('Failed to improve prompts');
            }

            const { results } = await response.json();
            setImprovements(results.map(r => ({
                ...r,
                original: selectedTemplates.find(t => t.id === r.id)
            })));

            const successCount = results.filter(r => r.success).length;
            toast.success(`Improved ${successCount}/${results.length} prompts`);
        } catch (err) {
            toast.error('Failed to improve prompts: ' + err.message);
        } finally {
            setImproving(false);
        }
    };

    const handleApplyImprovement = async (improvement) => {
        try {
            const authToken = await getToken();
            const response = await fetch(`/api/prompts/${improvement.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...improvement.original,
                    content: improvement.improved
                })
            });

            if (!response.ok) {
                throw new Error('Failed to apply improvement');
            }

            // Update local state
            setTemplates(templates.map(t =>
                t.id === improvement.id ? { ...t, content: improvement.improved } : t
            ));

            // Remove from improvements list
            setImprovements(improvements.filter(i => i.id !== improvement.id));

            toast.success('Improvement applied!');
        } catch (err) {
            toast.error('Failed to apply: ' + err.message);
        }
    };

    const handleApplyAllImprovements = async () => {
        const successfulImprovements = improvements.filter(i => i.success);
        for (const improvement of successfulImprovements) {
            await handleApplyImprovement(improvement);
        }
    };

    if (error === 'You do not have admin access.') {
        return (
            <div className="dashboard">
                <Header />
                <main className="main-content">
                    <div className="content-wrapper" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                        <AlertTriangle size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                        <h2>Access Denied</h2>
                        <p style={{ color: 'var(--text-muted)' }}>You do not have admin privileges.</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <Header />
            <main className="main-content">
                <div className="content-wrapper">
                    <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Shield size={24} style={{ color: 'var(--accent-primary)' }} />
                                <h1>Admin Panel</h1>
                            </div>
                            <p className="dashboard-subtitle">Manage template prompts (user_id = NULL)</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {selected.size > 0 && (
                                <>
                                    <button
                                        className="btn btn-ghost"
                                        onClick={handleBulkImprove}
                                        disabled={improving || selected.size > 10}
                                        style={{ color: 'var(--accent-primary)' }}
                                    >
                                        {improving ? (
                                            <Sparkles size={18} className="spinning" />
                                        ) : (
                                            <Wand2 size={18} />
                                        )}
                                        {improving ? 'Improving...' : `Improve ${selected.size} selected`}
                                    </button>
                                    <button
                                        className="btn btn-ghost"
                                        onClick={handleBulkDelete}
                                        disabled={deleting}
                                        style={{ color: 'var(--error)' }}
                                    >
                                        <Trash2 size={18} />
                                        Delete {selected.size} selected
                                    </button>
                                </>
                            )}
                            <button
                                className="btn btn-secondary"
                                onClick={fetchTemplates}
                                disabled={loading}
                            >
                                <RefreshCw size={18} className={loading ? 'spinning' : ''} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Improvements Review Panel */}
                    {improvements && improvements.length > 0 && (
                        <div style={{
                            marginBottom: '1.5rem',
                            padding: '1.25rem',
                            background: 'linear-gradient(135deg, rgba(255, 225, 53, 0.08), rgba(168, 85, 247, 0.08))',
                            border: '1px solid rgba(255, 225, 53, 0.3)',
                            borderRadius: '12px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
                                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                                        Review AI Improvements ({improvements.filter(i => i.success).length} ready)
                                    </h3>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        className="btn btn-primary sm"
                                        onClick={handleApplyAllImprovements}
                                    >
                                        <Check size={16} />
                                        Apply All
                                    </button>
                                    <button
                                        className="btn btn-ghost sm"
                                        onClick={() => setImprovements(null)}
                                    >
                                        <X size={16} />
                                        Dismiss
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {improvements.map(improvement => (
                                    <div
                                        key={improvement.id}
                                        style={{
                                            padding: '1rem',
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border-subtle)',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <div>
                                                <strong style={{ fontSize: '0.9rem' }}>{improvement.original?.title}</strong>
                                                {improvement.success ? (
                                                    <span style={{
                                                        marginLeft: '0.5rem',
                                                        fontSize: '0.7rem',
                                                        padding: '0.15rem 0.5rem',
                                                        background: 'rgba(16, 185, 129, 0.2)',
                                                        color: '#10b981',
                                                        borderRadius: '4px'
                                                    }}>
                                                        Ready
                                                    </span>
                                                ) : (
                                                    <span style={{
                                                        marginLeft: '0.5rem',
                                                        fontSize: '0.7rem',
                                                        padding: '0.15rem 0.5rem',
                                                        background: 'rgba(239, 68, 68, 0.2)',
                                                        color: '#ef4444',
                                                        borderRadius: '4px'
                                                    }}>
                                                        Failed
                                                    </span>
                                                )}
                                            </div>
                                            {improvement.success && (
                                                <div style={{ display: 'flex', gap: '0.35rem' }}>
                                                    <button
                                                        className="btn btn-ghost sm"
                                                        onClick={() => setPreviewPrompt(improvement)}
                                                        style={{ padding: '0.25rem 0.5rem' }}
                                                    >
                                                        <Eye size={14} />
                                                        Preview
                                                    </button>
                                                    <button
                                                        className="btn btn-primary sm"
                                                        onClick={() => handleApplyImprovement(improvement)}
                                                        style={{ padding: '0.25rem 0.5rem' }}
                                                    >
                                                        <Check size={14} />
                                                        Apply
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        {improvement.success && improvement.improvements?.length > 0 && (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {improvement.improvements.slice(0, 2).join(' • ')}
                                            </div>
                                        )}
                                        {!improvement.success && (
                                            <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>
                                                Error: {improvement.error}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            Loading templates...
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--error)' }}>
                            {error}
                        </div>
                    ) : templates.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            No template prompts found.
                        </div>
                    ) : (
                        <div className="card" style={{ overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border-subtle)' }}>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', width: '40px' }}>
                                            <button
                                                onClick={selectAll}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                            >
                                                {selected.size === templates.length && templates.length > 0 ? (
                                                    <CheckSquare size={18} style={{ color: 'var(--accent-primary)' }} />
                                                ) : (
                                                    <Square size={18} style={{ color: 'var(--text-muted)' }} />
                                                )}
                                            </button>
                                        </th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Title</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Category</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Source</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Created</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right', width: '120px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {templates.map((template) => (
                                        <tr
                                            key={template.id}
                                            style={{
                                                borderBottom: '1px solid var(--border-subtle)',
                                                background: selected.has(template.id) ? 'rgba(255, 225, 53, 0.05)' : 'transparent'
                                            }}
                                        >
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <button
                                                    onClick={() => toggleSelect(template.id)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                                >
                                                    {selected.has(template.id) ? (
                                                        <CheckSquare size={18} style={{ color: 'var(--accent-primary)' }} />
                                                    ) : (
                                                        <Square size={18} style={{ color: 'var(--text-muted)' }} />
                                                    )}
                                                </button>
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <div style={{ fontWeight: 500 }}>{template.title}</div>
                                                <div style={{
                                                    fontSize: '0.8rem',
                                                    color: 'var(--text-muted)',
                                                    maxWidth: '400px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {template.content.slice(0, 100)}...
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <span className="badge category-badge">{template.category}</span>
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <span className="badge source-badge">{template.source}</span>
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {new Date(template.created_at).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                                <button
                                                    className="btn btn-ghost"
                                                    onClick={() => setPreviewPrompt({ original: template, improved: template.content })}
                                                    style={{ padding: '0.25rem 0.5rem' }}
                                                    title="View prompt"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    className="btn btn-ghost"
                                                    onClick={() => handleDelete(template.id)}
                                                    style={{ color: 'var(--error)', padding: '0.25rem 0.5rem' }}
                                                    title="Delete template"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div style={{
                                padding: '0.75rem 1rem',
                                background: 'var(--bg-hover)',
                                borderTop: '1px solid var(--border-subtle)',
                                fontSize: '0.85rem',
                                color: 'var(--text-muted)'
                            }}>
                                {templates.length} template prompt{templates.length !== 1 ? 's' : ''} total
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Preview Modal */}
            {previewPrompt && (
                <div
                    className="modal-overlay"
                    onClick={() => setPreviewPrompt(null)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '12px',
                            maxWidth: '800px',
                            width: '90%',
                            maxHeight: '80vh',
                            overflow: 'auto'
                        }}
                    >
                        <div style={{
                            padding: '1rem 1.25rem',
                            borderBottom: '1px solid var(--border-subtle)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0 }}>{previewPrompt.original?.title}</h3>
                            <button
                                className="btn btn-ghost"
                                onClick={() => setPreviewPrompt(null)}
                                style={{ padding: '0.25rem' }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '1.25rem' }}>
                            {previewPrompt.improvements?.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>
                                        Improvements Made:
                                    </h4>
                                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#10b981' }}>
                                        {previewPrompt.improvements.map((imp, idx) => (
                                            <li key={idx}>{imp}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div style={{
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '8px',
                                padding: '1rem'
                            }}>
                                <pre style={{
                                    margin: 0,
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'inherit',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.6'
                                }}>
                                    {previewPrompt.improved}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spinning {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default Admin;
