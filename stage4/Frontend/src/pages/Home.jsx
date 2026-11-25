import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getChallenges } from '../services/challengesApi.js';
import { challengeDaysLeft, challengeGoal } from '../utils/matchHelpers.js';
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


    function renderChallenge() {
        const left = challengeDaysLeft(challenge);
        const done = Math.min(challenge.progress ?? 0, challenge.target);
        const sport = challenge.sport ? challenge.sport.toLowerCase() : 'any';

        return (
            <section className="challenge-section">
                <h2>This month’s challenge</h2>
                <p>Take on the challenge, reach your goal, and earn points.</p>

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
                        <h1 className="hero-shiny-title">Never miss a game.</h1>

                        <p className="hero-shiny-description">
                            Find people near you to play football,
                            padel, basketball and more.
                        </p>

                        <Link to="/matches" className="explore-btn">
                            Explore Matches
                        </Link>
                    </div>


                </section>

                <section className="sports-section" id="sports">
                    <h2>Whatever you play, there’s a game.</h2>
                    <p>Find your sport and start playing.</p>

                    <div className="sports-marquee">
                        <div className="sports-track">
                            {[0, 1].map((copy) => (
                                <ul
                                    key={copy}
                                    className="sports-list"
                                    aria-hidden={copy === 1}
                                >
                                    {SPORTS.map((sport) => (
                                        <li
                                            key={`${copy}-${sport}`}
                                            className={`sport-${sport.toLowerCase()}`}
                                        >
                                            <Link
                                                to={`/matches?sport=${sport}`}
                                                tabIndex={copy === 1 ? -1 : undefined}
                                            >
                                                {sport}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ))}
                        </div>
                    </div>
                </section>

                {challenge && renderChallenge()}


                <section className="familiar-section">
                    <div className="familiar-heading">
                        <h2>Sound familiar?</h2>
                        <p>We've all been there. Wesal gets it.</p>
                    </div>

                    <div className="familiar-grid">
                        <article className="familiar-card">
                            <div className="familiar-card-header">

                                <span className="familiar-tag">THE NO-SHOW</span>
                                <h3>The friend who bailed</h3>
                            </div>
                            <div className="familiar-chat">
                                <p className="chat-bubble sent">Tennis at 7? 🎾</p>
                                <p className="chat-bubble received">I'm in!</p>
                                <p className="chat-bubble received">
                                    Bro I can't make it 💀
                                </p>
                            </div>

                            <p className="familiar-ending">
                                Don't cancel. Find another player.
                            </p>
                        </article>

                        <article className="familiar-card">
                            <div className="familiar-card-header">
                                <span className="familiar-tag">NEW IN TOWN</span>
                                <h3>New city, no teammates</h3>
                            </div>
                            <div className="familiar-chat">
                                <p className="chat-bubble sent">
                                    Just moved to Riyadh
                                </p>
                                <p className="chat-bubble sent">
                                    Where's everyone playing?
                                </p>
                                <p className="chat-bubble received">👀</p>
                            </div>

                            <p className="familiar-ending">
                                New city. New teammates.
                            </p>
                        </article>

                        <article className="familiar-card">
                            <div className="familiar-card-header">
                                <span className="familiar-tag">THE SPORTY FRIEND</span>
                                <h3>The odd one out</h3>
                            </div>

                            <div className="familiar-chat">
                                <p className="chat-bubble sent">
                                    Padel this weekend?
                                </p>
                                <p className="chat-bubble received">
                                    Brunch instead? 🥐
                                </p>
                                <p className="chat-bubble sent">
                                    Again?? 😭
                                </p>
                            </div>

                            <p className="familiar-ending">
                                Find people who get your game.
                            </p>
                        </article>
                    </div>
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
