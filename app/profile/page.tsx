'use client';

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
    const loadProfile = async () => {
      const savedMobile = localStorage.getItem('nightfly_mobile') ?? '';
      setMobile(savedMobile);
      if (!savedMobile) return;
      try {
        const response = await fetch(`/api/users?mobile=${savedMobile}`);
        if (response.ok) {
          const data = await response.json();
          if (data?.name) {
            setProfile(data);
          }
        }
      } catch (error) {
        // ignore
      }
    };
    loadProfile();
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
