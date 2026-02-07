import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../config/api';
import '../styles/expenses.css';
import '../styles/modal-buttons.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Expenses = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [editingExpense, setEditingExpense] = useState(null);
    const [editForm, setEditForm] = useState({
        amount: '',
        description: '',
        category: '',
        date: ''
    });
    const [updating, setUpdating] = useState(false);

    const currentUserId = parseInt(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : 0);

    useEffect(() => {
        fetchExpenses();
    }, [groupId]);

    const fetchExpenses = async () => {
        try {
            const response = await api.get(`/expenses/group/${groupId}`);

            if (response.data.success) {
                setExpenses(response.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (expense) => {
        setEditingExpense(expense);
        setEditForm({
            amount: expense.amount,
            description: expense.description,
            category: expense.category,
            date: expense.date
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdateExpense = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError('');

        try {
            const response = await api.put(`/expenses/${editingExpense.id}`, editForm);

            if (response.data.success) {
                // Update expenses list
                setExpenses(expenses.map(exp =>
                    exp.id === editingExpense.id ? { ...exp, ...editForm } : exp
                ));
                setEditingExpense(null);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update expense');
        } finally {
            setUpdating(false);
        }
    };

    const getCategoryIcon = (category) => {
        const icons = {
            food: '🍔',
            transport: '🚕',
            entertainment: '🎬',
            shopping: '🛍️',
            bills: '📱',
            other: '📌'
        };
        return icons[category] || '📌';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="expenses-container">
                <div className="loading-state" style={{ textAlign: 'center', color: 'white', padding: '3rem' }}>
                    <div className="processing-spinner" style={{ margin: '0 auto 1rem' }}></div>
                    <p>Loading expenses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="expenses-container">
            <div className="expenses-header">
                <h1 className="expenses-title">Group Expenses</h1>
                <button
                    className="add-expense-btn"
                    onClick={() => navigate(`/groups/${groupId}/add-expense`)}
                >
                    + Add Expense
                </button>
            </div>

            {error && (
                <div className="error-message" style={{ maxWidth: '1200px', margin: '0 auto 2rem', color: 'white', background: 'rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '12px' }}>
                    {error}
                </div>
            )}

            <div className="expenses-grid">
                {expenses.length === 0 ? (
                    <div className="empty-state" style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '16px',
                        padding: '3rem',
                        textAlign: 'center',
                        color: '#666'
                    }}>
                        <p style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>📊</p>
                        <p style={{ fontSize: '1.2rem', margin: '0' }}>No expenses yet</p>
                        <p style={{ margin: '0.5rem 0 1.5rem 0' }}>Add your first expense to get started!</p>
                        <button
                            className="add-expense-btn"
                            onClick={() => navigate(`/groups/${groupId}/add-expense`)}
                        >
                            + Add Expense
                        </button>
                    </div>
                ) : (
                    expenses.map((expense) => (
                        <div key={expense.id} className="expense-card">
                            <div className="expense-header">
                                <div className="expense-category">
                                    <div className={`category-icon ${expense.category}`}>
                                        {getCategoryIcon(expense.category)}
                                    </div>
                                    <div>
                                        <h3 className="expense-description">{expense.description}</h3>
                                        <p className="category-label">{expense.category}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div className="expense-amount">₹{parseFloat(expense.amount).toFixed(2)}</div>
                                    {expense.paid_by === currentUserId && (
                                        <button
                                            className="edit-btn"
                                            onClick={() => handleEditClick(expense)}
                                            title="Edit expense"
                                            style={{
                                                background: '#667eea',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '0.5rem 1rem',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            ✏️ Edit
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="expense-details">
                                <p className="expense-meta">Paid by {expense.paid_by_name}</p>
                                <p className="expense-meta">{formatDate(expense.expense_date)}</p>
                                <div className="expense-indicators">
                                    {expense.input_method === 'voice' && (
                                        <span className="indicator voice" title="Added via voice">
                                            🎤 Voice
                                        </span>
                                    )}
                                    {expense.receipt_url && (
                                        <span
                                            className="indicator receipt"
                                            onClick={() => setSelectedReceipt(expense.receipt_url)}
                                            title="View receipt"
                                        >
                                            📎 Receipt
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedReceipt && (
                <div className="receipt-modal-overlay" onClick={() => setSelectedReceipt(null)}>
                    <div className="receipt-modal-content" onClick={(e) => e.stopPropagation()}>
                        <img src={selectedReceipt} alt="Receipt" />
                        <button
                            className="close-receipt-modal"
                            onClick={() => setSelectedReceipt(null)}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {editingExpense && (
                <div className="modal-overlay" onClick={() => setEditingExpense(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Edit Expense</h2>
                            <button className="close-btn" onClick={() => setEditingExpense(null)}>×</button>
                        </div>
                        <form onSubmit={handleUpdateExpense}>
                            <div className="form-group">
                                <label>Amount *</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={editForm.amount}
                                    onChange={handleEditChange}
                                    required
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description *</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={editForm.description}
                                    onChange={handleEditChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Category *</label>
                                <select
                                    name="category"
                                    value={editForm.category}
                                    onChange={handleEditChange}
                                    required
                                >
                                    <option value="food">🍔 Food & Dining</option>
                                    <option value="transport">🚗 Transport</option>
                                    <option value="entertainment">🎬 Entertainment</option>
                                    <option value="shopping">🛍️ Shopping</option>
                                    <option value="bills">💡 Bills & Utilities</option>
                                    <option value="health">🏥 Health</option>
                                    <option value="other">📌 Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Date *</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={editForm.date}
                                    onChange={handleEditChange}
                                    required
                                />
                            </div>
                            {error && (
                                <div className="error-message" style={{ marginBottom: '1rem' }}>
                                    {error}
                                </div>
                            )}
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="modal-action-btn cancel"
                                    onClick={() => setEditingExpense(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="modal-action-btn submit"
                                    disabled={updating}
                                >
                                    {updating ? 'Updating...' : 'Update Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button
                    style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        padding: '0.75rem 2rem',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                    onClick={() => navigate(`/groups/${groupId}`)}
                >
                    ← Back to Group
                </button>
            </div>
        </div>
    );
};

export default Expenses;
