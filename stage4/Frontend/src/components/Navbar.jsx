import '../styles/Navbar.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, isLoggedIn, logout } = useAuth();
    const [logoutError, setLogoutError] = useState('');

    const handleLogout = async () => {
        setLogoutError('');

        const success = await logout();

        if (!success) {
            setLogoutError('Logout failed. Please try again.');
        }
    };

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
                    {isLoggedIn ? (
                        <>
                            <span className="navbar-username">
                                Hi, {user.name || user.email}
                            </span>

                            <button
                                type="button"
                                className="logout-btn"
                                onClick={handleLogout}
                            >
                                Log Out
                            </button>

                            {logoutError && (
                                <p role="alert">{logoutError}</p>
                            )}
                        </>
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
