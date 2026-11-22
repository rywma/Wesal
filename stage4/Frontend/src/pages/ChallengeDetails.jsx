import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getChallenge, joinChallenge, leaveChallenge } from '../services/challengesApi.js';
import { challengeDaysLeft, challengeGoal, formatDate } from '../utils/matchHelpers.js';
import '../styles/Challenges.css';
import '../styles/Footer.css';

function ChallengeDetails() {
    const { id } = useParams();
    const { isLoggedIn, tokens } = useAuth();
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionError, setActionError] = useState('');
    const [busy, setBusy] = useState(false);

    // GET /challenges/<id>/ : the challenge, my progress and the leaderboard
    const loadChallenge = useCallback(async () => {
        setError('');
        try {
            const data = await getChallenge(id, tokens.access);
            if (data.success) {
                setChallenge(data);
            } else {
                setError(data.message || 'Could not load this challenge.');
            }
        } catch (err) {
            console.error('Challenge error:', err);
            setError('Unable to connect to the server.');
        } finally {
            setLoading(false);
        }
    }, [id, tokens?.access]);

    useEffect(() => {
        if (!isLoggedIn || !tokens?.access) {
            setLoading(false);
            return;
        }
        loadChallenge();
    }, [isLoggedIn, tokens?.access, loadChallenge]);

    // Join or Leave, then load the challenge again so the leaderboard and count are up to date
    async function handleAction(action) {
        setBusy(true);
        setActionError('');
        try {
            const data = await action(id, tokens.access);
            if (data.success) {
                await loadChallenge();
            } else {
                setActionError(data.message);
            }
        } catch (err) {
            console.error('Challenge action error:', err);
            setActionError('Unable to connect to the server.');
        } finally {
            setBusy(false);
        }
    }

    function renderBody() {
        if (loading) return <p className="challenges-status">Loading challenge…</p>;
        if (error) return <p role="alert" className="challenges-status">{error}</p>;
        if (!challenge) return null;

        const left = challengeDaysLeft(challenge);
        const sport = `sport-${challenge.sport ? challenge.sport.toLowerCase() : 'any'}`;
        const done = Math.min(challenge.progress ?? 0, challenge.target);

        return (
            <>
                <Link to="/challenges" className="challenge-back">← Back to challenges</Link>

                <header className={`challenge-head ${sport}`}>
                    <p className="challenge-sport-tag">{challenge.sport || 'Any sport'}</p>
                    <h1>{challenge.title}</h1>
                    <p className="challenge-head-goal">{challengeGoal(challenge)}</p>
                    {challenge.description && (
                        <p className="challenge-head-description">{challenge.description}</p>
                    )}
                </header>

                <div className="challenge-layout">
                    <div className="challenge-main">
                        <section className={`challenge-progress ${sport}`}>
                            <h2>Your progress</h2>
                            {challenge.joined ? (
                                <>
                                    <p className="challenge-progress-number">
                                        {done}<span> / {challenge.target}</span>
                                    </p>
                                    <div className="progress">
                                        <div className="progress-track">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${(done * 100) / challenge.target}%` }}
                                            />
                                        </div>
                                    </div>
                                    {challenge.completed && (
                                        <p className="challenge-progress-done">
                                            Done! You earned {challenge.reward_points} points.                                        </p>
                                    )}
                                </>
                            ) : (
                                <p className="challenge-progress-empty">
                                    {left.ended ? 'This challenge has ended.' : "You haven't joined yet."}
                                </p>
                            )}

                            {actionError && <p role="alert" className="challenges-error">{actionError}</p>}

                            {!challenge.joined && !left.ended && (
                                <button
                                    type="button"
                                    className="challenge-join"
                                    onClick={() => handleAction(joinChallenge)}
                                    disabled={busy}
                                >
                                    {busy ? 'Joining…' : 'Join challenge'}
                                </button>
                            )}

                            {/* the backend won't let you leave a challenge you already completed */}
                            {challenge.joined && !challenge.completed && !left.ended && (
                                <button
                                    type="button"
                                    className="challenge-leave"
                                    onClick={() => handleAction(leaveChallenge)}
                                    disabled={busy}
                                >
                                    {busy ? 'Leaving…' : 'Leave challenge'}
                                </button>
                            )}
                        </section>

                        <section className="challenge-leaderboard">
                            <h2>Leaderboard</h2>
                            {challenge.leaderboard.length === 0 ? (
                                <p className="challenge-progress-empty">No one has joined yet.</p>
                            ) : (
                                <ol>
                                    {challenge.leaderboard.map((row) => (
                                        <li key={row.user_id} className={row.is_me ? 'is-me' : ''}>
                                            <span className="leaderboard-rank">{row.rank}</span>
                                            <span className="leaderboard-name">
                                                {row.name || 'Player'}
                                                {row.is_me && <small>You</small>}
                                            </span>
                                            <span className="leaderboard-progress">
                                                {Math.min(row.progress, challenge.target)} of {challenge.target}
                                                {row.completed && <small>Done</small>}
                                            </span>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </section>
                    </div>

                    <aside className="challenge-side">
                        <dl className="challenge-facts">
                            <div><dt>Time left</dt><dd>{left.ended ? `Ended ${left.number}` : `${left.number} ${left.label}`}</dd></div>
                            <div><dt>Dates</dt><dd>{formatDate(challenge.start_date)} – {formatDate(challenge.end_date)}</dd></div>
                            <div><dt>Players</dt><dd>{challenge.players_count}</dd></div>
                            <div><dt>Reward</dt><dd>{challenge.reward_points} points</dd></div>
                        </dl>
                    </aside>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="challenges-page">
                {!isLoggedIn ? (
                    <div className="login-needed">
                        <h1>Log in to see this challenge.</h1>
                        <p>Join challenges and earn points when you complete them.</p>
                        <Link to="/login">Log In</Link>
                    </div>
                ) : (
                    renderBody()
                )}
            </main>
            <Footer />
        </>
    );
}

export default ChallengeDetails;
