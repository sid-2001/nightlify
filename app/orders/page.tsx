'use client';

import { useEffect, useState } from 'react';

type Order = {
  id: string;
  club: { name: string; location: string };
  items: Array<{ name: string; type: string }>;
  amount: number;
  status: string;
  paymentStatus: string;
  manager?: { name: string; phone: string } | null;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState('');

  const loadOrders = async () => {
    try {
      const mobile = localStorage.getItem('nightfly_mobile') ?? '';
      const response = await fetch(`/api/orders?mobile=${mobile}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setOrders(data);
        }
      }
    } catch (error) {
      setStatus('Unable to refresh orders from server.');
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <section className="card">
      <div className="topbar">
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 6 }}>Your Orders</h1>
          <p style={{ color: 'var(--muted)' }}>
            Track booking and payment status.
          </p>
        </div>
        <button className="button" onClick={loadOrders}>
          Refresh
        </button>
      </div>

      {status && <div className="notice">{status}</div>}

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {orders.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>No orders placed yet.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="card">
              <h3 style={{ marginBottom: 8 }}>{order.club?.name}</h3>
              <p style={{ color: 'var(--muted)', marginBottom: 12 }}>
                {order.club?.location}
              </p>
              <div style={{ display: 'grid', gap: 8 }}>
                {order.items?.map((item, index) => (
                  <div key={`${item.name}-${index}`} className="badge">
                    {item.name} - {item.type}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                <p>
                  Payment:{' '}
                  <span className={order.paymentStatus === 'success' ? 'status-success' : 'status-warning'}>
                    {order.paymentStatus}
                  </span>
                </p>
                <p>
                  Order:{' '}
                  <span className={order.status === 'success' ? 'status-success' : 'status-warning'}>
                    {order.status}
                  </span>
                </p>
              </div>
              {order.status === 'success' && order.manager ? (
                <div style={{ marginTop: 12 }} className="notice">
                  Manager: {order.manager.name} - {order.manager.phone}
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
