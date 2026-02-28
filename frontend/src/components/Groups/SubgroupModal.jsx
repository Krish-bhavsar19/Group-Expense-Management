import { useState } from 'react';
import api from '../../config/api';
import '../../styles/modal-buttons.css';

const SubgroupModal = ({ isOpen, onClose, groupId, members, onSubgroupCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const currentUser = JSON.parse(localStorage.getItem('user'));

    if (!isOpen) return null;

    const handleMemberToggle = (userId) => {
        // Prevent removing the creator
        if (userId === currentUser?.id) return;

        setSelectedMembers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Include current user in members list if not already there
            const membersList = selectedMembers.includes(currentUser?.id)
                ? selectedMembers
                : [...selectedMembers, currentUser?.id];

            await api.post('/subgroups/create', {
                groupId,
                name,
                description,
                members: membersList
            });

            onSubgroupCreated();
            onClose();
            // Reset form
            setName('');
            setDescription('');
            setSelectedMembers([]);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create subgroup');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Create Subgroup</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Subgroup Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Road Trip Crew"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What is this subgroup for?"
                            rows="2"
                        />
                    </div>

                    <div className="form-group">
                        <label>Select Members</label>
                        <div className="members-selection-list" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '10px' }}>
                            {members.map(member => (
                                <div key={member.user_id || member.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                    <input
                                        type="checkbox"
                                        id={`member-${member.user_id || member.id}`}
                                        checked={(member.user_id || member.id) === currentUser?.id ? true : selectedMembers.includes(member.user_id || member.id)}
                                        onChange={() => handleMemberToggle(member.user_id || member.id)}
                                        disabled={(member.user_id || member.id) === currentUser?.id}
                                    />
                                    <label htmlFor={`member-${member.user_id || member.id}`} style={{ marginLeft: '8px', cursor: 'pointer' }}>
                                        {member.name} {member.user_id === currentUser?.id ? '(You)' : ''}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading || !name.trim()}>
                            {loading ? 'Creating...' : 'Create Subgroup'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubgroupModal;
