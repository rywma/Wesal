
const API_URL = import.meta.env.DEV
  ? "/api"
  : "https://wesal-backend-gy8a.onrender.com";

async function paymentRequest(path, accessToken, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.detail || "Payment request failed");
  }

  return data;
}

export function getMyPayment(matchId, accessToken) {
  return paymentRequest(
    `/matches/${matchId}/my-payment/`,
    accessToken
  );
}

export function getMatchPayments(matchId, accessToken) {
  return paymentRequest(
    `/matches/${matchId}/payments/`,
    accessToken
  );
}

export function updatePaymentStatus(matchId, userId, paymentStatus, accessToken) {
  return paymentRequest(
    `/matches/${matchId}/payments/${userId}/`,
    accessToken,
    {
      method: "PATCH",
      body: JSON.stringify({ payment_status: paymentStatus }),
    }
  );
}

export function payMyShare(matchId, paymentId, accessToken) {
  return paymentRequest(
    `/payments/${matchId}/pay/`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ payment_id: paymentId }),
    }
  );
}
