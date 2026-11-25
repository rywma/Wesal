import '../styles/Navbar.css';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext.jsx';
import { DEFAULT_AVATAR, getMyProfile } from '../services/profileApi.js';

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const { user, tokens, profile, setProfile, isLoggedIn, logout } = useAuth();
    const [logoutError, setLogoutError] = useState('');

    const { pathname } = useLocation();

    const tabs = [
        { path: '/', label: 'Home' },
        { path: '/matches', label: 'Find Games' },
        { path: '/create-match', label: 'Host a Game' },
        ...(isLoggedIn ? [
            { path: '/challenges', label: 'Challenges' },
            { path: '/invitations', label: 'Invitations' }
        ] : [])
    ];

    const points = profile?.points ?? 0;

    const badge = points >= 300
        ? { name: 'Gold', image: '/badges/wesal_badge_gold.webp' }
        : points >= 100
            ? { name: 'Silver', image: '/badges/wesal_badge_silver.png' }
            : { name: 'Bronze', image: '/badges/wesal_badge_bronze.png' };

    useEffect(() => {
        if (!isLoggedIn || !tokens?.access) return;

        getMyProfile(tokens.access)
            .then((data) => setProfile(data))
            .catch((error) => console.error('Profile error:', error));

    }, [isLoggedIn, tokens?.access, profileOpen, setProfile]);

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
                    {tabs.map((tab) => {
                        const active = pathname === tab.path ||
                            (tab.path !== '/' && pathname.startsWith(`${tab.path}/`));

                        return (
                            <Link
                                key={tab.path}
                                to={tab.path}
                                className={`navbar-tab ${active ? 'active' : ''}`}
                                aria-current={active ? 'page' : undefined}
                                onClick={() => setMenuOpen(false)}
                            >
                                {active && (
                                    <motion.span
                                        layoutId="navbar-active-tab"
                                        className="navbar-tab-indicator"
                                        initial={false}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 380,
                                            damping: 30
                                        }}
                                    />
                                )}

                                <span className="navbar-tab-label">
                                    {tab.label}
                                </span>
                            </Link>
                        );
                    })}
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
                                    <div className="profile-badge">
                                        <img src={badge.image} alt={`${badge.name} badge`} />

                                        <div>
                                            <strong>{badge.name} Badge</strong>
                                            <span>{points} Points</span>
                                        </div>
                                    </div>
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