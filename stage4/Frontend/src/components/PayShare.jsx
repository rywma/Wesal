import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { payMyShare } from '../services/paymentApi.js';
import '../styles/PayShare.css';

function PayShare({ match, amount, hasPaid, onPaid }) {
  const { tokens } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isFull = match.status === 'full' || match.spots_left <= 0;

  useEffect(() => {
    const paymentId = searchParams.get('id');
    const paymentStatus = searchParams.get('status');
    const moyasarMessage = searchParams.get('message');

    if (!paymentId) return;

    setSearchParams({}, { replace: true });

    async function confirmPayment() {
      if (paymentStatus !== 'paid') {
        setError(moyasarMessage || 'Payment failed. Please try again.');
        return;
      }

      try {
        await payMyShare(match.id, paymentId, tokens.access);
        setMessage('Payment successful! You are marked as paid.');
        onPaid();
      } catch (err) {
        setError(err.message);
      }
    }

    confirmPayment();
  }, []);

  // Show Moyasar's card form once the player clicks "Pay my share"
  useEffect(() => {
    if (!showForm) return;

    if (!window.Moyasar) {
      setError('The payment form could not load. Please refresh and try again.');
      return;
    }

    window.Moyasar.init({
      element: '.mysr-form',
      language: 'en',
      amount: Math.round(Number(amount) * 100), // Moyasar wants halalas
      currency: 'SAR',
      description: `Wesal match #${match.id}`,
      publishable_api_key: import.meta.env.VITE_MOYASAR_PUBLISHABLE_KEY,
      callback_url: `${window.location.origin}/matches/${match.id}`,
      methods: ['creditcard'],
    });
  }, [showForm]);

  function renderPayment() {
    if (hasPaid) {
      return <p className="pay-done">You've paid your share ✓</p>;
    }

    if (!isFull) {
      return (
        <p>
          Payment opens when all {match.max_players} spots are filled.
          Your share is {amount} SAR.
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
        onClick={() => setShowForm(true)}
      >
        Pay my share · {amount} SAR
      </button>
    );
  }

  return (
    <div className="pay-share">
      <h3>Your Payment</h3>

      {renderPayment()}

      {message && <p className="pay-success">{message}</p>}
      {error && <p className="pay-error" role="alert">{error}</p>}
    </div>
  );
}

export default PayShare;
