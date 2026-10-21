import '../styles/MatchCard.css';
import { Link } from 'react-router-dom';

function MatchCard({ sport, time, location, players }) {
  return (
    <div className="match-card">
      <span className="match-sport">{sport}</span>

      <h2>{time}</h2>

      <p className="match-location">{location}</p>

      <div className="match-bottom">
        <span>{players}</span>

        <Link to="/login" className="match-join">
          Join →
        </Link>
      </div>
    </div>
  );
}

export default MatchCard;
