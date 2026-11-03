import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useState } from 'react';
import { joinMatch } from '../services/matchesApi.js';
import {
  formatDate,
  formatTime,
  spotsLeft,
  spotsText
} from '../utils/matchHelpers.js';

function BrowseMatchCard({ match, showJoin = true }) {
  const { isLoggedIn, tokens } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const availableSpots = spotsLeft(match);

  async function handleJoin() {
    setLoading(true);
    setMessage('');

    try {
      const data = await joinMatch(match.id, tokens.access);

      if (data.success) {
        setMessage('Joined successfully!');
      } else {
        setMessage(data.message || 'Failed to join match.');
      }
    } catch (error) {
      console.error('Join error:', error);
      setMessage('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="browse-match-card">
      <span className="browse-match-status">
        {match.status || 'Open'} · {spotsText(availableSpots)}
      </span>

      <h3>
        <Link to={`/matches/${match.id}`}>{formatTime(match.time)}</Link>
      </h3>

      <p className="browse-match-sport">
        {match.sport} · {formatDate(match.date)}
      </p>

      <p className="browse-match-location">
        {match.location}
      </p>

      <p className="browse-match-players">
        {match.players_count} / {match.max_players} Players
      </p>

      {!showJoin ? (
        <Link to={`/matches/${match.id}`} className="join-btn">
          View Details
        </Link>
      ) : isLoggedIn ? (
        <button
          type="button"
          className="join-btn"
          onClick={handleJoin}
          disabled={loading}
        >
          {loading ? 'Joining...' : 'Join'}
        </button>
      ) : (
        <Link to="/login" className="join-btn">
          Join
        </Link>
      )}
      {message && <p role="status">{message}</p>}
    </div>
  );
}

export default BrowseMatchCard;