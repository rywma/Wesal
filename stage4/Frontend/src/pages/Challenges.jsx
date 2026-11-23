import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getChallenges, joinChallenge } from '../services/challengesApi.js';
import { challengeDaysLeft, challengeGoal } from '../utils/matchHelpers.js';
import '../styles/Challenges.css';
import '../styles/Footer.css';

function Challenges() {
    const { isLoggedIn, tokens } = useAuth();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [joiningId, setJoiningId] = useState(null);

    useEffect(() => {
        if (!isLoggedIn || !tokens?.access) {
            setLoading(false);
            return;
        }

        async function fetchChallenges() {
            setLoading(true);
            setError('');
            try {
                const data = await getChallenges(tokens.access);
                if (data.success) {
                    setChallenges(data.results || []);
                } else {
                    setError(data.message || 'Could not load challenges.');
                }
            } catch (err) {
                console.error('Challenges error:', err);
                setError('Unable to connect to the server.');
            } finally {
                setLoading(false);
            }
        }

        fetchChallenges();
    }, [isLoggedIn, tokens?.access]);

    async function handleJoin(challengeId) {
        setJoiningId(challengeId);
        setError('');
        try {
            const data = await joinChallenge(challengeId, tokens.access);
            if (data.success) {
                // the backend sends back the challenge with my progress, so swap just that one
                setChallenges((list) => list.map((c) => (c.id === challengeId ? data : c)));
            } else {
                setError(data.message);
            }
        } catch (err) {
            console.error('Join challenge error:', err);
            setError('Unable to connect to the server.');
        } finally {
            setJoiningId(null);
        }
    }

    // One challenge per row, like the games on Find Games
    function renderRow(challenge) {
        const left = challengeDaysLeft(challenge);
        const done = Math.min(challenge.progress ?? 0, challenge.target);
        const sport = challenge.sport ? challenge.sport.toLowerCase() : 'any';

        return (
            <li key={challenge.id} className={`challenge-row sport-${sport}`}>
                <p className="challenge-row-days">
                    {left.number}
                    <span>{left.label}</span>
                </p>

                <div>
                    <p className="challenge-row-sport">{challenge.sport || 'Any sport'}</p>
                    {/* this link covers the whole row, so clicking anywhere opens the challenge */}
                    <Link to={`/challenges/${challenge.id}`} className="challenge-row-title">
                        {challenge.title}
                    </Link>
                </div>

                <div className="challenge-row-goal">
                    <p>{challengeGoal(challenge)}</p>
                    {challenge.joined && (
                        <div className="progress">
                            <div className="progress-track">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${(done * 100) / challenge.target}%` }}
                                />
                            </div>
                            <span>{done} of {challenge.target}</span>
                        </div>
                    )}
                </div>

                <p className="challenge-row-players">
                    {challenge.players_count} {challenge.players_count === 1 ? 'player' : 'players'}
                    {challenge.completed && <span className="challenge-row-done">Completed</span>}                </p>

                {!challenge.joined && !left.ended ? (
                    <button
                        type="button"
                        className="challenge-join"
                        onClick={() => handleJoin(challenge.id)}
                        disabled={joiningId === challenge.id}
                    >
                        {joiningId === challenge.id ? 'Joining…' : 'Join'}
                    </button>
                ) : (
                    <span className="challenge-view">View</span>
                )}
            </li>
        );
    }

    const current = challenges.filter((c) => !challengeDaysLeft(c).ended);
    const ended = challenges.filter((c) => challengeDaysLeft(c).ended);

    return (
        <>
            <Navbar />
            <main className="challenges-page">
                {!isLoggedIn ? (
                    <div className="login-needed">
                        <h1>Log in to see challenges.</h1>
                        <p>Join challenges and earn points when you complete them.</p>
                        <Link to="/login">Log In</Link>
                    </div>
                ) : (
                    <>
                        <h1>Challenges</h1>
                        <p className="challenges-lead">
                            Complete challenges, earn points and level up your badge.
                        </p>

                        {error && <p role="alert" className="challenges-error">{error}</p>}

                        {loading ? (
                            <p className="challenges-status">Loading challenges…</p>
                        ) : (
                            <>
                                <section>
                                    <h2>This month</h2>
                                    {current.length === 0 ? (
                                        <p className="challenges-status">No challenges right now. Check back soon.</p>
                                    ) : (
                                        <ul className="challenges-list">{current.map(renderRow)}</ul>
                                    )}
                                </section>

                                {ended.length > 0 && (
                                    <section className="challenges-ended">
                                        <h2>Ended</h2>
                                        <ul className="challenges-list">{ended.map(renderRow)}</ul>
                                    </section>
                                )}
                            </>
                        )}
                    </>
                )}
            </main>
            <Footer />
        </>
    );
}

export default Challenges;
