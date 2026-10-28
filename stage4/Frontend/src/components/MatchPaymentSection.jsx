
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import MatchPaymentInfo, { PlayersPaymentList } from "./MatchPaymentInfo.jsx";
import {
  getMyPayment,
  getMatchPayments,
  updatePaymentStatus,
} from "../services/paymentApi.js";

function MatchPaymentSection({ matchId, isOrganizer = false }) {
  const { tokens } = useAuth();
  const [payment, setPayment] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPayment() {
      setLoading(true);
      setError("");
      setPayment(null);
      setPlayers([]);

      try {
        const data = isOrganizer
          ? await getMatchPayments(matchId, tokens.access)
          : await getMyPayment(matchId, tokens.access);

        if (!active) return;

        if (isOrganizer) {
          setPlayers(data.players || []);
        } else {
          setPayment(data);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    if (matchId && tokens?.access) {
      loadPayment();
    } else {
      setLoading(false);
      setError("Please log in to view payment details.");
    }

    return () => {
      active = false;
    };
  }, [matchId, isOrganizer, tokens?.access]);

  async function handleStatusChange(userId, newStatus) {
    try {
      setError("");

      await updatePaymentStatus(
        matchId,
        userId,
        newStatus,
        tokens.access
      );

      const data = await getMatchPayments(matchId, tokens.access);
      setPlayers(data.players || []);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p>Loading payment details...</p>;

  return (
    <section>
      {error && <p role="alert">{error}</p>}

      {isOrganizer ? (
        <PlayersPaymentList
          players={players}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <MatchPaymentInfo payment={payment} />
      )}
    </section>
  );
}

export default MatchPaymentSection;
