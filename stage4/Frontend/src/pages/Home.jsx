import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MatchCard from '../components/MatchCard.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getMatches } from '../services/matchesApi.js';
import { getChallenges } from '../services/challengesApi.js';
import { challengeDaysLeft, challengeGoal, formatTime } from '../utils/matchHelpers.js';
import '../styles/Home.css';
import '../styles/Challenges.css';
import '../styles/Footer.css';

const SPORTS = ['Padel', 'Football', 'Basketball', 'Volleyball', 'Tennis'];

// The one challenge to show on Home: one I'm working on first, then one I could join
function pickChallenge(challenges) {
    // is_active comes from the backend: today is between the start and end dates
    const live = challenges.filter((c) => c.is_active);
    return (
        live.find((c) => c.joined && !c.completed) ||
        live.find((c) => !c.joined) ||
        null
    );
}

function Home() {
    const { isLoggedIn, tokens } = useAuth();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [challenge, setChallenge] = useState(null);

    // challenges need an account, so this only runs when logged in
    useEffect(() => {
        if (!isLoggedIn || !tokens?.access) {
            setChallenge(null);
            return;
        }
        getChallenges(tokens.access)
            .then((data) => {
                if (data.success) setChallenge(pickChallenge(data.results || []));
            })
            .catch((error) => console.error('Home challenge error:', error));
    }, [isLoggedIn, tokens?.access]);

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

    function renderChallenge() {
        const left = challengeDaysLeft(challenge);
        const done = Math.min(challenge.progress ?? 0, challenge.target);
        const sport = challenge.sport ? challenge.sport.toLowerCase() : 'any';

        return (
            <section className="challenge-section">
                <h2>This month’s challenge</h2>
                <p>Hit the goal before the month ends and earn a badge.</p>

                <ul className="challenges-list">
                    <li className={`challenge-row sport-${sport}`}>
                        <p className="challenge-row-days">
                            {left.number}
                            <span>{left.label}</span>
                        </p>

                        <div>
                            <p className="challenge-row-sport">{challenge.sport || 'Any sport'}</p>
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
                        </p>

                        <span className={challenge.joined ? 'challenge-view' : 'challenge-join'}>
                            {challenge.joined ? 'View' : 'See challenge'}
                        </span>
                    </li>
                </ul>

                <Link to="/challenges" className="challenge-section-all">All challenges</Link>
            </section>
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

                {challenge && renderChallenge()}

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
