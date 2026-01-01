import { useState, useEffect, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import {
    Trash2, RefreshCw, Shield, AlertTriangle, CheckSquare, Square, Wand2,
    Sparkles, X, Check, Eye, Users, CreditCard, Zap, Crown, UserPlus,
    BarChart3, Database, Layers, FileText, ChevronDown, Copy
} from 'lucide-react';
import { toast } from 'sonner';
import Header from '../components/Header';
import { useSubscription } from '../hooks/useSubscription';

const Admin = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const { plan: myPlan, refetch: refetchSubscription } = useSubscription();

    // Template management state
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(new Set());
    const [deleting, setDeleting] = useState(false);
    const [improving, setImproving] = useState(false);
    const [improvements, setImprovements] = useState(null);
    const [previewPrompt, setPreviewPrompt] = useState(null);

    // User management state
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUserId, setNewUserId] = useState('');
    const [newUserPlan, setNewUserPlan] = useState('free');
    const [addingUser, setAddingUser] = useState(false);

    // Stats state
    const [stats, setStats] = useState(null);

    // Active tab
    const [activeTab, setActiveTab] = useState('quick');

    // Plan switching
    const [switchingPlan, setSwitchingPlan] = useState(false);

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

    const fetchUsers = useCallback(async () => {
        setUsersLoading(true);
        try {
            const authToken = await getToken();
            const response = await fetch('/api/billing/admin/users', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);

                // Calculate stats
                const totalUsers = data.length;
                const proUsers = data.filter(u => u.plan === 'pro').length;
                const lifetimeUsers = data.filter(u => u.plan === 'lifetime').length;
                const totalPrompts = data.reduce((sum, u) => sum + parseInt(u.prompt_count || 0), 0);
                const totalCollections = data.reduce((sum, u) => sum + parseInt(u.collection_count || 0), 0);

                setStats({
                    totalUsers,
                    proUsers,
                    lifetimeUsers,
                    freeUsers: totalUsers - proUsers - lifetimeUsers,
                    totalPrompts,
                    totalCollections
                });
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setUsersLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        fetchTemplates();
        fetchUsers();
    }, [fetchTemplates, fetchUsers]);

    // Quick plan switch for testing
    const handleQuickPlanSwitch = async (plan) => {
        setSwitchingPlan(true);
        try {
            const authToken = await getToken();
            const response = await fetch('/api/billing/admin/my-plan', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ plan })
            });

            if (response.ok) {
                toast.success(`Switched to ${plan} plan`);
                await refetchSubscription();
            } else {
                toast.error('Failed to switch plan');
            }
        } catch (err) {
            toast.error('Failed to switch plan');
        } finally {
            setSwitchingPlan(false);
        }
    };

    // Update user's plan
    const handleUpdateUserPlan = async (userId, plan) => {
        try {
            const authToken = await getToken();
            const response = await fetch(`/api/billing/admin/users/${encodeURIComponent(userId)}/plan`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ plan })
            });

            if (response.ok) {
                toast.success(`Updated user to ${plan} plan`);
                fetchUsers();
            } else {
                toast.error('Failed to update plan');
            }
        } catch (err) {
            toast.error('Failed to update plan');
        }
    };

    // Add new user
    const handleAddUser = async () => {
        if (!newUserId.trim()) {
            toast.error('User ID is required');
            return;
        }

        setAddingUser(true);
        try {
            const authToken = await getToken();
            const response = await fetch('/api/billing/admin/users', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: newUserId.trim(), plan: newUserPlan })
            });

            if (response.ok) {
                toast.success('User added successfully');
                setNewUserId('');
                setNewUserPlan('free');
                setShowAddUser(false);
                fetchUsers();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to add user');
            }
        } catch (err) {
            toast.error('Failed to add user');
        } finally {
            setAddingUser(false);
        }
    };

    // Delete user subscription
    const handleDeleteUser = async (userId) => {
        if (!confirm('Delete this user\'s subscription? This cannot be undone.')) return;

        try {
            const authToken = await getToken();
            const response = await fetch(`/api/billing/admin/users/${encodeURIComponent(userId)}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (response.ok) {
                toast.success('User subscription deleted');
                fetchUsers();
            } else {
                toast.error('Failed to delete user');
            }
        } catch (err) {
            toast.error('Failed to delete user');
        }
    };

    // Template management functions
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

            if (!response.ok) throw new Error('Failed to delete');

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
        if (!confirm(`Delete ${selected.size} template prompt(s)?`)) return;

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

            if (!response.ok) throw new Error('Failed to delete');

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

            if (!response.ok) throw new Error('Failed to improve prompts');

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

            if (!response.ok) throw new Error('Failed to apply improvement');

            setTemplates(templates.map(t =>
                t.id === improvement.id ? { ...t, content: improvement.improved } : t
            ));
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

    const copyUserId = async (userId) => {
        await navigator.clipboard.writeText(userId);
        toast.success('User ID copied');
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
                    {/* Header */}
                    <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Shield size={24} style={{ color: 'var(--accent-primary)' }} />
                                <h1>Admin Panel</h1>
                            </div>
                            <p className="dashboard-subtitle">Manage users, plans, and templates</p>
                        </div>
                    </div>

                    {/* Quick Plan Switcher */}
                    <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <CreditCard size={20} style={{ color: 'var(--accent-primary)' }} />
                                <span style={{ fontWeight: 500 }}>Quick Plan Switch (Your Account)</span>
                                <span style={{
                                    fontSize: '0.75rem',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '4px',
                                    background: myPlan === 'lifetime' ? 'rgba(245, 158, 11, 0.2)' :
                                        myPlan === 'pro' ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-secondary)',
                                    color: myPlan === 'lifetime' ? '#f59e0b' :
                                        myPlan === 'pro' ? 'var(--accent-primary)' : 'var(--text-muted)'
                                }}>
                                    Current: {myPlan}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className={`btn sm ${myPlan === 'free' ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => handleQuickPlanSwitch('free')}
                                    disabled={switchingPlan || myPlan === 'free'}
                                >
                                    Free
                                </button>
                                <button
                                    className={`btn sm ${myPlan === 'pro' ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => handleQuickPlanSwitch('pro')}
                                    disabled={switchingPlan || myPlan === 'pro'}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                                >
                                    <Zap size={14} />
                                    Pro
                                </button>
                                <button
                                    className={`btn sm ${myPlan === 'lifetime' ? '' : 'btn-ghost'}`}
                                    onClick={() => handleQuickPlanSwitch('lifetime')}
                                    disabled={switchingPlan || myPlan === 'lifetime'}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        background: myPlan === 'lifetime' ? '#f59e0b' : undefined,
                                        color: myPlan === 'lifetime' ? '#000' : undefined
                                    }}
                                >
                                    <Crown size={14} />
                                    Lifetime
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    {stats && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                            gap: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                                <Users size={20} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                                <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{stats.totalUsers}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Users</div>
                            </div>
                            <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                                <Zap size={20} style={{ color: '#6366f1', marginBottom: '0.5rem' }} />
                                <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{stats.proUsers}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pro Users</div>
                            </div>
                            <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                                <Crown size={20} style={{ color: '#f59e0b', marginBottom: '0.5rem' }} />
                                <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{stats.lifetimeUsers}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lifetime</div>
                            </div>
                            <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                                <FileText size={20} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                                <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{stats.totalPrompts}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Prompts</div>
                            </div>
                            <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                                <Layers size={20} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                                <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{stats.totalCollections}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Collections</div>
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                        <button
                            className={`btn btn-ghost sm ${activeTab === 'quick' ? 'active' : ''}`}
                            onClick={() => setActiveTab('quick')}
                            style={{
                                borderBottom: activeTab === 'quick' ? '2px solid var(--accent-primary)' : 'none',
                                borderRadius: '4px 4px 0 0'
                            }}
                        >
                            <Users size={16} />
                            Users & Plans
                        </button>
                        <button
                            className={`btn btn-ghost sm ${activeTab === 'templates' ? 'active' : ''}`}
                            onClick={() => setActiveTab('templates')}
                            style={{
                                borderBottom: activeTab === 'templates' ? '2px solid var(--accent-primary)' : 'none',
                                borderRadius: '4px 4px 0 0'
                            }}
                        >
                            <Database size={16} />
                            Templates ({templates.length})
                        </button>
                    </div>

                    {/* Users Tab */}
                    {activeTab === 'quick' && (
                        <div>
                            {/* Add User Section */}
                            <div className="card" style={{ marginBottom: '1rem' }}>
                                <div style={{
                                    padding: '1rem 1.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderBottom: showAddUser ? '1px solid var(--border-subtle)' : 'none'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <UserPlus size={18} />
                                        <span style={{ fontWeight: 500 }}>Add Test User</span>
                                    </div>
                                    <button
                                        className="btn btn-ghost sm"
                                        onClick={() => setShowAddUser(!showAddUser)}
                                    >
                                        <ChevronDown size={16} style={{
                                            transform: showAddUser ? 'rotate(180deg)' : 'none',
                                            transition: 'transform 0.2s'
                                        }} />
                                    </button>
                                </div>

                                {showAddUser && (
                                    <div style={{ padding: '1rem 1.25rem' }}>
                                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                            <input
                                                type="text"
                                                placeholder="User ID (e.g., user_xxxxx)"
                                                value={newUserId}
                                                onChange={(e) => setNewUserId(e.target.value)}
                                                style={{
                                                    flex: 1,
                                                    minWidth: '200px',
                                                    padding: '0.6rem 0.75rem',
                                                    background: 'var(--bg-secondary)',
                                                    border: '1px solid var(--border-subtle)',
                                                    borderRadius: '6px',
                                                    color: 'var(--text-primary)',
                                                    fontSize: '0.9rem'
                                                }}
                                            />
                                            <select
                                                value={newUserPlan}
                                                onChange={(e) => setNewUserPlan(e.target.value)}
                                                style={{
                                                    padding: '0.6rem 0.75rem',
                                                    background: 'var(--bg-secondary)',
                                                    border: '1px solid var(--border-subtle)',
                                                    borderRadius: '6px',
                                                    color: 'var(--text-primary)',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                <option value="free">Free</option>
                                                <option value="pro">Pro</option>
                                                <option value="lifetime">Lifetime</option>
                                            </select>
                                            <button
                                                className="btn btn-primary sm"
                                                onClick={handleAddUser}
                                                disabled={addingUser || !newUserId.trim()}
                                            >
                                                {addingUser ? 'Adding...' : 'Add User'}
                                            </button>
                                        </div>
                                        <p style={{ margin: '0.75rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            Tip: Get user IDs from Clerk dashboard or ask testers for their ID from Settings page
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Users List */}
                            <div className="card" style={{ overflow: 'hidden' }}>
                                <div style={{
                                    padding: '0.75rem 1rem',
                                    background: 'var(--bg-hover)',
                                    borderBottom: '1px solid var(--border-subtle)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontWeight: 500 }}>All Users ({users.length})</span>
                                    <button
                                        className="btn btn-ghost sm"
                                        onClick={fetchUsers}
                                        disabled={usersLoading}
                                    >
                                        <RefreshCw size={14} className={usersLoading ? 'spinning' : ''} />
                                        Refresh
                                    </button>
                                </div>

                                {usersLoading && users.length === 0 ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        Loading users...
                                    </div>
                                ) : users.length === 0 ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No users found
                                    </div>
                                ) : (
                                    <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ background: 'var(--bg-secondary)' }}>
                                                    <th style={{ padding: '0.6rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600 }}>User</th>
                                                    <th style={{ padding: '0.6rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600 }}>Plan</th>
                                                    <th style={{ padding: '0.6rem 1rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: 600 }}>Prompts</th>
                                                    <th style={{ padding: '0.6rem 1rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: 600 }}>Collections</th>
                                                    <th style={{ padding: '0.6rem 1rem', textAlign: 'right', fontSize: '0.8rem', fontWeight: 600 }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map((u) => (
                                                    <tr key={u.user_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                                        <td style={{ padding: '0.6rem 1rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                {u.imageUrl ? (
                                                                    <img
                                                                        src={u.imageUrl}
                                                                        alt=""
                                                                        style={{
                                                                            width: 32,
                                                                            height: 32,
                                                                            borderRadius: '50%',
                                                                            flexShrink: 0
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div style={{
                                                                        width: 32,
                                                                        height: 32,
                                                                        borderRadius: '50%',
                                                                        background: 'var(--bg-hover)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        flexShrink: 0
                                                                    }}>
                                                                        <Users size={14} style={{ color: 'var(--text-muted)' }} />
                                                                    </div>
                                                                )}
                                                                <div style={{ minWidth: 0 }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                        <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                                                                            {u.fullName || 'Unknown User'}
                                                                        </span>
                                                                        {u.user_id === user?.id && (
                                                                            <span style={{
                                                                                fontSize: '0.65rem',
                                                                                padding: '0.1rem 0.4rem',
                                                                                background: 'rgba(16, 185, 129, 0.2)',
                                                                                color: '#10b981',
                                                                                borderRadius: '4px'
                                                                            }}>
                                                                                You
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                                        {u.email || (
                                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                                                <code style={{ fontSize: '0.7rem' }}>{u.user_id.slice(0, 15)}...</code>
                                                                                <button
                                                                                    className="btn btn-ghost icon-only"
                                                                                    onClick={() => copyUserId(u.user_id)}
                                                                                    style={{ padding: '0.15rem' }}
                                                                                    title="Copy full ID"
                                                                                >
                                                                                    <Copy size={10} />
                                                                                </button>
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '0.6rem 1rem' }}>
                                                            <select
                                                                value={u.plan}
                                                                onChange={(e) => handleUpdateUserPlan(u.user_id, e.target.value)}
                                                                style={{
                                                                    padding: '0.3rem 0.5rem',
                                                                    background: u.plan === 'lifetime' ? 'rgba(245, 158, 11, 0.2)' :
                                                                        u.plan === 'pro' ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-secondary)',
                                                                    border: '1px solid var(--border-subtle)',
                                                                    borderRadius: '4px',
                                                                    color: u.plan === 'lifetime' ? '#f59e0b' :
                                                                        u.plan === 'pro' ? '#6366f1' : 'var(--text-primary)',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: 500,
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                <option value="free">Free</option>
                                                                <option value="pro">Pro</option>
                                                                <option value="lifetime">Lifetime</option>
                                                            </select>
                                                        </td>
                                                        <td style={{ padding: '0.6rem 1rem', textAlign: 'center', fontSize: '0.85rem' }}>
                                                            {u.prompt_count}
                                                        </td>
                                                        <td style={{ padding: '0.6rem 1rem', textAlign: 'center', fontSize: '0.85rem' }}>
                                                            {u.collection_count}
                                                        </td>
                                                        <td style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>
                                                            <button
                                                                className="btn btn-ghost icon-only"
                                                                onClick={() => handleDeleteUser(u.user_id)}
                                                                style={{ color: 'var(--error)', padding: '0.25rem' }}
                                                                title="Delete subscription"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Templates Tab */}
                    {activeTab === 'templates' && (
                        <>
                            {/* Actions Bar */}
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                {selected.size > 0 && (
                                    <>
                                        <button
                                            className="btn btn-ghost"
                                            onClick={handleBulkImprove}
                                            disabled={improving || selected.size > 10}
                                            style={{ color: 'var(--accent-primary)' }}
                                        >
                                            {improving ? <Sparkles size={18} className="spinning" /> : <Wand2 size={18} />}
                                            {improving ? 'Improving...' : `Improve ${selected.size}`}
                                        </button>
                                        <button
                                            className="btn btn-ghost"
                                            onClick={handleBulkDelete}
                                            disabled={deleting}
                                            style={{ color: 'var(--error)' }}
                                        >
                                            <Trash2 size={18} />
                                            Delete {selected.size}
                                        </button>
                                    </>
                                )}
                                <button
                                    className="btn btn-secondary"
                                    onClick={fetchTemplates}
                                    disabled={loading}
                                    style={{ marginLeft: 'auto' }}
                                >
                                    <RefreshCw size={18} className={loading ? 'spinning' : ''} />
                                    Refresh
                                </button>
                            </div>

                            {/* Improvements Panel */}
                            {improvements && improvements.length > 0 && (
                                <div style={{
                                    marginBottom: '1rem',
                                    padding: '1rem',
                                    background: 'linear-gradient(135deg, rgba(255, 225, 53, 0.08), rgba(168, 85, 247, 0.08))',
                                    border: '1px solid rgba(255, 225, 53, 0.3)',
                                    borderRadius: '8px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <span style={{ fontWeight: 500 }}>
                                            <Sparkles size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                                            {improvements.filter(i => i.success).length} improvements ready
                                        </span>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn btn-primary sm" onClick={handleApplyAllImprovements}>
                                                <Check size={14} /> Apply All
                                            </button>
                                            <button className="btn btn-ghost sm" onClick={() => setImprovements(null)}>
                                                <X size={14} /> Dismiss
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Templates Table */}
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    Loading templates...
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
                                                    <button onClick={selectAll} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
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
                                                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', width: '100px' }}>Actions</th>
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
                                                        <button onClick={() => toggleSelect(template.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                                            {selected.has(template.id) ? (
                                                                <CheckSquare size={18} style={{ color: 'var(--accent-primary)' }} />
                                                            ) : (
                                                                <Square size={18} style={{ color: 'var(--text-muted)' }} />
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td style={{ padding: '0.75rem 1rem' }}>
                                                        <div style={{ fontWeight: 500 }}>{template.title}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {template.content.slice(0, 80)}...
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '0.75rem 1rem' }}>
                                                        <span className="badge category-badge">{template.category}</span>
                                                    </td>
                                                    <td style={{ padding: '0.75rem 1rem' }}>
                                                        <span className="badge source-badge">{template.source}</span>
                                                    </td>
                                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                                        <button
                                                            className="btn btn-ghost"
                                                            onClick={() => setPreviewPrompt({ original: template, improved: template.content })}
                                                            style={{ padding: '0.25rem 0.5rem' }}
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button
                                                            className="btn btn-ghost"
                                                            onClick={() => handleDelete(template.id)}
                                                            style={{ color: 'var(--error)', padding: '0.25rem 0.5rem' }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-hover)', borderTop: '1px solid var(--border-subtle)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {templates.length} template{templates.length !== 1 ? 's' : ''} total
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Preview Modal */}
            {previewPrompt && (
                <div
                    className="modal-overlay"
                    onClick={() => setPreviewPrompt(null)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', maxWidth: '700px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}
                    >
                        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>{previewPrompt.original?.title}</h3>
                            <button className="btn btn-ghost" onClick={() => setPreviewPrompt(null)} style={{ padding: '0.25rem' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '1.25rem' }}>
                            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '1rem' }}>
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.9rem', lineHeight: '1.6' }}>
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
