import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { submitVenueRequest } from '../services/venueRequestsApi.js';
import { SPORTS, SPORT_IDS } from '../services/matchesApi.js';
import { formatDate, toDateString } from '../utils/matchHelpers.js';
import '../styles/Auth.css';
import '../styles/VenueRequest.css';

// every hour from 6 AM to midnight: shown as "4:00 PM" sent as "16:00"
const HOURS = Array.from({ length: 19 }, (_, i) => {
  const h = (i + 6) % 24;
  const label = h === 0 ? '12:00 AM (midnight)' : `${h % 12 || 12}:00 ${h < 12 ? 'AM' : 'PM'}`;
  return { value: `${String(h).padStart(2, '0')}:00`, label };
});

const hourText = (value) => HOURS.find((h) => h.value === value)?.label || '';

function VenueRequest() {
  const today = toDateString(new Date());
  const { isLoggedIn, tokens } = useAuth();

  const [form, setForm] = useState({
    facility_name: '',
    location: '',
    google_maps_link: '',
    sport: 'Football',
    max_players: '10',
    date: '',
    end_date: '',
    time: '16:00',
    end_time: '23:00',
    total_cost: '',
    contact_number: '',
    description: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const closes = form.end_time === '00:00' ? '24:00' : form.end_time;
    if (closes <= form.time) {
      setMessage('Closing time must be after opening time.');
      return;
    }
    if (form.end_date && form.end_date < form.date) {
      setMessage('The last day must be on or after the first day.');
      return;
    }

    setLoading(true);
    setMessage('');
    setFieldErrors({});

    try {
      const data = await submitVenueRequest(
        {
          facility_name: form.facility_name,
          location: form.location,
          google_maps_link: form.google_maps_link,
          sport: SPORT_IDS[form.sport],
          max_players: Number(form.max_players),
          date: form.date,
          end_date: form.end_date || null,
          time: form.time,
          end_time: form.end_time,
          total_cost: Number(form.total_cost),
          contact_number: form.contact_number,
          description: form.description.trim() || null,
        },
        tokens.access
      );
      setSubmitted(data.data);
    } catch (error) {
      setFieldErrors(error.fieldErrors || {});
      setMessage(
        error.fieldErrors && Object.keys(error.fieldErrors).length > 0
          ? 'Please fix the highlighted fields.'
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const errorFor = (name) =>
    fieldErrors[name] ? (
      <p className="venue-field-error">{[].concat(fieldErrors[name]).join(' ')}</p>
    ) : null;

  if (!isLoggedIn) {
    return (
      <>
        <Navbar />
        <main className="auth-page venue-page">
          <div className="auth-card">
            <h2>List your venue</h2>
            <p className="auth-subtitle">Log in first so we know who's sending the request.</p>
            <Link to="/login" className="auth-submit venue-button-link">Log In</Link>
          </div>
        </main>
      </>
    );
  }

  if (submitted) {
    return (
      <>
        <Navbar />
        <main className="auth-page venue-page">
          <div className="auth-card">
            <h2>Request under review</h2>
            <p className="auth-subtitle">
              Thanks! We've received your request for <strong>{submitted.facility_name}</strong>.
              Our team will review it and contact you on {submitted.contact_number}. Once it's
              approved, it will appear as a game on Find Games.
            </p>
            <Link to="/" className="auth-submit venue-button-link">Back to Home</Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="auth-page venue-page">
        <div className="auth-card">
          <h2>List your venue</h2>
          <p className="auth-subtitle">
            Send us an open slot at your court or pitch. We'll review it and get back to you.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <h3 className="venue-section">The venue</h3>

            <div className="auth-field">
              <label htmlFor="facility_name">Facility name</label>
              <input id="facility_name" name="facility_name" value={form.facility_name}
                onChange={handleChange} placeholder="e.g. Al Nakheel Sports Club" maxLength={255} required />
              {errorFor('facility_name')}
            </div>

            <div className="auth-field">
              <label htmlFor="location">Location</label>
              <input id="location" name="location" value={form.location}
                onChange={handleChange} placeholder="Area and street, e.g. Al Malqa, Riyadh" maxLength={255} required />
              {errorFor('location')}
            </div>

            <div className="auth-field">
              <label htmlFor="google_maps_link">Google Maps link</label>
              <input id="google_maps_link" name="google_maps_link" type="url"
                value={form.google_maps_link} onChange={handleChange}
                placeholder="https://maps.app.goo.gl/..." maxLength={500} required />
              <p className="venue-hint">Open your venue in Google Maps, tap Share, and paste the link here.</p>
              {errorFor('google_maps_link')}
            </div>

            <h3 className="venue-section">The slot</h3>

            <div className="venue-row">
              <div className="auth-field">
                <label htmlFor="sport">Sport</label>
                <select id="sport" name="sport" value={form.sport} onChange={handleChange}>
                  {SPORTS.map((sport) => <option key={sport}>{sport}</option>)}
                </select>
                {errorFor('sport')}
              </div>
              <div className="auth-field">
                <label htmlFor="max_players">Max players</label>
                <input id="max_players" name="max_players" type="number" min="2" max="30"
                  value={form.max_players} onChange={handleChange} required />
                {errorFor('max_players')}
              </div>
            </div>

            <div className="venue-row">
              <div className="auth-field">
                <label htmlFor="date">First day</label>
                <input id="date" name="date" type="date" min={today}
                  value={form.date} onChange={handleChange} required />
                {errorFor('date')}
              </div>
              <div className="auth-field">
                <label htmlFor="end_date">
                  Last day <span className="venue-optional">(optional)</span>
                </label>
                <input id="end_date" name="end_date" type="date" min={form.date || today}
                  value={form.end_date} onChange={handleChange} />
                {errorFor('end_date')}
              </div>
            </div>

            <div className="venue-row">
              <div className="auth-field">
                <label htmlFor="time">Opens at</label>
                <select id="time" name="time" value={form.time} onChange={handleChange}>
                  {HOURS.slice(0, -1).map((h) => <option key={h.value} value={h.value}>{h.label}</option>)}
                </select>
                {errorFor('time')}
              </div>
              <div className="auth-field">
                <label htmlFor="end_time">Closes at</label>
                <select id="end_time" name="end_time" value={form.end_time} onChange={handleChange}>
                  {HOURS.slice(1).map((h) => <option key={h.value} value={h.value}>{h.label}</option>)}
                </select>
                {errorFor('end_time')}
              </div>
            </div>

            {form.date && (
              <p className="venue-summary">
                {form.end_date && form.end_date !== form.date
                  ? `Open ${formatDate(form.date)} – ${formatDate(form.end_date)}`
                  : `Open ${formatDate(form.date)}`}
                , {hourText(form.time)} – {hourText(form.end_time)}
              </p>
            )}

            <div className="auth-field">
              <label htmlFor="total_cost">Total cost (SAR)</label>
              <input id="total_cost" name="total_cost" type="number" min="1" step="0.01"
                inputMode="decimal" value={form.total_cost} onChange={handleChange}
                placeholder="e.g. 300" required />
              <p className="venue-hint">What you charge for this slot. Players split it equally.</p>
              {errorFor('total_cost')}
            </div>

            <h3 className="venue-section">Contact</h3>

            <div className="auth-field">
              <label htmlFor="contact_number">Contact number</label>
              <input id="contact_number" name="contact_number" type="tel"
                value={form.contact_number} onChange={handleChange} placeholder="05X XXX XXXX"
                pattern="[0-9+ ]{9,15}" title="Numbers only, e.g. 0551234567" required />
              {errorFor('contact_number')}
            </div>

            <div className="auth-field">
              <label htmlFor="description">
                Description <span className="venue-optional">(optional)</span>
              </label>
              <textarea id="description" name="description" rows={3} value={form.description}
                onChange={handleChange} placeholder="Surface, lighting, parking…" />
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send for review'}
            </button>
          </form>

          {message && <p className="auth-message" role="alert">{message}</p>}
        </div>
      </main>
    </>
  );
}

export default VenueRequest;
