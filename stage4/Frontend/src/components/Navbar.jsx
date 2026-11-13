import '../styles/Navbar.css';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { DEFAULT_AVATAR, getMyProfile } from '../services/profileApi.js';

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const { user, tokens, profile, setProfile, isLoggedIn, logout } = useAuth();
    const [logoutError, setLogoutError] = useState('');

    useEffect(() => {
        if (isLoggedIn && !profile) {
            getMyProfile(tokens.access)
                .then((data) => setProfile(data))
                .catch((error) => console.error('Profile error:', error));
        }
    }, [isLoggedIn, profile]);

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
                        <div className="profile-menu">
                            <button
                                type="button"
                                className="profile-menu-toggle"
                                onClick={() => setProfileOpen(!profileOpen)}
                                aria-expanded={profileOpen}
                            >
                                <img
                                    src={profile?.avatar_url || DEFAULT_AVATAR}
                                    alt=""
                                />
                                {profile?.full_name || user.name || user.email}
                            </button>

                            {profileOpen && (
                                <div className="profile-menu-list">
                                    <Link to="/profile" onClick={() => setProfileOpen(false)}>
                                        Profile setup
                                    </Link>
                                    <Link to="/my-matches" onClick={() => setProfileOpen(false)}>
                                        My Matches
                                    </Link>
                                    <button type="button" onClick={handleLogout}>
                                        Log Out
                                    </button>
                                </div>
                            )}

                            {logoutError && (
                                <p role="alert">{logoutError}</p>
                            )}
                        </div>
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