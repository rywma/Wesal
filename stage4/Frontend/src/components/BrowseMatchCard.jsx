function BrowseMatchCard({ match }) {
  return (
    <div className="browse-match-card">
      <h3>{match.sport}</h3>
      <p>Date: {match.date}</p>
      <p>Time: {match.time}</p>
      <p>Location: {match.location}</p>
      <p>Players: {match.players}</p>
    </div>
  );
}

export default BrowseMatchCard;