import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { submitVenueRequest } from '../services/venueRequestsApi.js';
import { toDateString } from '../utils/matchHelpers.js';
import '../styles/Auth.css';
import '../styles/VenueRequest.css';

function VenueRequest() {
  const today = toDateString(new Date());
  const { isLoggedIn, tokens } = useAuth();

  const [form, setForm] = useState({
    facility_name: '',
    location: '',
    google_maps_link: '',
    date: '',
    time: '',
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
    setLoading(true);
    setMessage('');
    setFieldErrors({});

    try {
      const data = await submitVenueRequest(
        {
          facility_name: form.facility_name,
          location: form.location,
          google_maps_link: form.google_maps_link,
          date: form.date,
          time: form.time,
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
                <label htmlFor="date">Date</label>
                <input id="date" name="date" type="date" min={today}
                  value={form.date} onChange={handleChange} required />
                {errorFor('date')}
              </div>
              <div className="auth-field">
                <label htmlFor="time">Time</label>
                <input id="time" name="time" type="time"
                  value={form.time} onChange={handleChange} required />
                {errorFor('time')}
              </div>
            </div>

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
