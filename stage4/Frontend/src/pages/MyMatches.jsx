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

function MyMatches() {
    const { isLoggedIn, user, tokens } = useAuth();

    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
                <h1>My Matches</h1>
                <p>View the matches you've hosted or joined.</p>

                {!isLoggedIn ? (
                    <section>
                        <h2>Log in to see your matches</h2>
                        <Link to="/login">Log In</Link>
                    </section>

                ) : loading ? (
                    <p>Loading matches...</p>
                ) : error ? (
                    <p role="alert">{error}</p>
                ) : (
                    <>
                        <section>
                            <h2>Hosted Matches</h2>
                            {hostedMatches.length === 0 ? (
                                <p>You haven't hosted any matches yet.</p>
                            ) : (
                                <div className="matches-grid">
                                    {hostedMatches.map((match) => (
                                        <BrowseMatchCard key={match.id} match={match} showJoin={false} />
                                    ))}
                                </div>
                            )}
                        </section>

                        <section>
                            <h2>Joined Matches</h2>
                            {joinedMatches.length === 0 ? (
                                <p>You haven't joined any matches yet.</p>
                            ) : (
                                <div className="matches-grid">
                                    {joinedMatches.map((match) => (
                                        <BrowseMatchCard key={match.id} match={match} showJoin={false} />
                                    ))}
                                </div>
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