import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../config/api';
import '../styles/settlement.css';

const Settlement = () => {
    const { groupId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const urlSubgroupId = searchParams.get('subgroupId');
    const navigate = useNavigate();
    const [settlement, setSettlement] = useState(null);
    const [subgroups, setSubgroups] = useState([]);
    const [activeSubgroupFilter, setActiveSubgroupFilter] = useState(urlSubgroupId || 'main');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchSubgroups();
            await fetchSettlement(activeSubgroupFilter);
            setLoading(false);
        };
        loadData();
    }, [groupId, activeSubgroupFilter]);

    const fetchSubgroups = async () => {
        try {
            const response = await api.get(`/subgroups/group/${groupId}`);
            setSubgroups(response.data.data || []);
        } catch (err) {
            console.error('Failed to load subgroups', err);
        }
    };

    const fetchSettlement = async (filterId) => {
        try {
            const endpoint = filterId !== 'main'
                ? `/settlement/group/${groupId}?subgroupId=${filterId}`
                : `/settlement/group/${groupId}`;

            const response = await api.get(endpoint);
            if (response.data.success) {
                setSettlement(response.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load settlement');
        }
    };

    if (loading) {
        return (
            <div className="settlement-container">
                <div className="loading-state">
                    <div className="processing-spinner"></div>
                    <p>Calculating balances...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="settlement-container">
                <div className="error-state">
                    <p>{error}</p>
                    <button onClick={() => navigate(`/groups/${groupId}`)}>Back to Group</button>
                </div>
            </div>
        );
    }

    const getUserBalance = () => {
        const userId = parseInt(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : 0);
        console.log('🔍 Frontend: Looking for userId:', userId);
        console.log('🔍 Frontend: Available balances:', settlement.balances);
        const balance = settlement.balances.find(b => b.userId === userId);
        console.log('🔍 Frontend: Found balance:', balance);
        return balance;
    };

    // Filter settlements to show only those involving current user
    const getUserSettlements = () => {
        const userId = parseInt(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : 0);
        const toReceive = settlement.settlements.filter(s => s.to === userId);
        const toPay = settlement.settlements.filter(s => s.from === userId);
        return { toReceive, toPay };
    };

    const userBalance = getUserBalance();
    const { toReceive, toPay } = getUserSettlements();

    return (
        <div className="settlement-container">
            <div className="settlement-header">
                <h1 className="settlement-title">Your Settlement</h1>
                <button className="back-btn" onClick={() => navigate(`/groups/${groupId}`)}>
                    ← Back to Group
                </button>
            </div>

            <div className="settlement-content">
                {subgroups.length > 0 && (
                    <div style={{ maxWidth: '1200px', margin: '0 auto 1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                border: 'none',
                                background: activeSubgroupFilter === 'main' ? '#10b981' : 'rgba(255,255,255,0.7)',
                                color: activeSubgroupFilter === 'main' ? 'white' : '#333',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.2s'
                            }}
                            onClick={() => {
                                setActiveSubgroupFilter('main');
                                setSearchParams({ subgroupId: 'main' });
                            }}
                        >
                            Main Group
                        </button>
                        {subgroups.map(sg => (
                            <button
                                key={sg.id}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    border: 'none',
                                    background: activeSubgroupFilter === sg.id.toString() ? '#10b981' : 'rgba(255,255,255,0.7)',
                                    color: activeSubgroupFilter === sg.id.toString() ? 'white' : '#333',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
                                }}
                                onClick={() => {
                                    setActiveSubgroupFilter(sg.id.toString());
                                    setSearchParams({ subgroupId: sg.id.toString() });
                                }}
                            >
                                {sg.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Summary Cards */}
                <div className="summary-cards">
                    <div className="summary-card total">
                        <h3>Total Group Expenses</h3>
                        <p className="amount">₹{settlement.totalExpenses.toFixed(2)}</p>
                    </div>
                    <div className="summary-card per-person">
                        <h3>Your Share</h3>
                        <p className="amount">₹{settlement.perPersonShare.toFixed(2)}</p>
                    </div>
                    {userBalance && (
                        <div className={`summary-card user-balance ${userBalance.balance >= 0 ? 'positive' : 'negative'}`}>
                            <h3>Your Balance</h3>
                            <p className="amount">
                                {userBalance.balance >= 0 ? '+' : '-'}₹{Math.abs(userBalance.balance).toFixed(2)}
                            </p>
                            <p className="balance-label">
                                {userBalance.balance >= 0
                                    ? 'You are owed'
                                    : 'You owe'}
                            </p>
                        </div>
                    )}
                </div>

                {/* User's Payment Details */}
                {userBalance && (
                    <div className="balances-section">
                        <h2>Your Payment Summary</h2>
                        <div className="balance-card" style={{ maxWidth: '600px' }}>
                            <div className="balance-header">
                                <h3>Your Contributions</h3>
                            </div>
                            <div className="balance-details">
                                <div className="detail-row">
                                    <span>You paid:</span>
                                    <span>₹{userBalance.paid.toFixed(2)}</span>
                                </div>
                                <div className="detail-row">
                                    <span>Your share:</span>
                                    <span>₹{userBalance.share.toFixed(2)}</span>
                                </div>
                                <div className="detail-row" style={{
                                    borderTop: '2px solid #f0f0f0',
                                    paddingTop: '0.5rem',
                                    marginTop: '0.5rem',
                                    fontWeight: 'bold'
                                }}>
                                    <span>Balance:</span>
                                    <span style={{ color: userBalance.balance >= 0 ? '#10b981' : '#ef4444' }}>
                                        {userBalance.balance >= 0 ? '+' : ''}₹{userBalance.balance.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* You Will Receive Section */}
                {toReceive.length > 0 && (
                    <div className="settlements-section">
                        <h2 style={{ color: '#10b981' }}>💰 You Will Receive</h2>
                        <p className="settlements-subtitle">
                            You will receive ₹{toReceive.reduce((sum, txn) => sum + txn.amount, 0).toFixed(2)} total
                        </p>
                        <div className="settlements-list">
                            {toReceive.map((txn, index) => (
                                <div key={index} className="settlement-card" style={{ borderLeft: '4px solid #10b981' }}>
                                    <div className="settlement-info">
                                        <span className="from-name">{txn.fromName}</span>
                                        <span className="settlement-text">pays you</span>
                                    </div>
                                    <div className="settlement-amount" style={{ color: '#10b981' }}>
                                        +₹{txn.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* You Will Pay Section */}
                {toPay.length > 0 && (
                    <div className="settlements-section">
                        <h2 style={{ color: '#ef4444' }}>💸 You Will Pay</h2>
                        <p className="settlements-subtitle">
                            You need to pay ₹{toPay.reduce((sum, txn) => sum + txn.amount, 0).toFixed(2)} total
                        </p>
                        <div className="settlements-list">
                            {toPay.map((txn, index) => (
                                <div key={index} className="settlement-card" style={{ borderLeft: '4px solid #ef4444' }}>
                                    <div className="settlement-info">
                                        <span className="settlement-text">You pay</span>
                                        <span className="to-name">{txn.toName}</span>
                                    </div>
                                    <div className="settlement-amount" style={{ color: '#ef4444' }}>
                                        -₹{txn.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {toReceive.length === 0 && toPay.length === 0 && userBalance && Math.abs(userBalance.balance) < 0.01 && (
                    <div className="no-settlements">
                        <p>🎉 You're all settled up! No pending payments.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settlement;
