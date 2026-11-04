const API_URL = import.meta.env.DEV
  ? "/api"
  : "https://wesal-backend-gy8a.onrender.com";

async function invitationRequest(path, accessToken, options = {}) {
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
    throw new Error(data.error || "Invitation request failed");
  }

  return data;
}

export function invitePlayer(matchId, email, accessToken) {
  return invitationRequest(
    `/matches/${matchId}/invitations/`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ email }),
    }
  );
}

export function getMyInvitations(accessToken) {
  return invitationRequest(
    `/invitations/`,
    accessToken
  );
}

export function acceptInvitation(invitationId, accessToken) {
  return invitationRequest(
    `/invitations/${invitationId}/accept/`,
    accessToken,
    { method: "POST" }
  );
}

export function declineInvitation(invitationId, accessToken) {
  return invitationRequest(
    `/invitations/${invitationId}/decline/`,
    accessToken,
    { method: "POST" }
  );
}
