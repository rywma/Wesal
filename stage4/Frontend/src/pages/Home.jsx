import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MatchCard from '../components/MatchCard.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { getMatches } from '../services/matchesApi.js';
import { formatTime } from '../utils/matchHelpers.js';
import '../styles/Home.css';
import '../styles/Footer.css';

const SPORTS = ['Padel', 'Football', 'Basketball', 'Volleyball', 'Tennis'];

function Home() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadGames() {
            try {
                const data = await getMatches(null);

                if (data.success) {
                    // the next three games that still have room
                    const openGames = data.results.filter((match) => match.status === 'open');
                    setGames(openGames.slice(0, 3));
                }
            } catch (error) {
                console.error('Home games error:', error);
            } finally {
                setLoading(false);
            }
        }

        loadGames();
    }, []);

    function renderGames() {
        if (loading) {
            return <p className="games-status">Loading open games…</p>;
        }

        if (games.length === 0) {
            return (
                <div className="games-empty">
                    <p>No open games right now.</p>
                    <Link to="/create-match">Host a game</Link>
                </div>
            );
        }

        return (
            <ul className="games-list">
                {games.map((match) => (
                    <MatchCard
                        key={match.id}
                        sport={match.sport}
                        time={formatTime(match.time)}
                        location={match.location}
                        players={`${match.players_count} of ${match.max_players} joined`}
                        to={`/matches/${match.id}`}
                    />
                ))}
            </ul>
        );
    }

    return (
        <div className="home">
            <Navbar />

            <main>
                <section className="hero">
                    <div className="hero-content">
                        <h1>Never miss a game.</h1>

                        <p>
                            Find people near you to play football,
                            padel, basketball and more.
                        </p>

                        <Link to="/matches" className="explore-btn">
                            Explore Matches
                        </Link>
                    </div>

                    <div className="hero-visual">
                        <h2>Open games</h2>
                        {renderGames()}
                    </div>
                </section>

                <section className="sports-section" id="sports">
                    <h2>Whatever you play, there’s a game.</h2>
                    <p>Find your sport and start playing.</p>

                    <ul className="sports-list">
                        {SPORTS.map((sport) => (
                            <li key={sport} className={`sport-${sport.toLowerCase()}`}>
                                <Link to={`/matches?sport=${sport}`}>{sport}</Link>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="why-section">
                    <h2>Split the cost, not the effort.</h2>

                    <div className="why-grid">
                        <div className="why-item">
                            <h3>A fair split</h3>
                            <p>The venue’s price is divided equally, so every player pays the same share.</p>
                        </div>

                        <div className="why-item">
                            <h3>Pay in the app</h3>
                            <p>Pay your share with a card. The host sees who has paid, so nobody chases anyone for money.</p>
                        </div>

                        <div className="why-item">
                            <h3>Bring your friends</h3>
                            <p>Invite players by the email they signed up with. They accept in one tap and they’re in.</p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default Home;
