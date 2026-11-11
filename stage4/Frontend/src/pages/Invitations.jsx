import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  getMyInvitations,
  acceptInvitation,
  declineInvitation,
} from '../services/invitationsApi.js';
import { formatDate, formatTime } from '../utils/matchHelpers.js';
import '../styles/Invitations.css';
import '../styles/Footer.css';

function Invitations() {
  const { isLoggedIn, tokens } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadInvitations() {
      setLoading(true);
      setError('');

      try {
        const data = await getMyInvitations(tokens.access);
        setInvitations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (isLoggedIn) {
      loadInvitations();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, tokens?.access]);

  async function handleAnswer(invitationId, answer) {
    setError('');

    try {
      const updated = answer === 'accept'
        ? await acceptInvitation(invitationId, tokens.access)
        : await declineInvitation(invitationId, tokens.access);

      setInvitations(
        invitations.map((invitation) =>
          invitation.id === invitationId
            ? { ...invitation, status: updated.status }
            : invitation
        )
      );
    } catch (err) {
      setError(err.message);
    }
  }

  function renderInvitations() {
    if (!isLoggedIn) {
      return (
        <p>
          <Link to="/login">Log in</Link> to see your invitations.
        </p>
      );
    }

    if (loading) {
      return <p>Loading invitations...</p>;
    }

    if (invitations.length === 0) {
      return (
        <div className="invitations-empty">
          <p>You don't have any invitations yet.</p>
        </div>
      );
    }

    return (
      <div className="invitations-grid">
        {invitations.map((invitation) => (
          <div className="invitation-card" key={invitation.id}>
            <p className="invitation-sender">{invitation.sender} invited you</p>

            <h3>
              {invitation.match.sport} · {formatTime(invitation.match.time)}
            </h3>

            <p>
              {formatDate(invitation.match.date)} · {invitation.match.location}
            </p>

            <p>{invitation.match.share_per_player} SAR per player</p>

            {invitation.status === 'pending' ? (
              <div className="invitation-buttons">
                <button
                  type="button"
                  className="decline-btn"
                  onClick={() => handleAnswer(invitation.id, 'decline')}
                >
                  Decline
                </button>

                <button
                  type="button"
                  className="accept-btn"
                  onClick={() => handleAnswer(invitation.id, 'accept')}
                >
                  Accept
                </button>
              </div>
            ) : (
              <span className={`invitation-status ${invitation.status}`}>
                {invitation.status === 'accepted' ? 'Accepted' : 'Declined'}
              </span>
            )}

            <Link to={`/matches/${invitation.match.id}`} className="invitation-link">
              View match
            </Link>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="invitations">
      <Navbar />

      <main>
        <h1>Invitations</h1>
        <p>Matches other players invited you to.</p>

        {error && <p className="invitations-error" role="alert">{error}</p>}

        <section className="invitations-results">
          {renderInvitations()}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Invitations;
