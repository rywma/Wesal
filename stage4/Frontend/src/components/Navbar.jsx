import '../styles/Navbar.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">Wesal</Link>

      <button
        className="menu-toggle"
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        ☰
      </button>

      <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
        <div className="navbar-links">
          <a href="#matches" onClick={() => setMenuOpen(false)}>
            Find Games
          </a>

          <Link to="/login" onClick={() => setMenuOpen(false)}>
            Host a Game
          </Link>

          <a href="#sports" onClick={() => setMenuOpen(false)}>
            Sports
          </a>

          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
            How It Works
          </a>
        </div>

        <div className="navbar-auth">
          <Link to="/login">Log In</Link>
          <Link to="/signup" className="get-started">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
