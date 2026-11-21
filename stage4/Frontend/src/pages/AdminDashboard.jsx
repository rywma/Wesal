
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
    getPendingVenueRequests,
    approveVenueRequest,
    rejectVenueRequest
} from '../services/venueRequestsApi.js';

import { SPORTS, SPORT_IDS } from '../services/matchesApi.js';
import Navbar from '../components/Navbar.jsx';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
    const { tokens, isLoggedIn } = useAuth();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedSports, setSelectedSports] = useState({});
    const [playerCounts, setPlayerCounts] = useState({});
    const [processingId, setProcessingId] = useState(null);
    const [requestToReject, setRequestToReject] = useState(null);

    async function handleApprove(requestId) {
        const sportId = SPORT_IDS[selectedSports[requestId]];
        const maxPlayers = Number(playerCounts[requestId]);

        if (!sportId || !Number.isInteger(maxPlayers) || maxPlayers < 2) {
            setError('Select a sport and enter at least 2 players.');
            return;
        }

        setProcessingId(requestId);
        setError('');

        try {
            await approveVenueRequest(
                requestId,
                sportId,
                maxPlayers,
                tokens.access
            );

            setRequests((prev) =>
                prev.filter((request) => request.id !== requestId)
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessingId(null);
        }
    }

    async function handleReject(requestId) {
        setProcessingId(requestId);
        setError('');

        try {
            await rejectVenueRequest(requestId, tokens.access);

            setRequests((prev) =>
                prev.filter((request) => request.id !== requestId)
            );

            setRequestToReject(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessingId(null);
        }
    }

    useEffect(() => {
        async function loadRequests() {
            if (!isLoggedIn) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');

            try {
                const data = await getPendingVenueRequests(tokens.access);
                setRequests(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadRequests();
    }, [isLoggedIn, tokens?.access]);

    if (!isLoggedIn) {
        return (
            <>
                <Navbar />
                <main className="admin-dashboard">
                    <h1>Admin Dashboard</h1>
                    <p>Please log in to access the admin dashboard.</p>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main className="admin-dashboard">
                <h1>Admin Dashboard</h1>
                <p>Review and manage venue requests.</p>

                {loading && <p>Loading requests...</p>}

                {error && !requestToReject && (
                    <p role="alert">{error}</p>
                )}

                {!loading && !error && requests.length === 0 && (
                    <p>No pending requests.</p>
                )}

                {!loading && !error && (
                    <div className="admin-requests-list">
                        {requests.map((request) => (
                            <section
                                className="admin-request"
                                key={request.id}
                            >
                                <h2>{request.facility_name}</h2>

                                <p>Location: {request.location}</p>
                                <p>Date: {request.date}</p>
                                <p>Time: {request.time}</p>
                                <p>Cost: {request.total_cost} SAR</p>
                                <p>Contact: {request.contact_number}</p>

                                {request.google_maps_link && (
                                    <p>
                                        <a
                                            href={request.google_maps_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View on Google Maps
                                        </a>
                                    </p>
                                )}

                                {request.description && (
                                    <p>Description: {request.description}</p>
                                )}

                                <div className="admin-request-actions">
                                    <label>
                                        Sport
                                        <select
                                            value={selectedSports[request.id] || ''}
                                            onChange={(e) =>
                                                setSelectedSports({
                                                    ...selectedSports,
                                                    [request.id]: e.target.value
                                                })
                                            }
                                            disabled={processingId !== null}
                                        >
                                            <option value="">
                                                Select sport
                                            </option>

                                            {SPORTS.map((sport) => (
                                                <option
                                                    key={sport}
                                                    value={sport}
                                                >
                                                    {sport}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label>
                                        Max Players
                                        <input
                                            type="number"
                                            min="2"
                                            value={playerCounts[request.id] || ''}
                                            onChange={(e) =>
                                                setPlayerCounts({
                                                    ...playerCounts,
                                                    [request.id]: e.target.value
                                                })
                                            }
                                            disabled={processingId !== null}
                                            placeholder="Enter number"
                                        />
                                    </label>

                                    <div className="admin-buttons">
                                        <button
                                            type="button"
                                            onClick={() => handleApprove(request.id)}
                                            disabled={processingId !== null}
                                        >
                                            {processingId === request.id
                                                ? 'Processing...'
                                                : 'Approve'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setError('');
                                                setRequestToReject(request.id);
                                            }}
                                            disabled={processingId !== null}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </main>

            {requestToReject !== null && (
                <div className="admin-modal-overlay">
                    <div
                        className="admin-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="reject-title"
                    >
                        <h2 id="reject-title">
                            Reject this request?
                        </h2>

                        <p>
                            This will permanently remove the venue request.
                        </p>

                        {error && (
                            <p role="alert">{error}</p>
                        )}

                        <div className="admin-modal-buttons">
                            <button
                                type="button"
                                onClick={() => {
                                    setRequestToReject(null);
                                    setError('');
                                }}
                                disabled={processingId !== null}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={() => handleReject(requestToReject)}
                                disabled={processingId !== null}
                            >
                                {processingId !== null
                                    ? 'Rejecting...'
                                    : 'Reject request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AdminDashboard;
