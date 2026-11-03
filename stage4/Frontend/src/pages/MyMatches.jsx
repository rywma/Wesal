import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/Footer.css';
import '../styles/MyMatches.css';
import '../styles/BrowseMatches.css';
import BrowseMatchCard from '../components/BrowseMatchCard.jsx';

function MyMatches() {
    const { isLoggedIn } = useAuth();
    const hostedMatches = null;
    const joinedMatches = null;

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
                ) : (
                    <>
                        <section>
                            <h2>Hosted Matches</h2>
                            {hostedMatches === null ? (
                                <p>Your hosted matches will appear here.</p>
                            ) : hostedMatches.length === 0 ? (
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
                            {joinedMatches === null ? (
                                <p>Your joined matches will appear here.</p>
                            ) : joinedMatches.length === 0 ? (
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