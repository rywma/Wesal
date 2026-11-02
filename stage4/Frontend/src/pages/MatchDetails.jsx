import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../styles/MatchDetails.css';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/Footer.css';
import MatchPaymentSection from '../components/MatchPaymentSection.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getMatchDetail, joinMatch, leaveMatch } from '../services/matchesApi.js';
import { formatDate, formatTime, spotsText } from '../utils/matchHelpers.js';

function MatchDetails() {
    const { id } = useParams();
    const { user, tokens, isLoggedIn, logout } = useAuth();
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);

    const loadMatch = useCallback(async () => {
        try {
            const data = await getMatchDetail(id);

            if (data.success) {
                setMatch(data);
                setError('');
            } else {
                setError(data.message || 'Match not found.');
            }
        } catch (err) {
            console.error('Match details error:', err);
            setError('Unable to connect to the server.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadMatch();
    }, [loadMatch]);

    const isCreator = Boolean(user && match && match.creator.id === user.id);
    const hasJoined = Boolean(user && match && match.participants.some((p) => p.user_id === user.id));
    const isFull = match && (match.status === 'full' || match.spots_left <= 0);

    async function handleJoinOrLeave() {
        const leaving = hasJoined;
        const question = leaving
            ? 'Are you sure you want to leave this match?'
            : `Join this match? Your share will be ${match.share_per_player} SAR.`;

        if (!window.confirm(question)) return;

        setBusy(true);
        setMessage('');

        try {
            const data = leaving
                ? await leaveMatch(match.id, tokens.access)
                : await joinMatch(match.id, tokens.access);

            if (data.success) {
                setMessage(leaving ? 'You left the match.' : 'You joined the match!');
                await loadMatch();
            } else if (data.sessionExpired) {
                logout();
            } else {
                setMessage(data.message);
            }
        } catch (err) {
            console.error('Join/leave error:', err);
            setMessage('Unable to connect to the server.');
        } finally {
            setBusy(false);
        }
    }

    function renderAction() {
        if (!isLoggedIn) {
            return <Link to="/login" className="details-btn">Log in to join</Link>;
        }

        if (isCreator) {
            return <p className="details-note">You are hosting this match.</p>;
        }

        if (!hasJoined && isFull) {
            return <button type="button" className="details-btn" disabled>Match is full</button>;
        }

        return (
            <button
                type="button"
                className={hasJoined ? 'details-btn leave' : 'details-btn'}
                onClick={handleJoinOrLeave}
                disabled={busy}
            >
                {busy ? 'Please wait...' : hasJoined ? 'Leave match' : 'Join match'}
            </button>
        );
    }

    function renderContent() {
        if (loading) return <p>Loading match...</p>;
        if (error) return <p role="alert">{error}</p>;

        const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.location)}`;

        return (
            <>
                <Link to="/matches" className="details-back">← Back to matches</Link>

                <section className="details-header">
                    <span className={`details-status ${isFull ? 'full' : ''}`}>
                        {isFull ? 'Full' : 'Open'} · {spotsText(match.spots_left)}
                    </span>
                    <h1>{match.sport}</h1>
                    <p>{formatDate(match.date)} · {formatTime(match.time)}</p>
                    <p>Hosted by {match.creator.name}</p>
                </section>

                <div className="details-grid">
                    <section className="details-card">
                        <h3>Venue</h3>
                        <p>{match.location}</p>
                        <a href={mapLink} target="_blank" rel="noreferrer">Open in Google Maps ↗</a>
                    </section>

                    <section className="details-card">
                        <h3>Price breakdown</h3>
                        <p>Total cost: <strong>{match.total_cost} SAR</strong></p>
                        <p>Players: <strong>{match.max_players}</strong></p>
                        <p>Each player pays: <strong>{match.share_per_player} SAR</strong></p>
                    </section>
                </div>

                <section className="details-card">
                    <h3>Players ({match.players_count} / {match.max_players})</h3>
                    <div className="capacity-bar">
                        <div style={{ width: `${(match.players_count / match.max_players) * 100}%` }} />
                    </div>
                    <ul className="participants">
                        {match.participants.map((player) => (
                            <li key={player.user_id}>
                                <span>
                                    {player.name}
                                    {player.user_id === match.creator.id && ' (host)'}
                                </span>
                                <span className={`payment-badge ${player.payment_status}`}>
                                    {player.payment_status === 'paid' ? 'Paid' : 'Pending'}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>

                <div className="details-action">
                    {renderAction()}
                    {message && <p role="status">{message}</p>}
                </div>

                {(isCreator || hasJoined) && (
                    <MatchPaymentSection
                        // reload payments when the player list changes
                        key={match.players_count}
                        matchId={match.id}
                        isOrganizer={isCreator}
                    />
                )}
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="match-details">{renderContent()}</main>
            <Footer />
        </>
    );
}

export default MatchDetails;
