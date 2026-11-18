// Helpers shared in each match page

export function toDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function formatDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });
}

export function formatTime(time) {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);

    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });
}

export function spotsLeft(match) {
    return match.max_players - match.players_count;
}

export function spotsText(count) {
    return count === 1 ? '1 spot left' : `${count} spots left`;
}

export function paymentBadge(paymentStatus, matchIsFull) {
    if (paymentStatus === 'paid') return { label: 'Paid', className: 'paid' };
    if (matchIsFull) return { label: 'Unpaid', className: 'unpaid' };
    return { label: 'Pending', className: 'pending' };
}

// Challenges: the big number on the left of each row, e.g. 12 "days left",
// 3 "days to start", or the day it ended
export function challengeDaysLeft(challenge) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [sy, sm, sd] = challenge.start_date.split('-').map(Number);
    const [ey, em, ed] = challenge.end_date.split('-').map(Number);
    const start = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);
    const dayMs = 1000 * 60 * 60 * 24;

    if (today < start) {
        const days = Math.round((start - today) / dayMs);
        return { number: days, label: days === 1 ? 'day to start' : 'days to start', ended: false };
    }
    if (today > end) {
        const day = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        return { number: day, label: 'ended', ended: true };
    }
    const days = Math.round((end - today) / dayMs);
    return { number: days, label: days === 1 ? 'day left' : 'days left', ended: false };
}

// Challenges: "Play 5 Football matches" or "Win 3 matches"
export function challengeGoal(challenge) {
    const verb = challenge.goal_type === 'win' ? 'Win' : 'Play';
    const sport = challenge.sport ? `${challenge.sport} ` : '';
    return `${verb} ${challenge.target} ${sport}${challenge.target === 1 ? 'match' : 'matches'}`;
}
