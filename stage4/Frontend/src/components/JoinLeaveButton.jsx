import '../styles/JoinLeaveButton.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { joinMatch, leaveMatch } from '../services/matchesApi.js';
import { spotsText } from '../utils/matchHelpers.js';

// Shows how full a match is, and the right button for this user
function JoinLeaveButton({ match, isJoined, isCreator, hasPaid, onChange }) {
    const [confirming, setConfirming] = useState(null); // 'join', 'leave' or null
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { isLoggedIn, tokens, logout } = useAuth();
    const navigate = useNavigate();

    const isFull = match.status === 'full' || match.spots_left <= 0;
    const isClosed = match.status === 'cancelled' || match.status === 'completed';
    const almostFull = !isFull && match.spots_left <= 2;
    const percent = Math.min(100, Math.round((match.players_count / match.max_players) * 100));

    const handleConfirm = async () => {
        setLoading(true);
        setMessage('');

        try {
            const data = confirming === 'join'
                ? await joinMatch(match.id, tokens.access)
                : await leaveMatch(match.id, tokens.access);

            if (data.success) {
                setConfirming(null);
                onChange();
            } else if (data.sessionExpired) {
                await logout();
                navigate('/login');
            } else {
                setConfirming(null);
                setMessage(data.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error('Join/leave error:', error);
            setMessage('Unable to connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    const renderAction = () => {
        if (isCreator) {
            return <p className="join-note host">You're hosting this match</p>;
        }

        if (!isLoggedIn) {
            return (
                <Link to="/login" className="join-btn">
                    Log in to join
                </Link>
            );
        }

        if (isJoined) {
            return (
                <>
                    <p className="join-note joined">You're in ✓</p>
                    {hasPaid ? (
                        <p className="join-hint">You've paid. Ask the host if you can't make it.</p>
                    ) : (
                        <button
                            type="button"
                            className="leave-btn"
                            onClick={() => setConfirming('leave')}
                        >
                            Leave match
                        </button>
                    )}
                </>
            );
        }

        if (isClosed) {
            return (
                <button type="button" className="join-btn" disabled>
                    This match is {match.status}
                </button>
            );
        }

        if (isFull) {
            return (
                <button type="button" className="join-btn" disabled>
                    Match is full
                </button>
            );
        }

        return (
            <button
                type="button"
                className="join-btn"
                onClick={() => setConfirming('join')}
            >
                Join · {match.share_per_player} SAR
            </button>
        );
    };

    return (
        <div className="join-leave">
            <div className="capacity">
                <div className="capacity-text">
                    <span>{match.players_count} / {match.max_players} joined</span>
                    <span>{isFull ? 'Full' : spotsText(match.spots_left)}</span>
                </div>
                <div
                    className="capacity-bar"
                    role="progressbar"
                    aria-label="Players joined"
                    aria-valuemin={0}
                    aria-valuemax={match.max_players}
                    aria-valuenow={match.players_count}
                >
                    <div
                        className={`capacity-fill ${isFull ? 'full' : almostFull ? 'almost' : ''}`}
                        style={{ width: `${percent}%` }}
                    />
                </div>
            </div>

            {confirming ? (
                <div className="join-confirm" role="dialog" aria-label="Confirm">
                    <h3>{confirming === 'join' ? 'Join this match?' : 'Leave this match?'}</h3>
                    <p>
                        {confirming === 'join'
                            ? `Your share is ${match.share_per_player} SAR. You only pay once all ${match.max_players} spots are filled.`
                            : 'Your spot opens up for someone else. You can join again later if there is space.'}
                    </p>
                    <div className="join-confirm-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => setConfirming(null)}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="join-btn"
                            onClick={handleConfirm}
                            disabled={loading}
                        >
                            {loading ? 'Please wait...' : confirming === 'join' ? 'Join' : 'Leave'}
                        </button>
                    </div>
                </div>
            ) : (
                renderAction()
            )}

            {message && (
                <p className="join-message" role="status">
                    {message}
                </p>
            )}
        </div>
    );
}

export default JoinLeaveButton;
