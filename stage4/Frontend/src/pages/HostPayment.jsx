
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import PaymentTimer from '../components/PaymentTimer.jsx';
import PayShare from '../components/PayShare.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getMatch, confirmHostPayment } from '../services/matchesApi.js';
import { getMyPayment } from '../services/paymentApi.js';

import '../styles/CreateMatch.css';
import '../styles/Footer.css';

function HostPayment() {
  const { id } = useParams();
  const { user, tokens, isLoggedIn } = useAuth();

  const [match, setMatch] = useState(null);
  const [hostPaid, setHostPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [expired, setExpired] = useState(false);

  const triedConfirmation = useRef(false);

  // Load the reservation and host's payment status.
  const loadMatch = useCallback(async () => {
    if (!tokens?.access) return;

    try {
      const matchData = await getMatch(id, tokens.access);

      if (!matchData.success) {
        throw new Error(matchData.message || 'Could not load match.');
      }

      const paymentData = await getMyPayment(id, tokens.access);

      setMatch(matchData);
      setHostPaid(paymentData.payment_status === 'paid');
      setError('');
    } catch (err) {
      setError(err.message || 'Unable to load reservation.');
    } finally {
      setLoading(false);
    }
  }, [id, tokens?.access]);

  useEffect(() => {
    if (isLoggedIn) {
      loadMatch();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, loadMatch]);

  // Confirm the match only after the backend records payment.
  const confirmMatch = useCallback(async () => {
    setConfirming(true);
    setConfirmError('');

    try {
      const data = await confirmHostPayment(id, tokens.access);

      if (!data.success) {
        throw new Error(data.message || 'Could not confirm match.');
      }

      await loadMatch();
    } catch (err) {
      setConfirmError(err.message || 'Could not confirm match.');
    } finally {
      setConfirming(false);
    }
  }, [id, tokens?.access, loadMatch]);

  // Resume confirmation if the host refreshes after paying.
  useEffect(() => {
    if (
      match?.status === 'pending_payment' &&
      hostPaid &&
      !triedConfirmation.current
    ) {
      triedConfirmation.current = true;
      confirmMatch();
    }
  }, [match?.status, hostPaid, confirmMatch]);

  function handleExpire() {
    setExpired(true);
    loadMatch();
  }

  function renderContent() {
    if (!isLoggedIn) {
      return (
        <>
          <h1>Log in to continue.</h1>
          <Link to="/login">Log In</Link>
        </>
      );
    }

    if (loading) return <p>Loading reservation...</p>;

    if (error) {
      return (
        <>
          <p role="alert">{error}</p>
          <button
            type="button"
            className="create-submit"
            onClick={loadMatch}
          >
            Retry
          </button>
        </>
      );
    }

    if (!match) return <p>Reservation not found.</p>;

    if (String(match.creator?.id) !== String(user?.id)) {
      return <p>Only the host can access this page.</p>;
    }

    if (match.status === 'cancelled') {
      return (
        <>
          <h1>Reservation cancelled</h1>
          <p>Your reservation is no longer available.</p>
          <Link to="/create-match">Create another match</Link>
        </>
      );
    }

    if (match.status === 'open' || match.status === 'full') {
      if (!hostPaid) {
        return <p role="alert">Host payment is not confirmed.</p>;
      }

      return (
        <>
          <h1>Match confirmed!</h1>
          <p>Your payment is confirmed and players can join.</p>
          <Link to={`/matches/${match.id}`}>View Match Details</Link>
        </>
      );
    }

    if (match.status !== 'pending_payment') {
      return <p>Unknown reservation status.</p>;
    }

    if (hostPaid) {
      return (
        <>
          <h1>Payment received</h1>
          <p>
            {confirming
              ? 'Confirming your match...'
              : 'Payment verified. Waiting for match confirmation.'}
          </p>

          {confirmError && <p role="alert">{confirmError}</p>}

          {!confirming && (
            <button
              type="button"
              className="create-submit"
              onClick={confirmMatch}
            >
              Retry confirmation
            </button>
          )}
        </>
      );
    }

    const deadline = match.host_payment_expires_at;

    if (!deadline || !Number.isFinite(Date.parse(deadline))) {
      return <p role="alert">Payment deadline is unavailable.</p>;
    }

    const paymentExpired =
      expired || Date.now() >= Date.parse(deadline);

    return (
      <>
        <h1>
          Confirm your <span>match.</span>
        </h1>

        <p className="create-subtitle">
          Complete payment before your reservation expires.
        </p>

        <PaymentTimer
          expiresAt={deadline}
          onExpire={handleExpire}
        />

        <PayShare
          match={match}
          amount={match.share_per_player}
          hasPaid={hostPaid}
          hostPayment={true}
          paymentExpired={paymentExpired}
          onPaid={loadMatch}
        />
      </>
    );
  }

  return (
    <div className="create-match">
      <Navbar />

      <main>
        <div className="create-success">
          {renderContent()}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default HostPayment;
