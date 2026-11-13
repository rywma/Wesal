import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { createMatch, SPORTS, SPORT_IDS } from '../services/matchesApi.js';
import { FORMATS, VENUES } from '../data/venues.js';
import { formatDate, formatTime, spotsText, toDateString } from '../utils/matchHelpers.js';
import '../styles/CreateMatch.css';
import '../styles/Footer.css';

function CreateMatch() {
  const today = toDateString(new Date());
  const navigate = useNavigate();

  const [sport, setSport] = useState('Football');
  const [formatIndex, setFormatIndex] = useState(0);
  const [venueId, setVenueId] = useState('');
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('20:00');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { isLoggedIn, tokens, logout } = useAuth();

  // Everything below is worked out from the choices above.
  const formats = FORMATS[sport];
  const format = formats[formatIndex];
  const sportVenues = VENUES.filter((venue) => venue.sport === sport);
  const venue = VENUES.find((item) => item.id === Number(venueId));
  const share = venue
    ? Math.round((venue.price / format.players) * 100) / 100
    : null;

  // A new sport has different formats and venues, so start those again.
  const handleSportChange = (newSport) => {
    setSport(newSport);
    setFormatIndex(0);
    setVenueId('');
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!venue) {
      setMessage('Please choose a venue.');
      return;
    }

    const matchData = {
      sport_id: SPORT_IDS[sport],
      date,
      time,
      location: `${venue.name}, ${venue.area}`,
      max_players: format.players,
      total_cost: venue.price,
    };

    setLoading(true);
    setMessage('');

    try {
      const data = await createMatch(matchData, tokens.access);

      if (data.success) {
        if (!data.id) {
          setMessage('Could not open the payment page.');
          return;
        }

        navigate(`/matches/${data.id}/host-payment`, {
          replace: true,
        });
      } else if (data.sessionExpired) {
        // The login token is too old. Log out so the page asks them to log in again.
        logout();
      } else {
        setMessage(data.message || 'Could not create the match.');
      }
    } catch (error) {
      console.error('Create match error:', error);
      setMessage('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="create-match">
        <Navbar />

        <main>
          <div className="login-needed">
            <h1>Log in to host a game.</h1>
            <p>You need an account so players know who's hosting.</p>
            <Link to="/login" className="create-submit">
              Log In
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="create-match">
      <Navbar />

      <main>
        <h1>
          Host a <span>game.</span>
        </h1>
        <p className="create-subtitle">
          Pick a sport, a format and a venue. The venue's price is split equally across every spot.
        </p>

        <div className="create-layout">
          <form className="create-form" onSubmit={handleCreate}>
            <fieldset className="sport-options">
              <legend>Sport</legend>

              <div className="sport-options-list">
                {SPORTS.map((option) => (
                  <label key={option} className="sport-option">
                    <input
                      type="radio"
                      name="sport"
                      value={option}
                      checked={sport === option}
                      onChange={() => handleSportChange(option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="sport-options">
              <legend>Format</legend>

              <div className="sport-options-list">
                {formats.map((option, index) => (
                  <label key={option.label} className="sport-option">
                    <input
                      type="radio"
                      name="format"
                      value={option.label}
                      checked={formatIndex === index}
                      onChange={() => setFormatIndex(index)}
                    />
                    <span>
                      {option.label} · {option.players} players
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="create-field">
              <label htmlFor="venue">Venue</label>
              <select
                id="venue"
                value={venueId}
                onChange={(event) => setVenueId(event.target.value)}
                required
              >
                <option value="" disabled>
                  Choose a {sport.toLowerCase()} venue
                </option>
                {sportVenues.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.area} · {item.price} SAR
                  </option>
                ))}
              </select>
            </div>

            <div className="create-row">
              <div className="create-field">
                <label htmlFor="date">Date</label>
                <input
                  id="date"
                  type="date"
                  min={today}
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  required
                />
              </div>

              <div className="create-field">
                <label htmlFor="time">Time</label>
                <input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  required
                />
              </div>
            </div>

            <button className="create-submit" type="submit" disabled={loading}>
              {loading ? 'Creating match...' : 'Create Match'}
            </button>

            {message && (
              <p className="create-message" role="status">
                {message}
              </p>
            )}
          </form>

          <aside className="create-preview" aria-label="Match preview">
            <div className={`preview-card sport-${sport.toLowerCase()}`}>
              <span className="preview-badge">
                Open · {format.players - 1} spots left
              </span>
              <h2>{time ? formatTime(time) : '--:--'}</h2>
              <p>
                {sport} · {format.label} · {date ? formatDate(date) : 'Pick a date'}
              </p>
              <h3>{venue ? `${venue.name}, ${venue.area}` : 'Choose a venue'}</h3>
            </div>

            <div className="share-box">
              <dl className="summary-list">
                <div>
                  <dt>Total cost</dt>
                  <dd>{venue ? `${venue.price} SAR` : '—'}</dd>
                </div>
                <div>
                  <dt>Players</dt>
                  <dd>{format.players}</dd>
                </div>
              </dl>

              <span className="preview-label">Each player pays</span>
              <strong>{share !== null ? `${share} SAR` : '—'}</strong>
              <p>
                {venue
                  ? `${venue.price} SAR ÷ ${format.players} players. Fixed for everyone.`
                  : 'Choose a venue to see each share.'}
              </p>

              <ul>
                <li>You're added as the first player.</li>
                <li>As the host, you'll pay first to confirm the match.</li>
                <li>Other players pay once all spots are filled.</li>
                <li>Not full 24 hours before kickoff? It's cancelled automatically.</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CreateMatch;