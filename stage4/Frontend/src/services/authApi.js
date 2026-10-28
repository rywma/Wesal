
const API_URL = import.meta.env.DEV ? "/api" : "https://wesal-backend-gy8a.onrender.com";

async function authRequest(endpoint, userData) {
  const response = await fetch(`${API_URL}/users/${endpoint}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  return {
    ...data,
    success: response.ok && data.status === "success",
  };
}

export function loginUser(email, password) {
  return authRequest("login", { email, password });
}

export function registerUser(name, email, password) {
  return authRequest("register", { name, email, password });
}
