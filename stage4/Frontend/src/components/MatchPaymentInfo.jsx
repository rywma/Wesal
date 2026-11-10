function MatchPaymentInfo({ payment }) {
    if (!payment) {
        return <p>Payment information unavailable.</p>;
    }

    return (
        <div className="match-payment-info">
            <h3>Payment Details</h3>

            <p>Total Cost: {payment.total_cost} SAR</p>
            <p>Your Share: {payment.my_share} SAR</p>
            <p>
                Payment Status: <span>{payment.payment_status}</span>
            </p>
        </div>
    );
}

export default MatchPaymentInfo;

export function PlayersPaymentList({ players }) {
    return (
        <div className="players-payment-list">
            <h3>Players Payment Status</h3>

            {players.map((player) => (
                <div className="player-payment" key={player.user_id}>
                    <span>{player.name || player.email}</span>
                    <span>{player.payment_amount} SAR</span>
                    <span className="payment-status">
                        {player.payment_status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                </div>
            ))}
        </div>
    );
}