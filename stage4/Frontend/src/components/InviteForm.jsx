import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { invitePlayer } from '../services/invitationsApi.js';
import '../styles/InviteForm.css';

function InviteForm({ matchId }) {
  const { tokens } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await invitePlayer(matchId, email, tokens.access);
      setMessage(`Invite sent to ${email}.`);
      setEmail('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="invite-form">
      <h3>Invite Players</h3>
      <p>Invite a player by the email they signed up with.</p>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          aria-label="Player email"
          placeholder="player@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Invite'}
        </button>
      </form>

      {message && <p className="invite-success">{message}</p>}
      {error && <p className="invite-error" role="alert">{error}</p>}
    </div>
  );
}

export default InviteForm;
