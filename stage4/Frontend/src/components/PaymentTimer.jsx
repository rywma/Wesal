
import { useEffect, useRef, useState } from 'react';
import '../styles/PaymentTimer.css';

function getSecondsLeft(expiresAt) {
    if (!expiresAt) return null;

    const deadline = new Date(expiresAt).getTime();

    if (!Number.isFinite(deadline)) return null;

    return Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
}

function PaymentTimer({ expiresAt, onExpire }) {
    const [secondsLeft, setSecondsLeft] = useState(() =>
        getSecondsLeft(expiresAt)
    );

    const notifiedDeadline = useRef(null);

    useEffect(() => {
        function updateTimer() {
            setSecondsLeft(getSecondsLeft(expiresAt));
        }

        updateTimer();

        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [expiresAt]);

    useEffect(() => {
        if (
            secondsLeft === 0 &&
            onExpire &&
            notifiedDeadline.current !== expiresAt
        ) {
            notifiedDeadline.current = expiresAt;
            onExpire();
        }
    }, [secondsLeft, expiresAt, onExpire]);

    if (secondsLeft === null) {
        return (
            <p role="alert">
                Payment deadline unavailable. Please try again.
            </p>
        );
    }

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    const formattedTime =
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const expired = secondsLeft === 0;

    return (
        <div className={`payment-timer ${expired ? 'expired' : ''}`}>
            <p>Time remaining to complete payment</p>

            <strong role="timer" aria-live="off">
                {formattedTime}
            </strong>

            <p className="timer-warning" role={expired ? 'alert' : undefined}>
                {expired
                    ? 'Payment time has ended. Checking reservation status is required.'
                    : 'Your reservation will be canceled if you do not pay before the deadline.'}
            </p>
        </div>
    );
}

export default PaymentTimer;
