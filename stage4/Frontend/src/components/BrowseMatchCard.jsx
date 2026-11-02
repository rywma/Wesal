import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useState } from 'react';
import { joinMatch } from '../services/matchesApi.js';
import {
  formatDate,
  formatTime,
  spotsText
} from '../utils/matchHelpers.js';

function BrowseMatchCard({ match }) {
  const { isLoggedIn, tokens, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  // the join response sends the new count back, so the card updates without reloading
  const [spots, setSpots] = useState({
    status: match.status,
    players_count: match.players_count,
    spots_left: match.spots_left,
  });
  const isFull = spots.status === 'full' || spots.spots_left <= 0;

  async function handleJoin() {
    if (!window.confirm(`Join this match? Your share will be ${match.share_per_player} SAR.`)) return;

    setLoading(true);
    setMessage('');

    try {
      const data = await joinMatch(match.id, tokens.access);

      if (data.success) {
        setSpots({ status: data.status, players_count: data.players_count, spots_left: data.spots_left });
        setMessage('Joined successfully!');
      } else if (data.sessionExpired) {
        logout();
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

  function renderJoin() {
    if (!isLoggedIn) {
      return <Link to="/login" className="join-btn">Join</Link>;
    }

    return (
      <button
        type="button"
        className="join-btn"
        onClick={handleJoin}
        disabled={loading || isFull}
      >
        {loading ? 'Joining...' : isFull ? 'Full' : 'Join'}
      </button>
    );
  }

  return (
    <div className="browse-match-card">
      <span className={`browse-match-status ${isFull ? 'full' : ''}`}>
        {isFull ? 'Full' : 'Open'} · {spotsText(spots.spots_left)}
      </span>

      <h3>{formatTime(match.time)}</h3>

      <p className="browse-match-sport">
        {match.sport} · {formatDate(match.date)}
      </p>

      <p className="browse-match-location">
        {match.location}
      </p>

      <p className="browse-match-players">
        {spots.players_count} / {match.max_players} Players · {match.share_per_player} SAR each
      </p>

      {renderJoin()}
      <Link to={`/matches/${match.id}`} className="details-link">View details</Link>
      {message && <p role="status">{message}</p>}
    </div>
  );
}

export default BrowseMatchCard;
