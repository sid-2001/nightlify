'use client';

import Link from 'next/link';

export default function PaymentPendingPage() {
  return (
    <section className="card" style={{ maxWidth: 680, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.9rem', marginBottom: 12 }}>
        Payment Processing
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
        Give us 1 hour to handle your payment.
      </p>
      <div className="notice" style={{ marginBottom: 24 }}>
        We will verify the UTR and update your booking status shortly. You can
        refresh your orders anytime.
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link className="button" href="/orders">
          View Orders
        </Link>
        <Link className="button secondary" href="/clubs">
          Back to Clubs
        </Link>
      </div>
    </section>
  );
}
