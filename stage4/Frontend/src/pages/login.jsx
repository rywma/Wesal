import { Link } from 'react-router-dom';
import { useState } from "react";
import '../styles/Auth.css';
import { loginUser } from '../services/authApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    setLoading(true);
    setMessage("");


      try {
        const data = await loginUser(email, password);
        
        if (data.success && data.tokens?.access && data.user) {
        login(data.user, data.tokens);
        navigate('/');
      } else {
        setMessage(data.message || 'Login failed.');
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
