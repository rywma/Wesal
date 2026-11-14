import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import AthleteCard from '../components/AthleteCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { SPORTS } from '../services/matchesApi.js';
import {
  AVATAR_SEEDS,
  SKILL_LEVELS,
  avatarUrl,
  getMyProfile,
  updateProfile,
} from '../services/profileApi.js';
import '../styles/ProfileSetup.css';
import '../styles/Footer.css';

function ProfileSetup() {
  const { isLoggedIn, tokens, setProfile } = useAuth();
  const location = useLocation();

  const [form, setForm] = useState(null);
  const [message, setMessage] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;

    getMyProfile(tokens.access)
      .then((data) => setForm(data))
      .catch((error) => setMessage(error.message));
  }, [isLoggedIn, tokens]);

  // Profile setup is for logged in players
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const updateField = (field, value) => {
    setForm({ ...form, [field]: value });
    setMessage('');
  };

  const toggleSport = (sport) => {
    const sports = form.favorite_sports || [];

    if (sports.includes(sport)) {
      updateField('favorite_sports', sports.filter((item) => item !== sport));
    } else {
      updateField('favorite_sports', [...sports, sport]);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setUsernameError('');

    try {
      const data = await updateProfile(
        {
          full_name: form.full_name,
          username: form.username,
          bio: form.bio,
          skill_level: form.skill_level,
          favorite_sports: form.favorite_sports,
          avatar_url: form.avatar_url,
        },
        tokens.access
      );

      setForm(data);
      setProfile(data);
      setMessage('Profile saved.');
    } catch (error) {
      if (error.fields?.username) {
        setUsernameError(error.fields.username[0]);
      } else {
        setMessage(error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-setup">
      <Navbar />

      <main>
        <h1>Set up your profile</h1>
        <p className="profile-subtitle">
          This is how other players see you when you join or host a game.
        </p>

        {!form ? (
          <p className="profile-message">{message || 'Loading your profile...'}</p>
        ) : (
          <div className="profile-layout">
            <form className="profile-form" onSubmit={handleSave}>
              <fieldset className="avatar-options">
                <legend>Avatar</legend>

                <div className="avatar-grid">
                  {AVATAR_SEEDS.map((seed) => (
                    <label key={seed} className="avatar-option">
                      <input
                        type="radio"
                        name="avatar"
                        checked={form.avatar_url === avatarUrl(seed)}
                        onChange={() => updateField('avatar_url', avatarUrl(seed))}
                      />
                      <img src={avatarUrl(seed)} alt={seed} />
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="profile-field">
                <label htmlFor="full_name">Full name</label>
                <input
                  id="full_name"
                  type="text"
                  value={form.full_name || ''}
                  onChange={(event) => updateField('full_name', event.target.value)}
                  maxLength={150}
                />
              </div>

              <div className="profile-field">
                <label htmlFor="username">Username</label>
                <div className="username-input">
                  <span>@</span>
                  <input
                    id="username"
                    type="text"
                    value={form.username || ''}
                    onChange={(event) => updateField('username', event.target.value.toLowerCase())}
                    maxLength={20}
                    aria-describedby="username-hint"
                  />
                </div>
                <p id="username-hint" className={usernameError ? 'field-error' : 'field-hint'}>
                  {usernameError || '3 to 20 letters, numbers or _.'}
                </p>
              </div>

              <div className="profile-field">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  rows={3}
                  value={form.bio || ''}
                  onChange={(event) => updateField('bio', event.target.value)}
                  placeholder="Padel on Fridays, always up for a 5-a-side."
                />
              </div>

              <div className="profile-field">
                <label htmlFor="skill_level">Skill level</label>
                <select
                  id="skill_level"
                  value={form.skill_level || ''}
                  onChange={(event) => updateField('skill_level', event.target.value)}
                >
                  <option value="" disabled>
                    Choose your level
                  </option>
                  {SKILL_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <fieldset className="sport-chips">
                <legend>Favorite sports</legend>

                <div className="sport-chips-list">
                  {SPORTS.map((sport) => (
                    <label key={sport} className="sport-chip">
                      <input
                        type="checkbox"
                        checked={(form.favorite_sports || []).includes(sport)}
                        onChange={() => toggleSport(sport)}
                      />
                      <span>{sport}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <button className="profile-submit" type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save profile'}
              </button>

              {message && (
                <p className="profile-message" role="status">
                  {message}
                </p>
              )}
            </form>

            <aside className="profile-preview" aria-label="Athlete card preview">
              <AthleteCard profile={form} />
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ProfileSetup;