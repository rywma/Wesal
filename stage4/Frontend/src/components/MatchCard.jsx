import { Link } from 'react-router-dom';
import '../styles/MatchCard.css';

function MatchCard({ sport, time, location, players, to }) {
  return (
    <li className="match-card">
      <span className="match-sport">{sport}</span>

      <h3>{time}</h3>

      <p className="match-location">{location}</p>

      <span className="match-players">{players}</span>

      <Link to={to} className="match-join">
        View details
      </Link>
    </li>
  );
}

export default MatchCard;
