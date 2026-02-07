'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type BookingOption = {
  type: string;
  price: number;
  caption: string;
};

type CartItem = {
  id: string;
  type: string;
  price: number;
  name: string;
  age: string;
};

type Club = {
  id: string;
  name: string;
  location: string;
  vibe: string;
};

const bookingOptions: BookingOption[] = [
  { type: 'Single Girls', price: 0, caption: 'Girls (Free)' },
  { type: 'Boys', price: 1000, caption: 'Boys - ₹1000 (Redeemable coupon)' },
  { type: 'Couples', price: 0, caption: 'Couple (Free)' }
];

export default function ClubsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedOption, setSelectedOption] = useState<BookingOption | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestAge, setGuestAge] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
  const [utr, setUtr] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const upiId = process.env.NEXT_PUBLIC_UPI_ID ?? '';

  useEffect(() => {
    const loadClubs = async () => {
      try {
        const response = await fetch('/api/clubs');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setClubs(data);
          }
        }
      } catch (error) {
        // ignore
      }
    };
    loadClubs();
  }, []);

  const filteredClubs = useMemo(() => {
    return clubs.filter((club) =>
      club.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  const addGuest = () => {
    if (!selectedOption || !guestName || !guestAge) {
      return;
    }

    const newItem: CartItem = {
      id: `${selectedOption.type}-${Date.now()}`,
      type: selectedOption.type,
      price: selectedOption.price,
      name: guestName,
      age: guestAge
    };

    setCartItems((items) => [...items, newItem]);
    setGuestName('');
    setGuestAge('');
  };

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const saveOrder = async (order: Record<string, unknown>) => {
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
    } catch (error) {
      // silent fallback
    }
  };

  const checkout = async () => {
    if (!selectedClub) {
      return;
    }

    const id = `order-${Date.now()}`;
    const mobile = localStorage.getItem('nightfly_mobile') ?? '';
    const order = {
      id,
      club: selectedClub,
      items: cartItems,
      amount: total,
      status: 'pending',
      paymentStatus: total > 0 ? 'initiated' : 'free-entry',
      manager: null,
      mobile
    };

    await saveOrder(order);
    setActiveOrderId(id);

    if (total > 0) {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unique_id: id,
          amount: total.toString(),
          mobile
        })
      });
      const data = await response.json();
      if (data?.paymentLink) {
        setPaymentLink(data.paymentLink);
        setPaymentStatus('Payment link created. Complete payment and enter UTR.');
        window.open(data.paymentLink, '_blank');
      } else {
        setPaymentStatus('Unable to create payment link.');
      }
    } else {
      setPaymentStatus('Free entry booking confirmed.');
    }
  };

  const startPaymentCheck = async () => {
    if (!utr || !selectedClub) {
      return;
    }

    setIsChecking(true);
    setPaymentStatus('Checking payment status...');
    router.push('/payment/pending');
    const id = `utr-${Date.now()}`;
    const mobile = localStorage.getItem('nightfly_mobile') ?? '';
    let elapsed = 0;

    const interval = setInterval(async () => {
      elapsed += 10;
      try {
        const response = await fetch('/api/payment/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            unique_id: id,
            utr_number: utr,
            mobile
          })
        });
        const data = await response.json();
        if (data?.status === 'success') {
          setPaymentStatus('Payment captured successfully.');
          updateOrderStatus('success');
          clearInterval(interval);
          setIsChecking(false);
        }
      } catch (error) {
        setPaymentStatus('Unable to verify payment.');
      }

      if (elapsed >= 60) {
        setPaymentStatus('Payment pending. Please refresh later.');
        updateOrderStatus('pending');
        clearInterval(interval);
        setIsChecking(false);
      }
    }, 10000);
  };

  const updateOrderStatus = async (status: string) => {
    if (!activeOrderId) return;
    await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: activeOrderId, paymentStatus: status })
    });
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: 6 }}>
            Clubs Near You
          </h1>
          <p style={{ color: 'var(--muted)' }}>
            Discover the hottest venues and book your slot.
          </p>
        </div>
        <div className="topbar-right">
          <input
            className="input search"
            placeholder="Search clubs"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="menu">
            <button className="button ghost" onClick={() => router.push('/orders')}>
              Orders
            </button>
            <button className="button ghost" onClick={() => router.push('/profile')}>
              Profile
            </button>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {filteredClubs.map((club) => (
          <div key={club.id} className="card club-card">
            <div className="club-header">
              <div>
                <h2 style={{ fontSize: '1.4rem', marginBottom: 4 }}>{club.name}</h2>
                <p style={{ color: 'var(--muted)' }}>{club.location}</p>
              </div>
              <span className="badge">{club.vibe}</span>
            </div>
            <div className="chip-row">
              <span className="badge">Live DJ</span>
              <span className="badge">VIP Tables</span>
              <span className="badge">Late Night</span>
            </div>
            <button className="button" onClick={() => setSelectedClub(club)}>
              Book Slots
            </button>
          </div>
        ))}
      </div>

      {selectedClub && (
        <div className="modal-backdrop" onClick={() => setSelectedClub(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: '1.5rem' }}>{selectedClub.name}</h2>
                <p style={{ color: 'var(--muted)' }}>{selectedClub.location}</p>
              </div>
              <button className="button ghost" onClick={() => setSelectedClub(null)}>
                Close
              </button>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                {bookingOptions.map((option) => (
                  <button
                    key={option.type}
                    className={`button ${selectedOption?.type === option.type ? '' : 'secondary'}`}
                    onClick={() => setSelectedOption(option)}
                  >
                    <div style={{ fontWeight: 700 }}>{option.type}</div>
                    <div style={{ fontSize: '0.8rem' }}>{option.caption}</div>
                  </button>
                ))}
              </div>

              <div className="grid guest-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
                <input
                  className="input"
                  placeholder="Guest name"
                  value={guestName}
                  onChange={(event) => setGuestName(event.target.value)}
                />
                <input
                  className="input"
                  placeholder="Age"
                  value={guestAge}
                  onChange={(event) => setGuestAge(event.target.value)}
                />
              </div>
              <button className="button secondary" onClick={addGuest}>
                Add Guest
              </button>

              <div>
                <h3 style={{ marginBottom: 12 }}>Cart</h3>
                {cartItems.length === 0 ? (
                  <p style={{ color: 'var(--muted)' }}>No guests added yet.</p>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="cart-row">
                      <div>
                        <strong>{item.name}</strong> ({item.age}) - {item.type}
                      </div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span>₹{item.price}</span>
                        <button className="button ghost" onClick={() => removeItem(item.id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="cart-row">
                <strong>Total</strong>
                <strong>₹{total}</strong>
              </div>

              {paymentStatus && <div className="notice">{paymentStatus}</div>}

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="button" onClick={checkout} disabled={!cartItems.length}>
                  Checkout
                </button>
                {paymentLink && (
                  <button className="button ghost" onClick={() => window.open(paymentLink, '_blank')}>
                    Open Payment Link
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                {upiId && (
                  <div className="notice">
                    Pay using UPI ID: <strong>{upiId}</strong>
                  </div>
                )}
                <label className="label">Enter UTR to verify payment</label>
                <input
                  className="input"
                  placeholder="UTR Number"
                  value={utr}
                  onChange={(event) => setUtr(event.target.value)}
                />
                <button
                  className="button secondary"
                  onClick={startPaymentCheck}
                  disabled={!utr || isChecking}
                >
                  {isChecking ? 'Checking...' : 'Verify Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
