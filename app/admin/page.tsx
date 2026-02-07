'use client';

import { useEffect, useState } from 'react';

type Order = {
  id: string;
  club?: { name: string };
  amount: number;
  status: string;
  paymentStatus: string;
  manager?: { name: string; phone: string } | null;
};

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState('');

  const loadOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      setStatus('Unable to load orders.');
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateOrder = async (id: string, newStatus: string, managerName: string, managerPhone: string) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: newStatus,
          manager: managerName && managerPhone ? { name: managerName, phone: managerPhone } : null
        })
      });
      if (response.ok) {
        await loadOrders();
      }
    } catch (error) {
      setStatus('Unable to update order.');
    }
  };

  return (
    <section className="card">
      <div className="topbar">
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 6 }}>Admin Panel</h1>
          <p style={{ color: 'var(--muted)' }}>
            Manage orders, assign managers, and update status.
          </p>
        </div>
        <button className="button" onClick={loadOrders}>
          Refresh
        </button>
      </div>

      {status && <div className="notice">{status}</div>}

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {orders.map((order) => (
          <AdminOrderCard key={order.id} order={order} onUpdate={updateOrder} />
        ))}
      </div>
    </section>
  );
}

function AdminOrderCard({
  order,
  onUpdate
}: {
  order: Order;
  onUpdate: (id: string, status: string, managerName: string, managerPhone: string) => void;
}) {
  const [status, setStatus] = useState(order.status);
  const [managerName, setManagerName] = useState(order.manager?.name ?? '');
  const [managerPhone, setManagerPhone] = useState(order.manager?.phone ?? '');

  return (
    <div className="card">
      <h3 style={{ marginBottom: 8 }}>{order.club?.name ?? 'Club Booking'}</h3>
      <p style={{ color: 'var(--muted)', marginBottom: 12 }}>
        Amount: ₹{order.amount} | Payment: {order.paymentStatus}
      </p>
      <div style={{ display: 'grid', gap: 10 }}>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          className="input"
          placeholder="Manager Name"
          value={managerName}
          onChange={(event) => setManagerName(event.target.value)}
        />
        <input
          className="input"
          placeholder="Manager Phone"
          value={managerPhone}
          onChange={(event) => setManagerPhone(event.target.value)}
        />
        <button
          className="button"
          onClick={() => onUpdate(order.id, status, managerName, managerPhone)}
        >
          Update Order
        </button>
      </div>
    </div>
  );
}
