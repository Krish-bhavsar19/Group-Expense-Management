import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../config/api';
import VoiceExpenseInput from '../components/VoiceExpenseInput';
import '../styles/expenses.css';
import '../styles/modal-buttons.css';
import '../styles/auth.css'; // For modal styles

const AddExpense = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'voice'

    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        category: 'other',
        date: new Date().toISOString().split('T')[0]
    });
    const [receipt, setReceipt] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }
            setReceipt(file);
            setReceiptPreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const removeReceipt = () => {
        setReceipt(null);
        setReceiptPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formPayload = new FormData();

            formPayload.append('groupId', groupId);
            formPayload.append('amount', formData.amount);
            formPayload.append('description', formData.description);
            formPayload.append('category', formData.category);
            formPayload.append('date', formData.date);
            formPayload.append('inputMethod', 'manual');

            if (receipt) {
                formPayload.append('receipt', receipt);
            }

            const response = await api.post('/expenses', formPayload, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                navigate(`/groups/${groupId}/expenses`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add expense');
        } finally {
            setLoading(false);
        }
    };

    const handleVoiceExpenseAdded = (expense) => {
        navigate(`/groups/${groupId}/expenses`);
    };

    return (
        <div className="expenses-container">
            <div className="add-expense-modal">
                <div className="modal-content" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div className="modal-header">
                        <h2>Add New Expense</h2>
                        <button className="modal-close" onClick={() => navigate(`/groups/${groupId}`)}>×</button>
                    </div>

                    <div className="tab-buttons">
                        <button
                            className={`tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
                            onClick={() => setActiveTab('manual')}
                        >
                            📝 Manual Entry
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'voice' ? 'active' : ''}`}
                            onClick={() => setActiveTab('voice')}
                        >
                            🎤 Voice Input
                        </button>
                    </div>

                    {activeTab === 'manual' ? (
                        <form onSubmit={handleSubmit} className="expense-form">
                            {error && <div className="error-message">{error}</div>}

                            <div className="form-group">
                                <label className="form-label">Amount (₹)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    className="form-input"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    placeholder="500"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    className="form-input"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Dinner with friends"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    name="category"
                                    className="category-select form-input"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option value="food">🍔 Food</option>
                                    <option value="transport">🚕 Transport</option>
                                    <option value="entertainment">🎬 Entertainment</option>
                                    <option value="shopping">🛍️ Shopping</option>
                                    <option value="bills">📱 Bills</option>
                                    <option value="other">📌 Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    className="form-input"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group receipt-upload">
                                <label className="receipt-label">📎 Attach Receipt (Optional)</label>
                                <div className="file-input-wrapper">
                                    <input
                                        type="file"
                                        id="receipt-upload"
                                        className="file-input"
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                    />
                                    <label htmlFor="receipt-upload" className="file-input-button">
                                        <span>Choose File</span>
                                        <span style={{ opacity: 0.7 }}>{receipt ? receipt.name : 'No file chosen'}</span>
                                    </label>
                                </div>

                                {receiptPreview && (
                                    <div className="receipt-preview">
                                        <img src={receiptPreview} alt="Receipt preview" />
                                        <button
                                            type="button"
                                            className="remove-receipt"
                                            onClick={removeReceipt}
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="modal-action-btn cancel"
                                    onClick={() => navigate(`/groups/${groupId}`)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="modal-action-btn submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Adding...' : 'Add Expense'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <VoiceExpenseInput
                            groupId={groupId}
                            onExpenseAdded={handleVoiceExpenseAdded}
                            onCancel={() => navigate(`/groups/${groupId}`)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddExpense;
