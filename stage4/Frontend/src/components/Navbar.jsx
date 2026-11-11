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
                <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden="true">
                    <path d="M0 1h22M0 8h22M0 15h22" stroke="currentColor" strokeWidth="2" />
                </svg>
            </button>

            <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
                <div className="navbar-links">
                    <Link to="/" onClick={() => setMenuOpen(false)}>
                        Home
                    </Link>

                    <Link to="/matches" onClick={() => setMenuOpen(false)}>
                        Find Games
                    </Link>

                    <Link to="/create-match" onClick={() => setMenuOpen(false)}>
                        Host a Game
                    </Link>

                    <Link to="/my-matches" onClick={() => setMenuOpen(false)}>
                        My Matches
                    </Link>

                    {isLoggedIn && (
                        <Link to="/invitations" onClick={() => setMenuOpen(false)}>
                            Invitations
                        </Link>
                    )}

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
