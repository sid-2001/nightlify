'use client';

import router from 'next/router';
import { useEffect, useState } from 'react';

type Profile = {
  name: string;
  gender: string;
  location: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mobile, setMobile] = useState('');

  useEffect(() => {

     const token = localStorage.getItem('nightfly_token');

    if (!token) {
      router.replace('/');
    }
    const stored = localStorage.getItem('nightfly_profile');
    if (stored) {
      setProfile(JSON.parse(stored));
    }
    setMobile(localStorage.getItem('nightfly_mobile') ?? '');
  }, []);

  return (
    <section className="card" style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: 12 }}>Profile</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
        Your profile information is read-only.
      </p>

      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <label className="label">Name</label>
          <div className="input">{profile?.name ?? '-'}</div>
        </div>
        <div>
          <label className="label">Gender</label>
          <div className="input">{profile?.gender ?? '-'}</div>
        </div>
        <div>
          <label className="label">Location</label>
          <div className="input">{profile?.location ?? '-'}</div>
        </div>
        <div>
          <label className="label">Mobile</label>
          <div className="input">{mobile || '-'}</div>
        </div>
      </div>
    </section>
  );
}
