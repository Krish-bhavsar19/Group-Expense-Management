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
            alert('Failed to approve request');
        }
    };

    const handleReject = async (requestId) => {
        try {
            await api.post(`/groups/${id}/requests/${requestId}/reject`);
            await fetchPendingRequests();
        } catch (error) {
            console.error('Error rejecting request:', error);
            alert('Failed to reject request');
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!confirm('Are you sure you want to remove this member?')) return;

        try {
            await api.delete(`/groups/${id}/members/${userId}`);
            await fetchGroupDetails();
        } catch (error) {
            console.error('Error removing member:', error);
            alert('Failed to remove member');
        }
    };

    const handleLeaveGroup = async () => {
        if (!confirm('Are you sure you want to leave this group?')) return;

        try {
            await api.post(`/groups/${id}/leave`);
            navigate('/groups');
        } catch (error) {
            console.error('Error leaving group:', error);
            alert(error.response?.data?.message || 'Failed to leave group');
        }
    };

    const handleDeleteGroup = async () => {
        if (!confirm('Are you sure you want to delete this group? This cannot be undone.')) return;

        try {
            await api.delete(`/groups/${id}`);
            navigate('/groups');
        } catch (error) {
            console.error('Error deleting group:', error);
            alert('Failed to delete group');
        }
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
            <div className="modal-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="modal-header">
                    <h1 className="modal-title">{group.name}</h1>
                    <button className="close-btn" onClick={() => navigate('/groups')}>
                        ←
                    </button>
                </div>

                {group.description && (
                    <p style={{ color: '#666', marginBottom: '1.5rem' }}>{group.description}</p>
                )}

                {/* Invite Link Section */}
                <div className="invite-section">
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>📨 Invite Link</h3>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
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
                        <h3 style={{ color: '#333', marginBottom: '1rem' }}>
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
                    <h3 style={{ color: '#333', marginBottom: '1rem' }}>
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
                                <button
                                    className="remove-member-btn"
                                    onClick={() => handleRemoveMember(member.user_id)}
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Subgroups List */}
                <div className="subgroups-list" style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ color: '#333', margin: 0 }}>
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
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>No subgroups yet.</p>
                    ) : (
                        subgroups.map((subgroup) => (
                            <div key={subgroup.id || subgroup.name} className="member-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                    <div className="member-info">
                                        <h4>{subgroup.name}</h4>
                                        {subgroup.description && <p>{subgroup.description}</p>}
                                        <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '4px' }}>
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
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/groups/${id}/expenses`)}
                        style={{ flex: 1 }}
                    >
                        💰 View Expenses
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/groups/${id}/settlement`)}
                        style={{ flex: 1, background: '#10b981' }}
                    >
                        💸 Settle Up
                    </button>
                    <button className="btn btn-secondary" onClick={handleLeaveGroup}>
                        Leave Group
                    </button>
                    {isAdmin && (
                        <button className="btn" style={{ background: '#ef4444', color: 'white' }} onClick={handleDeleteGroup}>
                            Delete Group
                        </button>
                    )}
                </div>
            </div>

            <SubgroupModal
                isOpen={isSubgroupModalOpen}
                onClose={() => setIsSubgroupModalOpen(false)}
                groupId={id}
                members={members}
                onSubgroupCreated={fetchSubgroups}
            />
        </div>
    );
};

export default GroupDetails;
