import { motion } from 'motion/react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/Footer.css';
import '../styles/MyBadges.css';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getMyBadges } from '../services/challengesApi.js';

function MyBadges() {
    const badgeImages = {
        Rookie: '/badges/wesal_badge_bronze.png',
        'Football Fan': '/badges/wesal_badge_silver.png',
        'Padel Regular': '/badges/wesal_badge_silver.png',
        Champion: '/badges/wesal_badge_gold.webp',
    };
    const { isLoggedIn, tokens } = useAuth();
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoggedIn || !tokens?.access) {
            setLoading(false);
            return;
        }

        async function fetchBadges() {
            try {
                const data = await getMyBadges(tokens.access);

                if (data.success) {
                    setBadges(data.results || []);
                } else {
                    setError(data.message || 'Could not load badges.');
                }
            } catch (err) {
                console.error('Badges error:', err);
                setError('Unable to connect to the server.');
            } finally {
                setLoading(false);
            }
        }

        fetchBadges();
    }, [isLoggedIn, tokens?.access]);
    return (
        <>
            <Navbar />

            <main className="my-badges-page">
                <h1>My Badges</h1>
                <p>Badges you've earned by completing challenges.</p>
                {loading ? (
                    <p>Loading badges...</p>
                ) : error ? (
                    <p role="alert">{error}</p>
                ) : badges.length === 0 ? (
                    <p>You haven't earned any badges yet.</p>
                ) : (
                    <ul className="my-badges-list">
                        {badges.map((badge) => (
                            <li key={badge.challenge_id} className="my-badge">
                                <span className="my-badge-icon" aria-hidden="true">
                                    <motion.img
                                        src={badgeImages[badge.badge_name] || badgeImages.Rookie} alt="Bronze badge"
                                        initial={{ opacity: 0, scale: 0.85 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ scale: 1.08 }}
                                        transition={{ duration: 0.4 }}
                                    />
                                </span>

                                <div>
                                    <h2>{badge.badge_name}</h2>
                                    <p>{badge.challenge}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </main>

            <Footer />
        </>
    );
}

export default MyBadges;