import { Link } from 'react-router-dom';
import { useState } from "react";
import '../styles/Auth.css';

export default function Login() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    setLoading(true);
    setMessage("");


    try {
      const response = await fetch(
        "https://wesal-backend-gy8a.onrender.com/users/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();
      data.success = response.ok && data.status === "success";

      if (data.success) {
        setMessage("Login successful!");
      } else {
        setMessage(data.message || "Login failed");
      }


    } catch (error) {
      console.error("Login error:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1 className="auth-logo">Wesal.</h1>

        <h2>Welcome back!</h2>
        <p className="auth-subtitle">
          Log in to find your next game.
        </p>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {message && (
          <p className="auth-message" role="status">
            {message}
          </p>
        )}

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </main>
  );
}
