'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Order = {
  id: string;
  club: { 
    name: string; 
    location: string;
    imageBase64?: string;
    vibe?: string;
  };
  items: Array<{ name: string; type: string }>;
  amount: number;
  status: string;
  paymentStatus: string;
  manager?: { name: string; phone: string } | null;
  createdAt?: string;
  updatedAt?: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [connectingManager, setConnectingManager] = useState<string | null>(null);
const router = useRouter();
  const loadOrders = async () => {
    // Load from localStorage first
    const localOrders = JSON.parse(
      localStorage.getItem('nightfly_orders') ?? '[]'
    );
    
    try {
      // Try to load from server
      const response = await fetch('/api/orders');
      if (response.ok) {
        const serverOrders = await response.json();
        // Merge server orders with local orders, preferring server data
        const allOrders = [...serverOrders, ...localOrders.filter(local => 
          !serverOrders.some(server => server.id === local.id)
        )];
        setOrders(allOrders);
      } else {
        // Fallback to local orders
        setOrders(localOrders);
      }
    } catch (error) {
      // Fallback to local orders on error
      setOrders(localOrders);
      setStatus('Unable to refresh orders from server.');
    }
  };


  useEffect(() => {
     const token = localStorage.getItem('nightfly_token');

    if (!token) {
      router.replace('/');
    }
    loadOrders();
  }, []);

  useEffect(() => {
    // Filter orders based on selection
    switch (filter) {
      case 'pending':
        setFilteredOrders(orders.filter(order => 
          order.status === 'pending' || 
          order.paymentStatus === 'pending' ||
          order.status === 'confirmed'
        ));
        break;
      case 'completed':
        setFilteredOrders(orders.filter(order => 
          order.status === 'success' || 
          order.paymentStatus === 'success' ||
          order.status === 'completed'
        ));
        break;
      default:
        setFilteredOrders(orders);
    }
  }, [orders, filter]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openLocation = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const connectWithManager = (managerPhone: string, managerName: string) => {
    setConnectingManager(managerPhone);
    
    const userPhone = localStorage.getItem('nightfly_mobile') || 'customer';
    const message = `Hello ${managerName}, this is regarding my booking from NightFly. Order ID: ${Date.now().toString().slice(-8)}. Can you please assist me?`;
    
    const whatsappUrl = `https://wa.me/${managerPhone.replace('+', '')}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    
    // Show connecting status
    setTimeout(() => {
      setConnectingManager(null);
    }, 3000);
  };

  const ordersToDisplay = filter === 'all' ? orders : filteredOrders;

  return (
    <section className="card">
      <div className="topbar">
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 6 }}>Your Orders</h1>
          <p style={{ color: 'var(--muted)' }}>
            Track booking and payment status.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`button ${filter === 'all' ? '' : 'secondary'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`button ${filter === 'pending' ? '' : 'secondary'}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`button ${filter === 'completed' ? '' : 'secondary'}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button className="button" onClick={loadOrders}>
            Refresh
          </button>
        </div>
      </div>

      {status && <div className="notice">{status}</div>}

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        {ordersToDisplay.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px' }}>
            <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>
              No {filter === 'all' ? '' : filter} orders found.
            </p>
          </div>
        ) : (
          ordersToDisplay.map((order) => (
            <div key={order.id} className="card" style={{ position: 'relative' }}>
              {/* Club Image */}
              {order.club?.imageBase64 && (
                <div style={{ 
                  position: 'absolute', 
                  top: '20px', 
                  right: '20px',
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid var(--primary)'
                }}>
                  <img 
                    src={order.club.imageBase64} 
                    alt={order.club.name}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover'
                    }}
                  />
                </div>
              )}

              {/* Order Header */}
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', maxWidth: '70%' }}>
                  {order.club?.name || 'Club Booking'}
                </h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '0.8rem',
                    backgroundColor: order.status === 'success' || order.paymentStatus === 'success' 
                      ? 'var(--success)' 
                      : order.status === 'pending' || order.paymentStatus === 'pending'
                      ? 'var(--warning)'
                      : 'var(--error)',
                    color: 'white',
                    fontWeight: '500'
                  }}>
                    {order.status.toUpperCase()}
                  </span>
                  <button 
                    className="badge clickable-badge"
                    onClick={() => openLocation(order.club?.location)}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Click to view location"
                  >
                    📍 Location
                  </button>
                </div>
                <p style={{ color: 'var(--muted)', margin: '8px 0', fontSize: '0.9rem' }}>
                  {formatDate(order.createdAt)}
                </p>
              </div>

              {/* Order Details */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontWeight: '500' }}>Total Amount:</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    ₹{order.amount}
                  </span>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontWeight: '500', display: 'block', marginBottom: '8px' }}>Guests:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {order.items?.map((item, index) => (
                      <div 
                        key={`${item.name}-${index}`} 
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-light)',
                          fontSize: '0.85rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px'
                        }}
                      >
                        <span style={{ fontWeight: '500' }}>{item.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{item.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div style={{ 
                padding: '12px', 
                borderRadius: '8px', 
                backgroundColor: 'var(--bg-light)',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '500' }}>Payment Status:</span>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    backgroundColor: order.paymentStatus === 'success' 
                      ? 'var(--success)' 
                      : order.paymentStatus === 'pending'
                      ? 'var(--warning)'
                      : 'var(--error)',
                    color: 'white',
                    fontWeight: '500'
                  }}>
                    {order.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Manager Section */}
              {order.manager ? (
                <div style={{ 
                  padding: '16px', 
                  borderRadius: '8px', 
                  backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
                  border: '1px solid var(--primary)'
                }}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>👤 Your Manager:</span>
                      <span style={{ fontWeight: '500' }}>{order.manager.name}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '12px' }}>
                      Your dedicated manager will assist you throughout your experience.
                    </p>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <button 
                      className="button"
                      onClick={() => connectWithManager(order.manager!.phone, order.manager!.name)}
                      disabled={connectingManager === order.manager.phone}
                      style={{ 
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        backgroundColor: '#25D366',
                        borderColor: '#25D366'
                      }}
                    >
                      {connectingManager === order.manager.phone ? (
                        <>
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <span style={{ fontSize: '1.2rem' }}>💬</span>
                          <span>Connect via WhatsApp</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div style={{ 
                    padding: '10px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    border: '1px solid rgba(255, 193, 7, 0.3)'
                  }}>
                    <p style={{ 
                      fontSize: '0.8rem', 
                      color: 'var(--text)', 
                      margin: 0,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '6px'
                    }}>
                      <span style={{ fontSize: '0.9rem' }}>ℹ️</span>
                      <span>
                        <strong>Important:</strong> Please message your manager first. If they don't respond within 15-20 minutes, 
                        don't worry - we'll definitely connect you with an alternate manager to ensure your booking is handled.
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  backgroundColor: 'var(--bg-light)',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
                    {  (order.paymentStatus === 'initiated')
                      ? ` Manager will be assigned once payment is confirmed Wait for 1 hour to confirm you payment.`
                      : 'Manager details will be provided soon.'}
                  </p>
                </div>
              )}

              {/* Order Footer */}
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center' }}>
                  Order ID: {order.id}
                  {order.updatedAt && (
                    <div style={{ marginTop: '4px' }}>
                      Last updated: {formatDate(order.updatedAt)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}