const API_URL = import.meta.env.DEV
  ? "/api"
  : "https://wesal-backend-gy8a.onrender.com";

export const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"];

// Preset avatars from DiceBear
export const AVATAR_SEEDS = [
  "Falcon", "Tiger", "Comet", "Nova", "Blaze", "Storm",
  "Ace", "Rocket", "Viper", "Atlas", "Echo", "Jet",
];

export function avatarUrl(seed) {
  return `https://api.dicebear.com/10.x/disco/svg?seed=${seed}`;
}

// shown until the player picks one
export const DEFAULT_AVATAR = avatarUrl("Wesal");

async function profileRequest(path, accessToken, options = {}) {
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
    const error = new Error(data.error || data.detail || "Profile request failed");
    error.fields = data;
    throw error;
  }

  return data;
}

export function getMyProfile(accessToken) {
  return profileRequest("/users/profile/me/", accessToken);
}

export function updateProfile(profileData, accessToken) {
  return profileRequest("/users/profile/update/", accessToken, {
    method: "PATCH",
    body: JSON.stringify(profileData),
  });
}