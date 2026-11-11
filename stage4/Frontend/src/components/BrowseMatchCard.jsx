import { Link } from 'react-router-dom';
import { formatDate, formatTime } from '../utils/matchHelpers.js';

// One game in a list, joining happens on the Match Details page
function BrowseMatchCard({ match }) {
  const isFull = match.status === 'full' || match.players_count >= match.max_players;

  return (
    <li className={`match-row sport-${match.sport.toLowerCase()}`}>
      <p className="match-row-time">{formatTime(match.time)}</p>

      <div className="match-row-what">
        <p className="match-row-sport">{match.sport}</p>
        <p>{formatDate(match.date)}</p>
      </div>

      <p className="match-row-location">{match.location}</p>

      <p className="match-row-players">
        {match.players_count} of {match.max_players} joined
        {isFull && <span className="match-row-full">Full</span>}
      </p>

      <Link to={`/matches/${match.id}`} className="match-row-link">
        View details
      </Link>
    </li>
  );
}

export default BrowseMatchCard;
