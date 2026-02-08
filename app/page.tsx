'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [status, setStatus] = useState('');
  const [timer, setTimer] = useState(0); // ⏱️ seconds left

  // Countdown effect
  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const sendOtp = async () => {
    if (timer > 0) return;

    const generatedOtp = `${Math.floor(100000 + Math.random() * 900000)}`;
    setSentOtp(generatedOtp);
    setStatus('Sending OTP...');
    setTimer(60); // ⏱️ start 1-minute timer

    try {
      const response = await fetch('/api/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp: generatedOtp })
      });

      if (!response.ok) {
        const data = await response.json();
        setStatus(data.error ?? 'Failed to send OTP');
        setTimer(0);
        return;
      }

      setStatus('OTP sent! Please check your phone.');
    } catch (error) {
      setStatus('Unable to send OTP. Try again.');
      setTimer(0);
    }
  };

const verifyOtp = async () => {
  if (!otp || otp !== sentOtp) {
    setStatus('OTP does not match.');
    return;
  }

  setStatus('Verifying...');

  try {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile })
    });

    const data = await res.json();

    // ✅ store auth in localStorage
    localStorage.setItem('nightfly_token', data.token);
    localStorage.setItem('nightfly_mobile', mobile);

    // check user exists
    const userRes = await fetch('/api/check-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile })
    });

    const userData = await userRes.json();

    if (userData.exists) {
      router.push('/clubs');
    } else {
      router.push('/details');
    }
  } catch {
    setStatus('Something went wrong');
  }
};


  return (
    <section className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
      {/* LOGO */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <img src="/logo.png" alt="Nightfly" height={48} />
      </div>

      <h1 style={{ fontSize: '2rem', marginBottom: 12, textAlign: 'center' }}>
        Nightfly Login
      </h1>

      <p style={{ color: 'var(--muted)', marginBottom: 24, textAlign: 'center' }}>
        Use your Indian mobile number to receive a one-time password.
      </p>

      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <label className="label">Mobile Number</label>
          <input
            className="input"
            placeholder="+91 98765 43210"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </div>

        <div>
          <label className="label">OTP</label>
          <input
            className="input"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>

        {status && <div className="notice">{status}</div>}

        {timer > 0 && (
          <div style={{ fontSize: 14, color: '#888' }}>
            Resend OTP in <strong>{timer}s</strong>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="button"
            onClick={sendOtp}
            disabled={!mobile || timer > 0}
          >
            {timer > 0 ? 'Wait...' : 'Send OTP'}
          </button>

          <button
            className="button secondary"
            onClick={verifyOtp}
            disabled={!otp}
          >
            Verify
          </button>
        </div>
      </div>
    </section>
  );
}
