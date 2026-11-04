
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getMatch } from '../services/matchesApi.js';
import '../styles/CreateMatch.css';
import '../styles/ManageMatch.css';
import '../styles/Footer.css';

function ManageMatch() {
    const { id } = useParams();
    const { user, isLoggedIn } = useAuth();

    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        location: '',
    });
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    useEffect(() => {
        async function loadMatch() {
            try {
                const data = await getMatch(id);

                if (data.success) {
                    setMatch(data);
                    setFormData({
                        date: data.date,
                        time: data.time.slice(0, 5),
                        location: data.location,
                    });
                } else {
                    setError(data.message || 'Failed to load match.');
                }
            } catch (err) {
                setError('Unable to connect to the server.');
            } finally {
                setLoading(false);
            }
        }

        loadMatch();
    }, [id]);

    const isOrganizer =
        isLoggedIn && match?.creator?.id === user?.id;

    return (
        <div className="create-match">
            <Navbar />

            <main>
                {loading ? (
                    <p>Loading match...</p>
                ) : error ? (
                    <p role="alert">{error}</p>
                ) : !isOrganizer ? (
                    <p>Only the organizer can manage this match.</p>
                ) : (
                    <div>
                        <h1>Manage Match</h1>
                        <p className="create-subtitle">
                            Update your match details.
                        </p>

                        <form className="create-form">
                            <div className="create-field">
                                <label htmlFor="edit-location">Location</label>
                                <input
                                    id="edit-location"
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) =>
                                        setFormData({ ...formData, location: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <div className="create-row">
                                <div className="create-field">
                                    <label htmlFor="edit-date">Date</label>
                                    <input
                                        id="edit-date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) =>
                                            setFormData({ ...formData, date: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div className="create-field">
                                    <label htmlFor="edit-time">Time</label>
                                    <input
                                        id="edit-time"
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) =>
                                            setFormData({ ...formData, time: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <button type="button" className="create-submit" disabled>
                                Save Changes
                            </button>
                        </form>
                        <div className="manage-cancel-section">
                            <button
                                type="button"
                                className="manage-cancel-btn"
                                onClick={() => setShowCancelConfirm(true)}
                            >
                                Cancel Match
                            </button>

                            {showCancelConfirm && (
                                <div className="manage-confirm" role="dialog" aria-label="Cancel match confirmation">
                                    <h2>Cancel this match?</h2>
                                    <p>Are you sure you want to cancel this match?</p>

                                    <button
                                        type="button"
                                        onClick={() => setShowCancelConfirm(false)}
                                    >
                                        Keep Match
                                    </button>

                                    <button type="button" disabled>
                                        Confirm Cancellation
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default ManageMatch;
