import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../styles/BrowseMatches.css';
import BrowseMatchCard from '../components/BrowseMatchCard.jsx';
import { getMatches, SPORT_IDS } from '../services/matchesApi.js';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/Footer.css';

function BrowseMatches() {
    const [searchParams] = useSearchParams();
    const [sport, setSport] = useState(searchParams.get('sport') || '');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [matches, setMatches] = useState([]);
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchMatches() {
            setLoading(true);
            setError('');

            try {
                const sportId = sport ? SPORT_IDS[sport] : '';
                const data = await getMatches(null, sportId, date, location, page, time);

                if (data.success) {
                    const availableMatches = (data.results || []).filter(
                        (match) => match.status !== 'cancelled' &&
                            match.status !== 'pending_payment'
                    );

                    setMatches(availableMatches);
                    setHasNext(Boolean(data.next));
                } else {
                    setError(data.message || 'Failed to load matches.');
                }
            } catch (err) {
                console.error('Fetch matches error:', err);
                setError('Unable to connect to the server.');
            }
            finally {
                setLoading(false);
            }
        }

        fetchMatches();
    }, [sport, date, time, location, page]);

    function renderMatches() {
        if (loading) {
            return <p>Loading matches…</p>;
        }

        if (error) {
            return <p role="alert">{error}</p>;
        }

        if (matches.length > 0) {
            return (
                <ul className="matches-list">
                    {matches.map((match) => (
                        <BrowseMatchCard key={match.id} match={match} />
                    ))}
                </ul>
            );
        }

        return (
            <div className="matches-empty">
                <p>No matches available yet.</p>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <main className="browse-matches">
                <h1>Find Your Next Game</h1>
                <p>Browse matches and find the perfect game for you.</p>

                <div className="match-filters">
                    <label className="filter-field">
                        <span>SPORT</span>
                        <select value={sport} onChange={(e) => {
                            setSport(e.target.value);
                            setPage(1);
                        }}>
                            <option value="">All Sports</option>
                            <option value="Football">Football</option>
                            <option value="Padel">Padel</option>
                            <option value="Basketball">Basketball</option>
                            <option value="Volleyball">Volleyball</option>
                            <option value="Tennis">Tennis</option>
                        </select>
                    </label>

                    <label className="filter-field">
                        <span>DATE</span>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => {
                                setDate(e.target.value);
                                setPage(1);
                            }}
                        />
                    </label>

                    <label className="filter-field">
                        <span>TIME</span>
                        <input
                            type="time"
                            aria-label="Starting from"
                            value={time}
                            onChange={(e) => {
                                setTime(e.target.value);
                                setPage(1);
                            }}
                        />
                    </label>

                    <label className="filter-field">
                        <span>LOCATION</span>
                        <input
                            type="text"
                            placeholder="Search location"
                            value={location}
                            onChange={(e) => {
                                setLocation(e.target.value);
                                setPage(1);
                            }}
                        />
                    </label>
                </div>

                <section className="matches-results">
                    <h2>Available Matches</h2>
                    {renderMatches()}

                    {!error && (
                        <div className="pagination">
                            <button
                                disabled={page === 1 || loading}
                                onClick={() => setPage(page - 1)}
                            >
                                Previous
                            </button>

                            <span>Page {page}</span>

                            <button
                                disabled={!hasNext || loading}
                                onClick={() => setPage(page + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </section>


            </main>
            <Footer />
        </>
    );
}

export default BrowseMatches;