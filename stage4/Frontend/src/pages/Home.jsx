import MatchCard from '../components/MatchCard.jsx';
import '../styles/Home.css';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/Footer.css';

function Home() {
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

                        <a href="#matches" className="explore-btn">
                            Explore Matches
                        </a>

                    </div>

                    <div className="hero-visual">
                        <MatchCard
                            sport="Football"
                            time="8:00 PM"
                            location="Al Waha Pitch"
                            players="4 players joined"
                        />

                        <MatchCard
                            sport="Padel"
                            time="9:30 PM"
                            location="Padel Club"
                            players="2 players joined"
                        />
                    </div>
                </section>

                <section className="sports-section" id="sports">
                    <h2>Whatever you play, there's a game.</h2>
                    <p>Find your sport and start playing.</p>

                    <div className="sports-grid">
                        {['Padel', 'Football', 'Basketball', 'Volleyball', 'Tennis'].map((sport) => (
                            <div className="sport-card" key={sport}>
                                <h3>{sport}</h3>
                            </div>
                        ))}
                    </div>
                </section>


                <section className="how-section" id="how-it-works">
                    <h2>Three taps to game time.</h2>
                    <p>Getting started with Wesal is simple.</p>

                    <div className="steps-grid">
                        <div className="step-card">
                            <span>01</span>
                            <h3>Pick your sport</h3>
                            <p>Choose the sport you want to play.</p>
                        </div>

                        <div className="step-card">
                            <span>02</span>
                            <h3>Find a match</h3>
                            <p>Explore matches near you.</p>
                        </div>

                        <div className="step-card">
                            <span>03</span>
                            <h3>Join and play</h3>
                            <p>Join a match and meet new players.</p>
                        </div>
                    </div>
                </section>

                <section className="matches-section" id="matches">
                    <div className="matches-header">
                        <div>
                            <h2>Find your next game.</h2>
                            <p>Explore available matches and join the fun.</p>
                        </div>
                    </div>

                    <div className="matches-empty">
                        <h3>No matches available yet.</h3>
                        <p>New games will appear here soon!</p>
                    </div>
                </section>

            </main>

            <Footer />
        </div>

    );
}

export default Home;
