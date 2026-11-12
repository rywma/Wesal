
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getMyPayment, payMyShare } from '../services/paymentApi.js';
import PaymentTimer from './PaymentTimer.jsx';
import '../styles/PayShare.css';

function PayShare({
  match,
  amount,
  hasPaid,
  onPaid,
  hostPayment = false,
  paymentExpired = false,
}) {
  const { tokens } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [showForm, setShowForm] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [retryVerification, setRetryVerification] = useState(0);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [playerDeadline, setPlayerDeadline] = useState(null);
  const [playerExpired, setPlayerExpired] = useState(false);

  const checkedPayment = useRef(null);
  const onPaidRef = useRef(onPaid);
  onPaidRef.current = onPaid;

  const isFull = match.status === 'full' || match.spots_left <= 0;
  const paymentId = searchParams.get('id');
  const paymentStatus = searchParams.get('status');

  // Get the player's payment deadline from the backend.
  useEffect(() => {
    if (hostPayment || !isFull || hasPaid || !tokens?.access) {
      return;
    }

    let active = true;

    getMyPayment(match.id, tokens.access)
      .then((data) => {
        if (active && data.payment_expires_at) {
          setPlayerDeadline(data.payment_expires_at);
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      });

    return () => {
      active = false;
    };
  }, [hostPayment, isFull, hasPaid, match.id, tokens?.access]);

  // Verify the payment after returning from Moyasar.
  useEffect(() => {
    if (!paymentId || checkedPayment.current === paymentId) return;
    if (!tokens?.access) return;

    checkedPayment.current = paymentId;

    function clearCallback() {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.delete('id');
        next.delete('status');
        next.delete('message');
        return next;
      }, { replace: true });
    }

    async function verifyPayment() {
      setVerifying(true);
      setError('');

      try {
        if (paymentStatus !== 'paid') {
          setError('Payment failed. Please try again.');
          clearCallback();
          return;
        }

        // The backend verifies the payment with Moyasar.
        await payMyShare(match.id, paymentId, tokens.access);

        clearCallback();
        await onPaidRef.current?.();

        setMessage('Payment verified successfully.');
      } catch (err) {
        setError(err.message || 'Could not verify payment.');
        // Keep the payment ID for another verification attempt.
      } finally {
        setVerifying(false);
      }
    }

    verifyPayment();
  }, [paymentId, paymentStatus, match.id, tokens?.access, setSearchParams, retryVerification]);

  // Open Moyasar's payment form.
  useEffect(() => {
    if (!showForm || paymentExpired || playerExpired) return;

    if (!window.Moyasar) {
      setError('Payment form could not load.');
      return;
    }

    const key = import.meta.env.VITE_MOYASAR_PUBLISHABLE_KEY;

    if (!key) {
      setError('Payment is not configured.');
      return;
    }

    const callbackPath = hostPayment
      ? `/matches/${match.id}/host-payment`
      : `/matches/${match.id}`;

    window.Moyasar.init({
      element: '.mysr-form',
      language: 'en',
      amount: Math.round(Number(amount) * 100),
      currency: 'SAR',
      description: `Wesal match #${match.id}`,
      publishable_api_key: key,
      callback_url: `${window.location.origin}${callbackPath}`,
      methods: ['creditcard'],
    });
  }, [showForm, paymentExpired, playerExpired, hostPayment, match.id, amount]);

  const validDeadline =
    playerDeadline &&
    Number.isFinite(Date.parse(playerDeadline));

  const deadlinePassed =
    playerExpired ||
    (validDeadline && Date.now() >= Date.parse(playerDeadline));

  function renderPayment() {
    if (verifying) return <p>Verifying your payment...</p>;

    if (paymentId && paymentStatus === 'paid') {
      return (
        <div>
          <p>Payment verification was not completed.</p>
          <button
            type="button"
            className="pay-btn"
            onClick={() => {
              checkedPayment.current = null;
              setRetryVerification((count) => count + 1);
            }}
          >
            Retry Verification
          </button>
        </div>
      );
    }

    if (hasPaid) {
      return <p className="pay-done">Payment completed ✓</p>;
    }

    if (match.status === 'cancelled' || match.status === 'completed') {
      return <p>Payments are closed for this match.</p>;
    }

    if ((hostPayment && paymentExpired) ||
      (!hostPayment && deadlinePassed)) {
      return <p role="alert">Payment time has ended.</p>;
    }

    if (!hostPayment && !isFull) {
      return (
        <p>
          Payment opens when all {match.max_players} spots are filled.
          Your share is {amount} SAR.
        </p>
      );
    }

    if (!hostPayment && !validDeadline) {
      return (
        <p role="alert">
          Payment deadline is unavailable.
          Please try again later.
        </p>
      );
    }

    if (showForm) {
      return (
        <>
          <div className="mysr-form"></div>
          <button
            type="button"
            className="pay-cancel"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </button>
        </>
      );
    }

    return (
      <button
        type="button"
        className="pay-btn"
        onClick={() => {
          setError('');
          setShowForm(true);
        }}
      >
        {hostPayment ? 'Pay to confirm match' : 'Pay my share'}
        {' · '}{amount} SAR
      </button>
    );
  }

  return (
    <div className="pay-share">
      <h3>{hostPayment ? 'Host Payment' : 'Your Payment'}</h3>

      {!hostPayment && isFull && !hasPaid && validDeadline && (
        <PaymentTimer
          expiresAt={playerDeadline}
          onExpire={() => {
            setPlayerExpired(true);
            onPaidRef.current?.();
          }}
        />
      )}

      {renderPayment()}

      {message && <p className="pay-success">{message}</p>}
      {error && <p className="pay-error" role="alert">{error}</p>}
    </div>
  );
}

export default PayShare;
