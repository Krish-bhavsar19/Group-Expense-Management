import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import '../styles/groups.css';

const JoinGroup = () => {
    const { inviteCode } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);
    const [status, setStatus] = useState(null); // null, 'pending', 'success', 'error'
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchGroupInfo();
    }, [inviteCode]);

    const fetchGroupInfo = async () => {
        try {
            const response = await api.get(`/invite/${inviteCode}`);
            setGroup(response.data.data);
        } catch (error) {
            console.error('Error fetching group info:', error);
            setStatus('error');
            setMessage('Invalid or expired invite link');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRequest = async () => {
        if (!user) {
            // Redirect to login
            navigate('/login', { state: { from: `/invite/${inviteCode}` } });
            return;
        }

        setRequesting(true);
        try {
            await api.post(`/invite/${inviteCode}/request`);
            setStatus('pending');
            setMessage('Join request sent! Waiting for admin approval.');
        } catch (error) {
            console.error('Error sending join request:', error);
            const errorMsg = error.response?.data?.message || 'Failed to send join request';

            if (errorMsg.includes('already a member')) {
                setStatus('success');
                setMessage('You are already a member of this group!');
                setTimeout(() => navigate(`/groups/${group.id}`), 2000);
            } else if (errorMsg.includes('already have a pending request')) {
                setStatus('pending');
                setMessage('You already have a pending request for this group.');
            } else {
                setStatus('error');
                setMessage(errorMsg);
            }
        } finally {
            setRequesting(false);
        }
    };

    if (loading) {
        return (
            <div className="join-group-container">
                <div className="join-group-card">
                    <h1>Loading...</h1>
                </div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="join-group-container">
                <div className="join-group-card">
                    <h1>❌ Invalid Invite</h1>
                    <p className="status-message status-error">{message}</p>
                    <button className="btn btn-primary" onClick={() => navigate('/groups')}>
                        Go to My Groups
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="join-group-container">
            <div className="join-group-card">
                <h1>You're Invited! 🎉</h1>

                <div className="group-info">
                    <h2 style={{ margin: '0 0 1rem 0', color: '#667eea', fontSize: '1.5rem' }}>
                        {group.name}
                    </h2>

                    {group.description && (
                        <p style={{ marginBottom: '1rem' }}>
                            <strong>Description:</strong> {group.description}
                        </p>
                    )}

                    <p>
                        <strong>Created by:</strong> {group.creator_name}
                    </p>

                    <p>
                        <strong>Members:</strong> {group.member_count} {group.member_count === 1 ? 'person' : 'people'}
                    </p>
                </div>

                {!user ? (
                    <div>
                        <p style={{ color: '#666', marginBottom: '1rem' }}>
                            Please log in to join this group
                        </p>
                        <button className="join-btn" onClick={() => navigate('/login', { state: { from: `/invite/${inviteCode}` } })}>
                            Login to Join
                        </button>
                    </div>
                ) : status ? (
                    <div className={`status-message status-${status}`}>
                        {message}
                    </div>
                ) : (
                    <button
                        className="join-btn"
                        onClick={handleJoinRequest}
                        disabled={requesting}
                    >
                        {requesting ? 'Sending Request...' : '🚀 Request to Join'}
                    </button>
                )}

                <button
                    className="btn btn-secondary"
                    style={{ marginTop: '1rem', width: '100%' }}
                    onClick={() => navigate('/groups')}
                >
                    View My Groups
                </button>
            </div>
        </div>
    );
};

export default JoinGroup;
