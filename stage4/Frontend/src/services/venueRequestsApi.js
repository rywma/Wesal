
const API_URL = import.meta.env.DEV
    ? "/api"
    : "https://wesal-backend-gy8a.onrender.com";

export async function getPendingVenueRequests(token) {
    const response = await fetch(`${API_URL}/venue-requests/pending/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || data.error || "Failed to load venue requests."
        );
    }

    return data;
}


export async function approveVenueRequest(requestId, sportId, maxPlayers, token) {
    const response = await fetch(
        `${API_URL}/venue-requests/${requestId}/approve/`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                sport_id: sportId,
                max_players: maxPlayers,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || data.detail || 'Failed to approve request.');
    }

    return data;
}

export async function rejectVenueRequest(requestId, token) {
    const response = await fetch(
        `${API_URL}/venue-requests/${requestId}/reject/`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || data.detail || 'Failed to reject request.');
    }

    return data;
}

// A venue owner submits a stadium for the admin to review
// If the backend rejects a field those messages come back as 
// { field_name: ["message"] }, so they're attached to the error as fieldErrors.
export async function submitVenueRequest(requestData, token) {
    const response = await fetch(`${API_URL}/matches/api/venue-requests/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.error || data.detail || 'Could not submit your request.');
        error.fieldErrors = data.detail || data.error ? {} : data;
        throw error;
    }

    return data;
}
