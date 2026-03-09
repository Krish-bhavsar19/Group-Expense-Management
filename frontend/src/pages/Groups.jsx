import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import '../styles/groups.css';

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({ name: '', description: '' });
    const [creating, setCreating] = useState(false);
    const [activeTab, setActiveTab] = useState('active');
    const navigate = useNavigate();

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await api.get('/groups');
            setGroups(response.data.data);
        } catch (error) {
            console.error('Error fetching groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!createForm.name.trim()) return;

        setCreating(true);
        try {
            const response = await api.post('/groups', createForm);
            setGroups([...groups, response.data.data]);
            setShowCreateModal(false);
            setCreateForm({ name: '', description: '' });
            navigate(`/groups/${response.data.data.id}`);
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Failed to create group');
        } finally {
            setCreating(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="groups-container">
                <div className="empty-state">
                    <h2>Loading groups...</h2>
                </div>
            </div>
        );
    }

    const activeGroups = groups.filter(g => g.status === 'active' || !g.status);
    const inactiveGroups = groups.filter(g => g.status === 'inactive');

    const displayedGroups = activeTab === 'active' ? activeGroups : inactiveGroups;

    return (
        <div className="groups-container">
            <div className="groups-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button 
                    className="close-btn" 
                    onClick={() => navigate('/dashboard')} 
                    style={{ position: 'relative', width: 'auto', height: 'auto', padding: '0.4rem 1rem', fontSize: '1rem', background: 'var(--glass-bg)' }}
                >
                    &larr; Dashboard
                </button>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 className="groups-title" style={{ margin: 0 }}>My Groups</h1>
                    <button className="create-group-btn" onClick={() => setShowCreateModal(true)}>
                        + Create Group
                    </button>
                </div>
            </div>

            <div className="tabs-container" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                <button
                    className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                    style={{ background: 'none', border: 'none', color: activeTab === 'active' ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 600, padding: '0.5rem 1rem', cursor: 'pointer', borderBottom: activeTab === 'active' ? '2px solid var(--accent-indigo)' : 'none' }}
                >
                    Active ({activeGroups.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'inactive' ? 'active' : ''}`}
                    onClick={() => setActiveTab('inactive')}
                    style={{ background: 'none', border: 'none', color: activeTab === 'inactive' ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 600, padding: '0.5rem 1rem', cursor: 'pointer', borderBottom: activeTab === 'inactive' ? '2px solid var(--accent-indigo)' : 'none' }}
                >
                    Inactive ({inactiveGroups.length})
                </button>
            </div>

            {displayedGroups.length === 0 ? (
                <div className="empty-state">
                    <h2>No {activeTab} groups</h2>
                    {activeTab === 'active' && <p>Create your first group to start managing expenses with friends!</p>}
                    {activeTab === 'active' && (
                        <button className="create-group-btn" onClick={() => setShowCreateModal(true)}>
                            Create Your First Group
                        </button>
                    )}
                </div>
            ) : (
                <div className="groups-grid">
                    {displayedGroups.map((group) => (
                        <div
                            key={group.id}
                            className="group-card"
                            onClick={() => navigate(`/groups/${group.id}`)}
                        >
                            <div className="group-card-header">
                                <h3 className="group-name">{group.name}</h3>
                                {group.role === 'admin' && <span className="admin-badge">Admin</span>}
                            </div>
                            {group.description && (
                                <p className="group-description">{group.description}</p>
                            )}
                            <div className="group-meta">
                                <span className="member-count">
                                    👥 {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
                                </span>
                                <span className="group-date">{formatDate(group.created_at)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Create New Group</h2>
                            <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleCreateGroup}>
                            <div className="form-group">
                                <label>Group Name *</label>
                                <input
                                    type="text"
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                    placeholder="e.g., Trip to Goa 2026"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description (Optional)</label>
                                <textarea
                                    value={createForm.description}
                                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                    placeholder="Add a description for your group"
                                />
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={creating || !createForm.name.trim()}
                                >
                                    {creating ? 'Creating...' : 'Create Group'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Groups;
