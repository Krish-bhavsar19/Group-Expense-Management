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

    return (
        <div className="groups-container">
            <div className="groups-header">
                <h1 className="groups-title">My Groups</h1>
                <button className="create-group-btn" onClick={() => setShowCreateModal(true)}>
                    + Create Group
                </button>
            </div>

            {groups.length === 0 ? (
                <div className="empty-state">
                    <h2>No groups yet</h2>
                    <p>Create your first group to start managing expenses with friends!</p>
                    <button className="create-group-btn" onClick={() => setShowCreateModal(true)}>
                        Create Your First Group
                    </button>
                </div>
            ) : (
                <div className="groups-grid">
                    {groups.map((group) => (
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
