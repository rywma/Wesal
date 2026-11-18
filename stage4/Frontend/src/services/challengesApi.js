const API_URL = import.meta.env.DEV ? "/api" : "https://wesal-backend-gy8a.onrender.com";

// Same shape as matchRequest: always returns { ..., success, message, sessionExpired }
async function challengeRequest(endpoint, method, token) {
  const response = await fetch(`${API_URL}/challenges/${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json();

  return {
    ...(Array.isArray(data) ? { results: data } : data),
    success: response.ok,
    message: response.ok ? "" : data.error || data.detail || "Something went wrong.",
    sessionExpired: data.code === "token_not_valid",
  };
}

// Every challenge, each with my progress (joined, progress, percent, completed)
export function getChallenges(token) {
  return challengeRequest("", "GET", token);
}

// One challenge, with my progress and a leaderboard of everyone in it
export function getChallenge(challengeId, token) {
  return challengeRequest(`${challengeId}/`, "GET", token);
}

export function joinChallenge(challengeId, token) {
  return challengeRequest(`${challengeId}/join/`, "POST", token);
}

export function leaveChallenge(challengeId, token) {
  return challengeRequest(`${challengeId}/leave/`, "POST", token);
}

// Every challenge I completed
export function getMyBadges(token) {
  return challengeRequest("my-badges/", "GET", token);
}
