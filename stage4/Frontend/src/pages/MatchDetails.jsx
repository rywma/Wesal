import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import JoinLeaveButton from '../components/JoinLeaveButton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getMatch, cancelMatch } from '../services/matchesApi.js';
import { formatDate, formatTime, paymentBadge, spotsText } from '../utils/matchHelpers.js';
import '../styles/MatchDetails.css';
import '../styles/Footer.css';
import MatchPaymentSection from '../components/MatchPaymentSection.jsx';
import PayShare from '../components/PayShare.jsx';
import InviteForm from '../components/InviteForm.jsx';

function MatchDetails() {
  const { id } = useParams();
  const { user, isLoggedIn, tokens } = useAuth();
  const location = useLocation();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState('');

  const loadMatch = async () => {
    try {
      const data = await getMatch(id);

      if (data.success) {
        setMatch(data);
        setMessage('');


      } else {
        setMessage(data.message || 'Could not load this match.');
      }
    } catch (error) {
      console.error('Match error:', error);
      setMessage('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  async function handleCancel() {
    setCancelling(true);
    setCancelMessage('');

    try {
      const data = await cancelMatch(id, tokens.access);

      if (data.success) {
        setMatch((prev) => ({ ...prev, status: 'cancelled' }));
        setShowCancelConfirm(false);
        setCancelMessage('Match cancelled successfully!');
      } else {
        setCancelMessage(data.message || 'Failed to cancel match.');
      }
    } catch (error) {
      setCancelMessage('Unable to connect to the server.');
    } finally {
      setCancelling(false);
    }
  }

  useEffect(() => {
    loadMatch();
  }, [id]);


  // Match details are for logged-in players
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (loading || !match) {
    return (
      <div className="match-details">
        <Navbar />
        <main>
          <Link to="/matches" className="back-link">← Back to games</Link>
          <p className="details-status" role="status">
            {loading ? 'Loading match...' : message}
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  const isCreator = isLoggedIn && match.creator?.id === user.id;
  const me = isLoggedIn ? match.participants.find((player) => player.user_id === user.id) : null;
  const isFull = match.status === 'full' || match.spots_left <= 0;
  const isCancelled = match.status === 'cancelled';
  const matchStart = new Date(`${match.date}T${match.time}`);

  const canCancel =
    isCreator &&
    !isCancelled &&
    !isFull &&
    match.status !== 'completed' &&
    matchStart > new Date();

  const mapQuery = encodeURIComponent(`${match.location}, Riyadh`);

  return (
    <div className="match-details">
      <Navbar />

      <main>
        <Link to="/matches" className="back-link">← Back to games</Link>

        <div className="details-layout">
          <section className="details-main">
            <div className={`details-card sport-${match.sport.toLowerCase()}`}>
              <span className="details-badge">
                {isCancelled
                  ? 'Cancelled'
                  : isFull
                    ? 'Full'
                    : `Open · ${spotsText(match.spots_left)}`}
              </span>
              <h1>{formatTime(match.time)}</h1>
              <p>{match.sport} · {formatDate(match.date)}</p>
              <h2>{match.location}</h2>
              <p className="details-host">Hosted by {match.creator?.name || 'a player'}</p>
            </div>

            <div className="details-box">
              <div className="box-header">
                <h2>Players</h2>
                <span>{match.players_count} / {match.max_players}</span>
              </div>

              <ul className="player-list">
                {match.participants.map((player) => {
                  const badge = paymentBadge(player.payment_status, isFull);
                  const isHost = player.user_id === match.creator?.id;
                  const isMe = isLoggedIn && player.user_id === user.id;

                  return (
                    <li key={player.user_id} className="player-row">
                      <span className="player-avatar" aria-hidden="true">
                        {(player.name || '?').charAt(0).toUpperCase()}
                      </span>
                      <span className="player-name">
                        {player.name || 'Player'}
                        {isHost && <span className="player-tag">Host</span>}
                        {isMe && <span className="player-tag">You</span>}
                      </span>
                      <span className={`payment-badge ${badge.className}`}>{badge.label}</span>

                    </li>
                  );
                })}

                {!isCancelled && match.spots_left > 0 && (
                  <li className="player-row open">
                    <span className="player-avatar" aria-hidden="true">+</span>
                    <span className="player-name">{spotsText(match.spots_left)}</span>
                  </li>
                )}
              </ul>


            </div>

            <div className="details-box">
              <div className="box-header">
                <h2>Location</h2>
              </div>
              <iframe
                className="details-map"
                title={`Map of ${match.location}`}
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                loading="lazy"
              />
            </div>
          </section>

          <aside className="details-side">
            <div className="details-box">
              <dl className="cost-list">
                <div>
                  <dt>Total cost</dt>
                  <dd>{match.total_cost} SAR</dd>
                </div>
                <div>
                  <dt>Players</dt>
                  <dd>{match.max_players}</dd>
                </div>
              </dl>

              <span className="side-label">Each player pays</span>
              <strong className="share">{match.share_per_player} SAR</strong>
              <p className="side-note">
                {match.total_cost} SAR ÷ {match.max_players} players. Fixed for everyone.
              </p>


            </div>

            <div className="details-box">
              {canCancel && (
                <div className="manage-cancel-section">
                  <button
                    type="button"
                    className="manage-cancel-btn"
                    onClick={() => setShowCancelConfirm(true)}
                  >
                    Cancel Match
                  </button>

                  {showCancelConfirm && (
                    <div className="manage-confirm">
                      <h3>Cancel this match?</h3>
                      <p>Are you sure? This cannot be undone.</p>

                      <button
                        type="button"
                        onClick={() => setShowCancelConfirm(false)}
                        disabled={cancelling}
                      >
                        Keep Match
                      </button>

                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={cancelling}
                      >
                        {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {cancelMessage && <p role="status">{cancelMessage}</p>}

              {!isCancelled && (
                <JoinLeaveButton
                  match={match}
                  isJoined={Boolean(me)}
                  isCreator={isCreator}
                  hasPaid={me?.payment_status === 'paid'}
                  onChange={loadMatch}
                />
              )}
            </div>

            {isCreator && match.status === 'open' && (
              <div className="details-box">
                <InviteForm matchId={match.id} />
              </div>
            )}

            {me && (
              <div className="details-box">
                <PayShare
                  match={match}
                  amount={me.payment_amount || match.share_per_player}
                  hasPaid={me.payment_status === 'paid'}
                  onPaid={loadMatch}
                />
              </div>
            )}

            {/* players see their share in "Your Payment" above so only the host needs this list */}
            {isCreator && (
              <div className="details-box">
                <MatchPaymentSection
                  key={me?.payment_status}
                  matchId={match.id}
                  isOrganizer={isCreator}
                  onPaymentChange={loadMatch}
                />
              </div>
            )}

          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default MatchDetails;
