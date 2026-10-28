import '../styles/Navbar.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, isLoggedIn } = useAuth();

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
                    <Link to="/matches" onClick={() => setMenuOpen(false)}>
                        Find Games
                    </Link>

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
                    {isLoggedIn ? (
                        <span className="navbar-username">
                            Hi, {user.name || user.email}
                        </span>
                    ) : (
                        <>
                            <Link to="/login">Log In</Link>
                            <Link to="/signup" className="get-started">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

            </div>
        </nav>
    );
}

export default Navbar;
