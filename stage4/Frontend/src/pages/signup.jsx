
import { Link } from 'react-router-dom';
import { useState } from 'react';
import '../styles/Auth.css';
import { registerUser } from '../services/authApi.js';

export default function Signup() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');

    setLoading(true);
    setMessage('');

    try {
        const data = await registerUser(name, email, password);

      if (data.success) {
        setMessage('Account created successfully! You can now log in.');
      } else {
        const errorMessage = data.message;
        setMessage(
          Array.isArray(errorMessage)
            ? errorMessage.join(' ')
            : errorMessage || 'Sign up failed.'
        );
      }
    } catch (error) {
      console.error('Signup error:', error);
      setMessage('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1 className="auth-logo">Wesal.</h1>

        <h2>Join the game!</h2>
        <p className="auth-subtitle">
          Create your account and start playing.
        </p>

        <form className="auth-form" onSubmit={handleSignup}>
          <div className="auth-field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your name"
              autoComplete="name"
              required
            />
          </div>

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
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        {message && (
          <p className="auth-message" role="status">
            {message}
          </p>
        )}

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </main>
  );
}
