import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../config/api';
import SubgroupModal from '../components/Groups/SubgroupModal';
import '../styles/groups.css';

const GroupDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [subgroups, setSubgroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [copied, setCopied] = useState(false);
    const [newInviteLink, setNewInviteLink] = useState('');
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        isAlert: false
    });
    const [isSubgroupModalOpen, setIsSubgroupModalOpen] = useState(false);

    useEffect(() => {
        fetchGroupDetails();
        fetchPendingRequests();
        fetchSubgroups();
    }, [id]);

    const fetchGroupDetails = async () => {
        try {
            const response = await api.get(`/groups/${id}`);
            setGroup(response.data.data);
            setMembers(response.data.data.members || []);

            // Check if current user is admin
            const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;
            const currentMember = response.data.data.members?.find(m => m.user_id === currentUserId);
            setIsAdmin(currentMember?.role === 'admin');
        } catch (error) {
            console.error('Error fetching group details:', error);
            if (error.response?.status === 403) {
                alert('You are not a member of this group');
                navigate('/groups');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const response = await api.get(`/groups/${id}/requests`);
            setPendingRequests(response.data.data || []);
        } catch (error) {
            // Not admin, can't see requests
            setPendingRequests([]);
        }
    };

    const fetchSubgroups = async () => {
        try {
            const response = await api.get(`/subgroups/group/${id}`);
            setSubgroups(response.data.data || []);
        } catch (error) {
            console.error('Error fetching subgroups:', error);
            setSubgroups([]);
        }
    };

    const copyInviteLink = () => {
        const inviteLink = `${window.location.origin}/invite/${group.invite_code}`;
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleApprove = async (requestId) => {
        try {
            await api.post(`/groups/${id}/requests/${requestId}/approve`);
            await fetchPendingRequests();
            await fetchGroupDetails();
        } catch (error) {
            console.error('Error approving request:', error);
            setConfirmDialog({
                isOpen: true,
                title: 'Error',
                message: 'Failed to approve request',
                onConfirm: () => setConfirmDialog({ ...confirmDialog, isOpen: false }),
                isAlert: true
            });
        }
    };

    const handleReject = async (requestId) => {
        try {
            await api.post(`/groups/${id}/requests/${requestId}/reject`);
            await fetchPendingRequests();
        } catch (error) {
            console.error('Error rejecting request:', error);
            setConfirmDialog({
                isOpen: true,
                title: 'Error',
                message: 'Failed to reject request',
                onConfirm: () => setConfirmDialog({ ...confirmDialog, isOpen: false }),
                isAlert: true
            });
        }
    };

    const handleRemoveMember = (userId) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Remove Member',
            message: 'Are you sure you want to remove this member?',
            isAlert: false,
            onConfirm: async () => {
                try {
                    await api.delete(`/groups/${id}/members/${userId}`);
                    await fetchGroupDetails();
                    setConfirmDialog({ ...confirmDialog, isOpen: false });
                } catch (error) {
                    console.error('Error removing member:', error);
                    setConfirmDialog({
                        isOpen: true,
                        title: 'Error',
                        message: 'Failed to remove member',
                        onConfirm: () => setConfirmDialog({ ...confirmDialog, isOpen: false }),
                        isAlert: true
                    });
                }
            }
        });
    };

    const handleLeaveGroup = () => {
        setConfirmDialog({
            isOpen: true,
            title: 'Leave Group',
            message: 'Are you sure you want to leave this group?',
            isAlert: false,
            onConfirm: async () => {
                try {
                    await api.post(`/groups/${id}/leave`);
                    setConfirmDialog({ ...confirmDialog, isOpen: false });
                    navigate('/groups');
                } catch (error) {
                    console.error('Error leaving group:', error);
                    setConfirmDialog({
                        isOpen: true,
                        title: 'Error',
                        message: error.response?.data?.message || 'Failed to leave group',
                        onConfirm: () => setConfirmDialog({ ...confirmDialog, isOpen: false }),
                        isAlert: true
                    });
                }
            }
        });
    };

    const handleDeleteGroup = () => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Group',
            message: 'Are you sure you want to delete this group? This cannot be undone.',
            isAlert: false,
            onConfirm: async () => {
                try {
                    await api.delete(`/groups/${id}`);
                    setConfirmDialog({ ...confirmDialog, isOpen: false });
                    navigate('/groups');
                } catch (error) {
                    console.error('Error deleting group:', error);
                    setConfirmDialog({
                        isOpen: true,
                        title: 'Error',
                        message: 'Failed to delete group',
                        onConfirm: () => setConfirmDialog({ ...confirmDialog, isOpen: false }),
                        isAlert: true
                    });
                }
            }
        });
    };

    const handleToggleStatus = () => {
        const newStatus = group.status === 'inactive' ? 'active' : 'inactive';
        setConfirmDialog({
            isOpen: true,
            title: `Mark as ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
            message: `Are you sure you want to mark this group as ${newStatus}?`,
            isAlert: false,
            onConfirm: async () => {
                try {
                    await api.put(`/groups/${id}/status`, { status: newStatus });
                    await fetchGroupDetails();
                    setConfirmDialog({ ...confirmDialog, isOpen: false });
                } catch (error) {
                    console.error('Error updating status:', error);
                    setConfirmDialog({
                        isOpen: true,
                        title: 'Error',
                        message: 'Failed to update group status',
                        onConfirm: () => setConfirmDialog({ ...confirmDialog, isOpen: false }),
                        isAlert: true
                    });
                }
            }
        });
    };

    const handleMakeAdmin = (userId) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Promote to Admin',
            message: 'Are you sure you want to promote this member to Admin? They will have full control over the group.',
            isAlert: false,
            onConfirm: async () => {
                try {
                    await api.put(`/groups/${id}/members/${userId}/role`, { role: 'admin' });
                    await fetchGroupDetails();
                    setConfirmDialog({ ...confirmDialog, isOpen: false });
                } catch (error) {
                    console.error('Error promoting member to admin:', error);
                    setConfirmDialog({
                        isOpen: true,
                        title: 'Error',
                        message: 'Failed to promote member',
                        onConfirm: () => setConfirmDialog({ ...confirmDialog, isOpen: false }),
                        isAlert: true
                    });
                }
            }
        });
    };

    if (loading) {
        return (
            <div className="groups-container">
                <div className="empty-state">
                    <h2>Loading...</h2>
                </div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="groups-container">
                <div className="empty-state">
                    <h2>Group not found</h2>
                    <button className="btn btn-primary" onClick={() => navigate('/groups')}>
                        Back to Groups
                    </button>
                </div>
            </div>
        );
    }

    const inviteLink = `${window.location.origin}/invite/${group.invite_code}`;

    return (
        <div className="groups-container">
            <div className="modal-content" style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', paddingBottom: '6rem' }}>
                <div className="modal-header">
                    <h1 className="modal-title">
                        {group.name} {group.status === 'inactive' && <span style={{ fontSize: '1rem', background: 'var(--glass-bg)', padding: '0.2rem 0.6rem', borderRadius: '4px', verticalAlign: 'middle', marginLeft: '10px' }}>Inactive</span>}
                    </h1>
                    <button className="close-btn" onClick={() => navigate('/groups')}>
                        ←
                    </button>
                </div>

                {group.description && (
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{group.description}</p>
                )}

                {/* Invite Link Section */}
                <div className="invite-section">
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>📨 Invite Link</h3>
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Share this link with friends to invite them to the group
                    </p>
                    <div className="invite-link-container">
                        <div className="invite-link">{inviteLink}</div>
                        <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copyInviteLink}>
                            {copied ? '✓ Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>

                {/* Pending Requests (Admin Only) */}
                {isAdmin && pendingRequests.length > 0 && (
                    <div className="pending-requests">
                        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                            ⏳ Pending Requests ({pendingRequests.length})
                        </h3>
                        {pendingRequests.map((request) => (
                            <div key={request.id} className="request-item">
                                <div className="member-info">
                                    <h4>{request.user_name}</h4>
                                    <p>{request.user_email}</p>
                                    <p style={{ fontSize: '0.75rem', color: '#999' }}>
                                        Requested {new Date(request.requested_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="request-actions">
                                    <button className="approve-btn" onClick={() => handleApprove(request.id)}>
                                        ✓ Approve
                                    </button>
                                    <button className="reject-btn" onClick={() => handleReject(request.id)}>
                                        ✗ Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Members List */}
                <div className="members-list">
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                        👥 Members ({members.length})
                    </h3>
                    {members.map((member) => (
                        <div key={member.id} className="member-item">
                            <div className="member-info">
                                <h4>
                                    {member.name}
                                    {member.role === 'admin' && <span className="member-role">Admin</span>}
                                </h4>
                                <p>{member.email}</p>
                            </div>
                            {isAdmin && member.role !== 'admin' && (
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => handleMakeAdmin(member.user_id)}
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                                    >
                                        Make Admin
                                    </button>
                                    <button
                                        className="remove-member-btn"
                                        onClick={() => handleRemoveMember(member.user_id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Subgroups List */}
                <div className="subgroups-list" style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>
                            📂 Subgroups ({subgroups.length})
                        </h3>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setIsSubgroupModalOpen(true)}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                        >
                            + Create
                        </button>
                    </div>
                    {subgroups.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No subgroups yet.</p>
                    ) : (
                        subgroups.map((subgroup) => (
                            <div key={subgroup.id || subgroup.name} className="member-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                    <div className="member-info">
                                        <h4>{subgroup.name}</h4>
                                        {subgroup.description && <p>{subgroup.description}</p>}
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                            {subgroup.member_count} members • Created by {subgroup.creator_name || 'Unknown'}
                                        </p>
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => navigate(`/groups/${id}/expenses?subgroupId=${subgroup.id}`)}
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                                    >
                                        View
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Actions */}
                <div style={{ marginTop: '2.5rem' }}>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.25rem' }}>🎯 Actions</h3>
                    
                    {/* Primary Financial Actions */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem', paddingRight: isAdmin ? '4rem' : '0' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate(`/groups/${id}/expenses`)}
                            style={{ height: '3.5rem', fontSize: '1.1rem' }}
                        >
                            💰 View Expenses
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate(`/groups/${id}/settlement`)}
                            style={{ height: '3.5rem', fontSize: '1.1rem', background: 'var(--gradient-emerald)' }}
                        >
                            💸 Settle Up
                        </button>
                    </div>

                    {/* Secondary Management Actions */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingRight: isAdmin ? '4rem' : '0' }}>
                        <button 
                            className="btn btn-secondary" 
                            onClick={handleLeaveGroup}
                            style={{ padding: '0.75rem 1.5rem' }}
                        >
                            Leave Group
                        </button>
                        {isAdmin && (
                            <button 
                                className="btn btn-secondary" 
                                onClick={handleToggleStatus}
                                style={{ padding: '0.75rem 1.5rem' }}
                            >
                                Mark as {group.status === 'inactive' ? 'Active' : 'Inactive'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Delete Group Icon - Absolute positioned at bottom right */}
                {isAdmin && (
                    <button
                        className="delete-group-icon"
                        onClick={handleDeleteGroup}
                        title="Delete Group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                )}
            </div>

            <SubgroupModal
                isOpen={isSubgroupModalOpen}
                onClose={() => setIsSubgroupModalOpen(false)}
                groupId={id}
                members={members}
                onSubgroupCreated={fetchSubgroups}
            />

            {/* Custom Confirmation Modal */}
            {confirmDialog.isOpen && (
                <div className="custom-confirm-overlay">
                    <div className="custom-confirm-modal">
                        <h2 style={{ color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>{confirmDialog.title}</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{confirmDialog.message}</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            {!confirmDialog.isAlert && (
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                                    style={{ padding: '0.5rem 1rem' }}
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                className="btn btn-primary"
                                onClick={confirmDialog.onConfirm}
                                style={{ padding: '0.5rem 1rem', background: confirmDialog.isAlert ? 'var(--gradient-primary)' : 'var(--accent-red)' }}
                            >
                                {confirmDialog.isAlert ? 'OK' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupDetails;
