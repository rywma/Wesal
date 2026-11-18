import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/Footer.css';
import '../styles/MyMatches.css';
import '../styles/BrowseMatches.css';
import BrowseMatchCard from '../components/BrowseMatchCard.jsx';
import { useState, useEffect } from 'react';
import { getMyMatches } from '../services/matchesApi.js';
import { getMyBadges } from '../services/challengesApi.js';

function MyMatches() {
    const { isLoggedIn, user, tokens } = useAuth();

    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [badges, setBadges] = useState([]);

    // badges are the challenges I completed
    useEffect(() => {
        if (!isLoggedIn || !tokens?.access) {
            setBadges([]);
            return;
        }
        getMyBadges(tokens.access)
            .then((data) => {
                if (data.success) setBadges(data.results || []);
            })
            .catch((err) => console.error('Badges error:', err));
    }, [isLoggedIn, tokens?.access]);

    useEffect(() => {
        if (!isLoggedIn || !tokens?.access) {
            setMatches([]);
            setLoading(false);
            return;
        }

        let active = true;

        async function loadMyMatches() {
            setLoading(true);
            setError('');

            try {
                const data = await getMyMatches(tokens.access);

                if (!data.success) {
                    throw new Error(data.message || 'Failed to load matches.');
                }

                if (!Array.isArray(data.results)) {
                    throw new Error('Invalid matches data.');
                }

                if (active) {
                    setMatches(data.results);
                }
            } catch (err) {
                if (active) {
                    setError(err.message);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadMyMatches();

        return () => {
            active = false;
        };
    }, [isLoggedIn, tokens?.access]);

    const hostedMatches = matches.filter(
        (match) => match.creator_id === user?.id
    );

    const joinedMatches = matches.filter(
        (match) => match.creator_id !== user?.id
    );

    return (
        <div className="my-matches">
            <Navbar />

            <main>
                {!isLoggedIn ? (
                    <div className="login-needed">
                        <h1>Log in to see your matches.</h1>
                        <p>The games you host or join show up here.</p>
                        <Link to="/login">Log In</Link>
                    </div>
                ) : (
                    <>
                        <h1>My Matches</h1>
                        <p>View the matches you've hosted or joined.</p>
                    </>
                )}

                {!isLoggedIn ? null : loading ? (
                    <p>Loading matches...</p>
                ) : error ? (
                    <p role="alert">{error}</p>
                ) : (
                    <>
                        <section className="my-badges">
                            <h2>Badges</h2>
                            {badges.length === 0 ? (
                                <p>
                                    No badges yet. <Link to="/challenges">Join a challenge</Link> to earn one.
                                </p>
                            ) : (
                                <ul>
                                    {badges.map((badge) => (
                                        <li key={badge.challenge_id}>
                                            <strong>{badge.badge_name}</strong>
                                            <span>{badge.challenge}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        <section>
                            <h2>Hosted Matches</h2>
                            {hostedMatches.length === 0 ? (
                                <p>You haven't hosted any matches yet.</p>
                            ) : (
                                <ul className="matches-list">
                                    {hostedMatches.map((match) => (
                                        <BrowseMatchCard key={match.id} match={match} />
                                    ))}
                                </ul>
                            )}
                        </section>

                        <section>
                            <h2>Joined Matches</h2>
                            {joinedMatches.length === 0 ? (
                                <p>You haven't joined any matches yet.</p>
                            ) : (
                                <ul className="matches-list">
                                    {joinedMatches.map((match) => (
                                        <BrowseMatchCard key={match.id} match={match} />
                                    ))}
                                </ul>
                            )}
                        </section>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default MyMatches;