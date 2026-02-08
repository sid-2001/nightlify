'use client';

import { useEffect, useState } from 'react';

type Order = {
  id: string;
  club?: { name: string };
  amount: number;
  status: string;
  paymentStatus: string;
  manager?: { name: string; phone: string } | null;
  createdAt?: string;
  updatedAt?: string;
  scheduledTime?: string;
};

type Manager = {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  assignedOrders?: number;
  createdAt?: string;
};

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const [clubName, setClubName] = useState('');
  const [clubLocation, setClubLocation] = useState('');
  const [clubVibe, setClubVibe] = useState('');
  const [instagram, setInstagram] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string>('');

  const [managerName, setManagerName] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [managerEmail, setManagerEmail] = useState('');

  const [managers, setManagers] = useState<Manager[]>([]);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);

  /* ---------------- LOAD DATA ---------------- */

  const loadOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch {
      setStatus('Unable to load orders.');
    }
  };

  const loadManagers = async () => {
    try {
      const response = await fetch('/api/managers');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) setManagers(data);
      }
    } catch {}
  };

  useEffect(() => {
    loadOrders();
    loadManagers();
  }, []);

  // Filter orders based on selected filter
  useEffect(() => {
    switch (filter) {
      case 'pending':
        setFilteredOrders(orders.filter(order => 
          order.status === 'pending' || 
          order.status === 'confirmed' ||
          order.paymentStatus === 'pending'
        ));
        break;
      case 'completed':
        setFilteredOrders(orders.filter(order => 
          order.status === 'success' || 
          order.status === 'completed' ||
          order.paymentStatus === 'success'
        ));
        break;
      default:
        setFilteredOrders(orders);
    }
  }, [orders, filter]);

  /* ---------------- IMAGE UPLOAD ---------------- */

  const handleImageUpload = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      setStatus('Image must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhoto(reader.result as string); // Base64
    };
    reader.readAsDataURL(file);
  };

  /* ---------------- ACTIONS ---------------- */

  const updateOrder = async (
    id: string,
    newStatus: string,
    managerName: string,
    managerPhone: string,
    scheduledTime?: string
  ) => {
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: newStatus,
          manager: managerName && managerPhone ? { name: managerName, phone: managerPhone } : null,
          scheduledTime,
          updatedAt: new Date().toISOString()
        })
      });
      loadOrders();
      setStatus('Order updated successfully.');
    } catch {
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
          vibe: clubVibe || 'Live Music',
          instagram,
          imageBase64: profilePhoto,
          createdAt: new Date().toISOString()
        })
      });

      setClubName('');
      setClubLocation('');
      setClubVibe('');
      setInstagram('');
      setProfilePhoto('');
      setStatus('Club added successfully.');
    } catch {
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
        body: JSON.stringify({ 
          name: managerName, 
          phone: managerPhone,
          email: managerEmail,
          createdAt: new Date().toISOString(),
          assignedOrders: 0
        })
      });

      setManagerName('');
      setManagerPhone('');
      setManagerEmail('');
      loadManagers();
      setStatus('Manager added.');
    } catch {
      setStatus('Unable to add manager.');
    }
  };

  const updateManager = async (manager: Manager) => {
    try {
      await fetch('/api/managers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manager)
      });

      loadManagers();
      setEditingManager(null);
      setStatus('Manager updated.');
    } catch {
      setStatus('Unable to update manager.');
    }
  };

  const deleteManager = async (id: string) => {
    if (!confirm('Are you sure you want to delete this manager?')) return;
    
    try {
      await fetch('/api/managers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      loadManagers();
      setStatus('Manager deleted.');
    } catch {
      setStatus('Unable to delete manager.');
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <section className="card">
      <div className="topbar">
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Admin Panel</h1>
          <p style={{ color: 'var(--muted)' }}>Manage orders, clubs & managers</p>
        </div>
        <button className="button" onClick={loadOrders}>Refresh</button>
      </div>

      {status && <div className="notice">{status}</div>}

      {/* ORDER FILTER */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Orders</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`button ${filter === 'all' ? '' : 'secondary'}`}
            onClick={() => setFilter('all')}
          >
            All ({orders.length})
          </button>
          <button 
            className={`button ${filter === 'pending' ? '' : 'secondary'}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({orders.filter(o => o.status === 'pending' || o.paymentStatus === 'pending').length})
          </button>
          <button 
            className={`button ${filter === 'completed' ? '' : 'secondary'}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({orders.filter(o => o.status === 'success' || o.paymentStatus === 'success').length})
          </button>
        </div>
      </div>

      {/* ORDERS GRID */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', marginBottom: 32 }}>
        {filteredOrders.map(order => (
          <AdminOrderCard 
            key={order.id} 
            order={order} 
            onUpdate={updateOrder} 
            managers={managers} 
          />
        ))}
      </div>

      {/* ADD CLUB & MANAGER SECTION */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', marginBottom: 24 }}>
        {/* ADD CLUB */}
        <div className="card">
          <h3>Add Club</h3>

          <input className="input" placeholder="Club Name" value={clubName} onChange={e => setClubName(e.target.value)} />
          <input className="input" placeholder="Location" value={clubLocation} onChange={e => setClubLocation(e.target.value)} />
          <input className="input" placeholder="Instagram" value={instagram} onChange={e => setInstagram(e.target.value)} />
          <input className="input" placeholder="Vibe" value={clubVibe} onChange={e => setClubVibe(e.target.value)} />

          <div style={{ margin: '12px 0' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>Club Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => e.target.files && handleImageUpload(e.target.files[0])}
            />
          </div>

          {profilePhoto && (
            <img
              src={profilePhoto}
              alt="Club Preview"
              style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: '12px' }}
            />
          )}

          <button className="button" onClick={addClub}>Save Club</button>
        </div>

        {/* ADD MANAGER */}
        <div className="card">
          <h3>{editingManager ? 'Edit Manager' : 'Add Manager'}</h3>
          <input 
            className="input" 
            placeholder="Manager Name" 
            value={editingManager ? editingManager.name : managerName} 
            onChange={e => editingManager ? 
              setEditingManager({...editingManager, name: e.target.value}) : 
              setManagerName(e.target.value)} 
          />
          <input 
            className="input" 
            placeholder="Manager Phone" 
            value={editingManager ? editingManager.phone : managerPhone} 
            onChange={e => editingManager ? 
              setEditingManager({...editingManager, phone: e.target.value}) : 
              setManagerPhone(e.target.value)} 
          />
          <input 
            className="input" 
            placeholder="Manager Email" 
            value={editingManager ? editingManager.email || '' : managerEmail} 
            onChange={e => editingManager ? 
              setEditingManager({...editingManager, email: e.target.value}) : 
              setManagerEmail(e.target.value)} 
          />
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="button" onClick={() => 
              editingManager ? updateManager(editingManager) : addManager()
            }>
              {editingManager ? 'Update Manager' : 'Save Manager'}
            </button>
            {editingManager && (
              <button className="button secondary" onClick={() => setEditingManager(null)}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MANAGERS LIST */}
      <div className="card">
        <h3>Managers List</h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '12px' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Phone</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Assigned Orders</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {managers.map(manager => (
                <tr key={manager.id || manager.phone} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '12px' }}>{manager.name}</td>
                  <td style={{ padding: '12px' }}>{manager.phone}</td>
                  <td style={{ padding: '12px' }}>{manager.email || '-'}</td>
                  <td style={{ padding: '12px' }}>{manager.assignedOrders || 0}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="button secondary" 
                        style={{ padding: '6px 12px', fontSize: '0.9rem' }}
                        onClick={() => setEditingManager(manager)}
                      >
                        Edit
                      </button>
                      <button 
                        className="button secondary" 
                        style={{ padding: '6px 12px', fontSize: '0.9rem' }}
                        onClick={() => manager.id && deleteManager(manager.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ---------------- ORDER CARD ---------------- */

function AdminOrderCard({
  order,
  onUpdate,
  managers
}: {
  order: Order;
  onUpdate: (id: string, status: string, managerName: string, managerPhone: string, scheduledTime?: string) => void;
  managers: Manager[];
}) {
  const [status, setStatus] = useState(order.status);
  const [managerName, setManagerName] = useState(order.manager?.name ?? '');
  const [managerPhone, setManagerPhone] = useState(order.manager?.phone ?? '');
  const [scheduledTime, setScheduledTime] = useState(order.scheduledTime || '');

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 8px 0' }}>{order.club?.name ?? 'Club Booking'}</h3>
          <p style={{ color: 'var(--muted)', margin: '0 0 4px 0', fontSize: '0.9rem' }}>
            Order ID: {order.id}
          </p>
          <p style={{ color: 'var(--muted)', margin: '0 0 4px 0', fontSize: '0.9rem' }}>
            Created: {formatDate(order.createdAt)}
          </p>
          {order.updatedAt && (
            <p style={{ color: 'var(--muted)', margin: '0 0 8px 0', fontSize: '0.9rem' }}>
              Last Updated: {formatDate(order.updatedAt)}
            </p>
          )}
        </div>
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.8rem',
          backgroundColor: order.status === 'success' || order.paymentStatus === 'success' ? 
            'var(--success)' : 'var(--warning)',
          color: 'white'
        }}>
          {order.paymentStatus}
        </span>
      </div>

      <div style={{ margin: '16px 0' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>
          ₹{order.amount}
        </p>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Status</label>
        <select 
          className="input" 
          value={status} 
          onChange={e => setStatus(e.target.value)}
          style={{ width: '100%' }}
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="assigned">Assigned to Manager</option>
          <option value="success">Success</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Schedule Time</label>
        <input 
          type="datetime-local"
          className="input"
          value={scheduledTime}
          onChange={e => setScheduledTime(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Assign Manager</label>
        <select
          className="input"
          value={`${managerName}:${managerPhone}`}
          onChange={e => {
            const [name, phone] = e.target.value.split(':');
            setManagerName(name);
            setManagerPhone(phone);
          }}
          style={{ width: '100%', marginBottom: '12px' }}
        >
          <option value=":">Select Manager</option>
          {managers.map(m => (
            <option key={m.phone} value={`${m.name}:${m.phone}`}>
              {m.name} - {m.phone}
            </option>
          ))}
        </select>

        <input 
          className="input" 
          placeholder="Manager Name" 
          value={managerName} 
          onChange={e => setManagerName(e.target.value)}
          style={{ width: '100%', marginBottom: '8px' }}
        />
        <input 
          className="input" 
          placeholder="Manager Phone" 
          value={managerPhone} 
          onChange={e => setManagerPhone(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      <button 
        className="button" 
        onClick={() => onUpdate(order.id, status, managerName, managerPhone, scheduledTime)}
        style={{ width: '100%' }}
      >
        Update Order
      </button>
    </div>
  );
}