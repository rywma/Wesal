import { DEFAULT_AVATAR } from '../services/profileApi.js';

// The player's card is what other players see. The profile page shows it as a live preview
function AthleteCard({ profile }) {
  const sports = profile.favorite_sports || [];

  return (
    <div className="athlete-card">
      <img
        className="athlete-avatar"
        src={profile.avatar_url || DEFAULT_AVATAR}
        alt=""
      />

      <h2>{profile.full_name || 'Your name'}</h2>
      <p className="athlete-username">
        {profile.username ? `@${profile.username}` : '@username'}
      </p>

      {profile.skill_level && (
        <p className="athlete-skill">{profile.skill_level}</p>
      )}

      {sports.length > 0 && (
        <ul className="athlete-sports">
          {sports.map((sport) => (
            <li key={sport} className={`sport-${sport.toLowerCase()}`}>
              {sport}
            </li>
          ))}
        </ul>
      )}

      {profile.bio && <p className="athlete-bio">{profile.bio}</p>}

      <p className="athlete-points">
        <strong>{profile.points || 0}</strong> points
      </p>
    </div>
  );
}

export default AthleteCard;