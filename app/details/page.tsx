'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DetailsPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');

  const saveDetails = () => {
    localStorage.setItem(
      'nightfly_profile',
      JSON.stringify({ name, gender, location })
    );
    router.push('/clubs');
  };

  return (
    <section className="card" style={{ maxWidth: 620, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.9rem', marginBottom: 12 }}>
        Personal Details
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
        Tell us about yourself to personalize your club experience.
      </p>
      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <label className="label">Full Name</label>
          <input
            className="input"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div>
          <label className="label">Gender</label>
          <select value={gender} onChange={(event) => setGender(event.target.value)}>
            <option value="">Select</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="label">Location</label>
          <input
            className="input"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </div>
        <button
          className="button"
          onClick={saveDetails}
          disabled={!name || !gender || !location}
        >
          Continue to Clubs
        </button>
      </div>
    </section>
  );
}
