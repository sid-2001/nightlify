'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [status, setStatus] = useState('');
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((value) => value - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  const sendOtp = async () => {
    const generatedOtp = `${Math.floor(100000 + Math.random() * 900000)}`;
    setSentOtp(generatedOtp);
    setStatus('Sending OTP...');
    setResendTimer(60);

    try {
      const response = await fetch('/api/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp: generatedOtp })
      });

      if (!response.ok) {
        const data = await response.json();
        setStatus(data.error ?? 'Failed to send OTP');
        return;
      }

      setStatus('OTP sent! Please check your phone.');
    } catch (error) {
      setStatus('Unable to send OTP. Try again.');
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp !== sentOtp) {
      setStatus('OTP does not match.');
      return;
    }

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      });
      if (!response.ok) {
        setStatus('Unable to verify OTP.');
        return;
      }
      localStorage.setItem('nightfly_mobile', mobile);
      router.push('/details');
    } catch (error) {
      setStatus('Unable to verify OTP.');
    }
  };

  return (
    <section className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 12 }}>Nightfly Login</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
        Use your Indian mobile number to receive a one-time password.
      </p>

      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <label className="label">Mobile Number</label>
          <input
            className="input"
            placeholder="+91 98765 43210"
            value={mobile}
            onChange={(event) => setMobile(event.target.value)}
          />
        </div>
        <div>
          <label className="label">OTP</label>
          <input
            className="input"
            placeholder="Enter OTP"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
          />
        </div>
        {status && <div className="notice">{status}</div>}
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="button" onClick={sendOtp} disabled={!mobile}>
            Send OTP
          </button>
          <button
            className="button secondary"
            onClick={verifyOtp}
            disabled={!otp}
          >
            Verify
          </button>
        </div>
        <button
          className="button ghost"
          onClick={sendOtp}
          disabled={!mobile || resendTimer > 0}
        >
          {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
        </button>
      </div>
    </section>
  );
}
