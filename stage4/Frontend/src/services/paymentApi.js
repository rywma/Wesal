const API_URL = import.meta.env.DEV
  ? "/api"
  : "https://wesal-backend-gy8a.onrender.com";

export async function getMyPayment(matchId, accessToken) {
  const response = await fetch(
    `${API_URL}/matches/${matchId}/my-payment/`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch payment details");
  }

  return response.json();
}