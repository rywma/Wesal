const API_URL = import.meta.env.DEV ? "/api" : "https://wesal-backend-gy8a.onrender.com";

export const SPORTS = ['Padel', 'Football', 'Basketball', 'Volleyball', 'Tennis'];

// The backend wants a sport's ID, not its name.
// These match the "sports" table in Supabase.
export const SPORT_IDS = {
  Football: 1,
  Padel: 2,
  Basketball: 3,
  Volleyball: 4,
  Tennis: 5,
};

// Turns any of the backend's error shapes into one readable sentence.
function errorMessage(data) {
  if (data.code === "token_not_valid") return "Your session has expired. Please log in again.";
  if (data.error) return data.error;
  if (data.detail) return data.detail;

  return Object.values(data)
    .flat()
    .filter((item) => typeof item === "string")
    .join(" ");
}

async function matchRequest(endpoint, method, token, body) {
  const response = await fetch(`${API_URL}/matches/${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  return {
    ...data,
    success: response.ok,
    message: response.ok ? "" : errorMessage(data),
    sessionExpired: data.code === "token_not_valid",
  };
}

export function createMatch(matchData, token) {
  return matchRequest("", "POST", token, matchData);
}

export function joinMatch(matchId, token) {
  return matchRequest(`${matchId}/join/`, "POST", token);
}

export function leaveMatch(matchId, token) {
  return matchRequest(`${matchId}/leave/`, "POST", token);
}

// A player's own share and payment status.
export function getMyPayment(matchId, token) {
  return matchRequest(`${matchId}/my-payment/`, "GET", token);
}

// Creator only: every player's share and payment status.
export function getMatchPayments(matchId, token) {
  return matchRequest(`${matchId}/payments/`, "GET", token);
}

// Creator only: mark a player as "paid" or "pending".
export function updatePayment(matchId, userId, paymentStatus, token) {
  return matchRequest(`${matchId}/payments/${userId}/`, "PATCH", token, {
    payment_status: paymentStatus,
  });
}