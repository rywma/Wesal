import { useState } from 'react';
import '../styles/BrowseMatches.css';
import BrowseMatchCard from '../components/BrowseMatchCard.jsx';

function BrowseMatches() {
    const [sport, setSport] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const matches = [];

    return (
        <div className="browse-matches">
            <h1>Find Your Next Game</h1>
            <p>Browse matches and find the perfect game for you.</p>

            <div className="match-filters">
                <select value={sport} onChange={(e) => setSport(e.target.value)}>
                    <option value="">All Sports</option>
                    <option value="Football">Football</option>
                    <option value="Padel">Padel</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Volleyball">Volleyball</option>
                    <option value="Tennis">Tennis</option>
                </select>

                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />

                <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Search location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />
            </div>

            <section className="matches-results">
                <h2>Available Matches</h2>

                {matches.length > 0 ? (
                    <div className="matches-grid">
                        {matches.map((match) => (
                            <BrowseMatchCard key={match.id} match={match} />
                        ))}
                    </div>
                ) : (
                    <div className="matches-empty">
                        <p>No matches available yet.</p>
                    </div>
                )}
            </section>

        </div>
    );
}

export default BrowseMatches;