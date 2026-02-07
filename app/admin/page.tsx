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
  const [clubName, setClubName] = useState('');
  const [clubLocation, setClubLocation] = useState('');
  const [clubVibe, setClubVibe] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [managers, setManagers] = useState<Array<{ name: string; phone: string }>>([]);

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
    loadManagers();
  }, []);

  const loadManagers = async () => {
    try {
      const response = await fetch('/api/managers');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setManagers(data);
        }
      }
    } catch (error) {
      // ignore
    }
  };

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

  const addClub = async () => {
    if (!clubName || !clubLocation) {
      setStatus('Club name and location are required.');
      return;
    }
    try {
      await fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `club-${Date.now()}`,
          name: clubName,
          location: clubLocation,
          vibe: clubVibe || 'Live Music'
        })
      });
      setClubName('');
      setClubLocation('');
      setClubVibe('');
      setStatus('Club added.');
    } catch (error) {
      setStatus('Unable to add club.');
    }
  };

  const addManager = async () => {
    if (!managerName || !managerPhone) {
      setStatus('Manager name and phone are required.');
      return;
    }
    try {
      await fetch('/api/managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: managerName, phone: managerPhone })
      });
      setManagerName('');
      setManagerPhone('');
      setStatus('Manager added.');
      loadManagers();
    } catch (error) {
      setStatus('Unable to add manager.');
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

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Add Club</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            <input
              className="input"
              placeholder="Club Name"
              value={clubName}
              onChange={(event) => setClubName(event.target.value)}
            />
            <input
              className="input"
              placeholder="Location"
              value={clubLocation}
              onChange={(event) => setClubLocation(event.target.value)}
            />
            <input
              className="input"
              placeholder="Vibe"
              value={clubVibe}
              onChange={(event) => setClubVibe(event.target.value)}
            />
            <button className="button" onClick={addClub}>
              Save Club
            </button>
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Add Manager</h3>
          <div style={{ display: 'grid', gap: 10 }}>
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
            <button className="button" onClick={addManager}>
              Save Manager
            </button>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {orders.map((order) => (
          <AdminOrderCard key={order.id} order={order} onUpdate={updateOrder} managers={managers} />
        ))}
      </div>
    </section>
  );
}

function AdminOrderCard({
  order,
  onUpdate,
  managers
}: {
  order: Order;
  onUpdate: (id: string, status: string, managerName: string, managerPhone: string) => void;
  managers: Array<{ name: string; phone: string }>;
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
        <select
          value={`${managerName}:${managerPhone}`}
          onChange={(event) => {
            const [name, phone] = event.target.value.split(':');
            setManagerName(name);
            setManagerPhone(phone);
          }}
        >
          <option value=":">Select Manager</option>
          {managers.map((manager) => (
            <option key={manager.phone} value={`${manager.name}:${manager.phone}`}>
              {manager.name} - {manager.phone}
            </option>
          ))}
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
