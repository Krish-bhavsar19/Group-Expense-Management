import React, { useState } from 'react';
import api from '../config/api';
import '../styles/expenses.css';
import '../styles/modal-buttons.css';

const VoiceExpenseInput = ({ groupId, onExpenseAdded, onCancel }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [parsedData, setParsedData] = useState(null);
    const [editableData, setEditableData] = useState(null);

    const handleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setError('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
            setIsRecording(true);
            setError('');
            setTranscript('');
            setParsedData(null);
            setEditableData(null);
        };

        recognition.onresult = (event) => {
            const current = event.resultIndex;
            const transcriptText = event.results[current][0].transcript;
            setTranscript(transcriptText);
        };

        recognition.onerror = (event) => {
            setIsRecording(false);
            setError('Voice recognition error. Please try again.');
            console.error('Speech recognition error:', event.error);
        };

        recognition.onend = async () => {
            setIsRecording(false);

            if (transcript.trim()) {
                await parseTranscript(transcript);
            }
        };

        recognition.start();
    };

    const parseTranscript = async (text) => {
        setIsProcessing(true);
        setError('');

        try {
            const response = await api.post('/expenses/parse-voice', {
                transcript: text
            });

            if (response.data.success) {
                const parsed = response.data.parsed;
                setParsedData(parsed);
                setEditableData({
                    amount: parsed.amount,
                    description: parsed.description,
                    category: parsed.category,
                    date: parsed.date
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to parse voice input. Please try again.');
            console.error('Parse error:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditableData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editableData) return;

        setIsProcessing(true);
        setError('');

        try {
            const response = await api.post('/expenses', {
                groupId,
                amount: parseFloat(editableData.amount),
                description: editableData.description,
                category: editableData.category,
                date: editableData.date,
                inputMethod: 'voice',
                voiceTranscript: transcript
            });

            if (response.data.success) {
                onExpenseAdded(response.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add expense');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="voice-input-container">
            <button
                className={`mic-button ${isRecording ? 'recording' : ''}`}
                onClick={handleVoiceInput}
                disabled={isProcessing}
            >
                <span className="mic-icon">🎤</span>
            </button>

            {/* Editable Transcript */}
            <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>
                    Edit your speech (if needed):
                </label>
                <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Tap the microphone and speak..."
                    style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '2px solid #e0e0e0',
                        fontSize: '1rem',
                        minHeight: '60px',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                    }}
                />
                {transcript && !isProcessing && !editableData && (
                    <button
                        onClick={() => parseTranscript(transcript)}
                        className="modal-action-btn submit"
                        style={{ marginTop: '1rem', width: '100%' }}
                    >
                        Parse & Continue
                    </button>
                )}
            </div>

            {isProcessing && (
                <div className="processing">
                    <div className="processing-spinner"></div>
                    <div className="processing-text">Processing...</div>
                </div>
            )}

            {error && (
                <div className="error-message" style={{ color: '#ef4444', margin: '1rem 0' }}>
                    {error}
                </div>
            )}

            {/* Debug: Show what state we have */}
            {console.log('VoiceInput State:', { transcript, isProcessing, editableData, parsedData })}

            {editableData && !isProcessing && (
                <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
                    <div className="parsed-result" style={{
                        background: '#f8f9fa',
                        border: '2px solid #667eea',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        textAlign: 'left'
                    }}>
                        <h4 style={{ marginTop: 0, color: '#667eea', marginBottom: '1rem' }}>
                            ✅ Review & Edit Expense:
                        </h4>

                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>
                                Amount (₹) *
                            </label>
                            <input
                                type="number"
                                name="amount"
                                value={editableData.amount}
                                onChange={handleEditChange}
                                required
                                step="0.01"
                                min="0"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '2px solid #e0e0e0',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>
                                Description *
                            </label>
                            <input
                                type="text"
                                name="description"
                                value={editableData.description}
                                onChange={handleEditChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '2px solid #e0e0e0',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>
                                Category *
                            </label>
                            <select
                                name="category"
                                value={editableData.category}
                                onChange={handleEditChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '2px solid #e0e0e0',
                                    fontSize: '1rem'
                                }}
                            >
                                <option value="food">🍔 Food & Dining</option>
                                <option value="transport">🚗 Transport</option>
                                <option value="entertainment">🎬 Entertainment</option>
                                <option value="shopping">🛍️ Shopping</option>
                                <option value="bills">💡 Bills & Utilities</option>
                                <option value="other">📌 Other</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>
                                Date *
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={editableData.date}
                                onChange={handleEditChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '2px solid #e0e0e0',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="modal-action-btn cancel"
                                onClick={onCancel}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="modal-action-btn submit"
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Adding...' : 'Add Expense'}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {!editableData && !isProcessing && (
                <div className="voice-hints">
                    <h4>💡 Try saying:</h4>
                    <ul>
                        <li>"Paid 250 for groceries"</li>
                        <li>"Spent 500 rupees on dinner with friends"</li>
                        <li>"I spent 1200 on taxi yesterday"</li>
                        <li>"300 for movie tickets"</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default VoiceExpenseInput;
