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
  instagram: string;
  imageBase64: string;
  _id?: string;
  createdAt?: string;
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
  const [paymentVerificationId, setPaymentVerificationId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showThankYouMessage, setShowThankYouMessage] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [ageError, setAgeError] = useState('');
  const upiId = process.env.NEXT_PUBLIC_UPI_ID ?? 'nightfly@upi';

  useEffect(() => {
    // Set default date to today and time to 9 PM
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const defaultTime = '21:00'; // 9 PM
     const token = localStorage.getItem('nightfly_token');

    if (!token) {
      router.replace('/');
    }
    
    setSelectedDate(formattedDate);
    setSelectedTime(defaultTime);
  }, []);

  useEffect(() => {
    const loadClubs = async () => {
      try {
        const response = await fetch('/api/clubs');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setClubs(data);
          }
        }
      } catch (error) {
        // fallback to default clubs
        setClubs([]);
      }
    };
    loadClubs();
  }, []);

  // Always show all clubs when search is empty
  const filteredClubs = useMemo(() => {
    if (!search.trim()) {
      return clubs; // Return all clubs when search is empty
    }
    return clubs?.filter((club) =>
      club.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, clubs]);

  // Parse vibe string into array for chips
  const parseVibeChips = (vibeString: string) => {
    return vibeString.split(',').map(vibe => vibe.trim());
  };

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  const validateAge = (age: string): boolean => {
    const ageNum = parseInt(age, 10);
    return !isNaN(ageNum) && ageNum >= 18;
  };

  const addGuest = () => {
    if (!selectedOption || !guestName || !guestAge) {
      setAgeError('Please enter guest name and age.');
      return;
    }

    if (!validateAge(guestAge)) {
      setAgeError('Only 18+ age allowed. Please enter valid age (18 or above).');
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
    setAgeError('');
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
    if (!selectedClub || !selectedDate || !selectedTime) {
      setPaymentStatus('Please select date and time for booking.');
      return;
    }

    // Check all guests are 18+
    const underageGuests = cartItems.filter(item => !validateAge(item.age));
    if (underageGuests.length > 0) {
      setPaymentStatus('All guests must be 18+ years old. Please remove underage guests.');
      return;
    }

    const id = `order-${Date.now()}`;
    const mobile = localStorage.getItem('nightfly_mobile') ?? '';
    const orderData = {
      id,
      club: selectedClub,
      items: cartItems,
      amount: total,
      status: 'pending',
      paymentStatus: total > 0 ? 'initiated' : 'free-entry',
      manager: null,
      mobile,
      selectedDate,
      selectedTime,
      bookingDateTime: `${selectedDate} ${selectedTime}`,
      createdAt: new Date().toISOString()
    };

    // const existing = JSON.parse(
    //   localStorage.getItem('nightfly_orders') ?? '[]'
    // );
    // localStorage.setItem('nightfly_orders', JSON.stringify([orderData, ...existing]));
    await saveOrder(orderData);
   setShowThankYouMessage(true);
    // if (total > 0) {
    //   const response = await fetch('/api/payment/create', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       unique_id: id,
    //       amount: total.toString(),
    //       mobile
    //     })
    //   });
    //   const data = await response.json();
    //   if (data?.paymentLink) {
    //     setPaymentLink(data.paymentLink);
    //     setPaymentStatus('Payment link created. Complete payment and enter Verification ID.');
    //     window.open(data.paymentLink, '_blank');
    //   } else {
    //     setPaymentStatus('Unable to create payment link.');
    //   }
    // } else {
    //   setPaymentStatus('Free entry booking confirmed.');
    //   setShowThankYouMessage(true);
    // }
  };

  const handleVerifyPayment = async () => {
    if (!paymentVerificationId) {
      setPaymentStatus('Please enter 12-digit Payment Verification ID');
      return;
    }

    if (paymentVerificationId.length !== 12 || !/^\d+$/.test(paymentVerificationId)) {
      setPaymentStatus('Payment Verification ID must be exactly 12 digits');
      return;
    }

    setIsChecking(true);
    setPaymentStatus('Verifying payment...');
    
    // Simulate API call delay
    setTimeout(() => {
      setShowThankYouMessage(true);
      setPaymentStatus('');
      setIsChecking(false);
      
      // Update order status in localStorage
      updateOrderStatus('verified');
      
      // Clear cart and close modal after showing message
      setTimeout(() => {
        setCartItems([]);
        setSelectedClub(null);
        setPaymentVerificationId('');
        setShowThankYouMessage(false);
      }, 5000);
    }, 1500);
  };

  const updateOrderStatus = (status: string) => {
    const orders = JSON.parse(
      localStorage.getItem('nightfly_orders') ?? '[]'
    );
    if (!orders.length) return;
    orders[0].paymentStatus = status;
    localStorage.setItem('nightfly_orders', JSON.stringify(orders));
  };

  const openLocation = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openInstagram = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {filteredClubs?.map((club) => {
          const vibeChips = parseVibeChips(club.vibe);
          
          return (
            <div key={club.id} className="card club-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                {/* Circular Club Image */}
                {club.imageBase64 && (
                  <div style={{ 
                    width: '80px', 
                    height: '80px', 
                    minWidth: '80px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '3px solid var(--primary)'
                  }}>
                    <img 
                      src={club.imageBase64} 
                      alt={club.name}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                )}
                
                <div style={{ flex: 1 }}>
                  <div className="club-header" style={{ marginBottom: '8px' }}>
                    <div>
                      <h2 style={{ fontSize: '1.4rem', marginBottom: 4 }}>{club.name}</h2>
                    </div>
                    <span className="badge">{club.vibe.split(',')[0]}</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <button 
                      className="badge clickable-badge"
                      onClick={() => openLocation(club.location)}
                      style={{ cursor: 'pointer', fontSize: '0.85rem' }}
                      title="Click to view location"
                    >
                      📍 Location
                    </button>
                    <button 
                      className="badge clickable-badge"
                      onClick={() => openInstagram(club.instagram)}
                      style={{ cursor: 'pointer', fontSize: '0.85rem' }}
                      title="Click to view Instagram"
                    >
                      📷 Instagram
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="chip-row" style={{ marginBottom: '16px' }}>
                {vibeChips.map((vibe, index) => (
                  <span key={index} className="badge" style={{ fontSize: '0.8rem' }}>
                    {vibe}
                  </span>
                ))}
              </div>
              
              <button className="button" onClick={() => setSelectedClub(club)}>
                Book Slots
              </button>
            </div>
          );
        })}
      </div>

      {selectedClub && (
        <div className="modal-backdrop" onClick={() => setSelectedClub(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()} style={{ 
            maxWidth: '95vw',
            maxHeight: '90vh',
            width: '500px',
            overflow: 'auto'
          }}>
            <div className="modal-header" style={{ padding: '20px 24px' }}>
              <div style={{ maxWidth: 'calc(100% - 60px)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedClub.name}
                </h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button 
                    className="badge clickable-badge"
                    onClick={() => openLocation(selectedClub.location)}
                    style={{ cursor: 'pointer', fontSize: '0.85rem' }}
                    title="Click to view location"
                  >
                    📍 Location
                  </button>
                  <button 
                    className="badge clickable-badge"
                    onClick={() => openInstagram(selectedClub.instagram)}
                    style={{ cursor: 'pointer', fontSize: '0.85rem' }}
                    title="Click to view Instagram"
                  >
                    📷 Instagram
                  </button>
                </div>
              </div>
              <button 
                className="button ghost" 
                onClick={() => setSelectedClub(null)}
                style={{ padding: '8px', minWidth: 'auto' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '0 24px 24px', overflow: 'auto' }}>
              {showThankYouMessage ? (
                <div className="thank-you-message" style={{ padding: '20px 0' }}>
                  <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1.3rem' }}>
                    Thank You! We have received your order.
                  </h3>
                  <p style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
                    Your booking has been Recived for <strong>{selectedDate} at {selectedTime}</strong>. 
                    Time availability may vary depending on crowd. Our manager will connect with you and confirm the final timing.
                  </p>
                  <p style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
                    We will update you within 1-2 hours.
                  </p>
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Booking ID: ORDER-{Date.now().toString().slice(-8)}
                  </p>
                  <button 
                    className="button" 
                    style={{ width: '100%' }}
                    onClick={() => {
                      setSelectedClub(null);



                      setTimeout(() => {
                             setShowThankYouMessage(false);
                       router.push('/orders')
                      }, 3000);
                 
                    }}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 20 }}>
                  {/* Date and Time Selection */}
                  <div>
                    <h3 style={{ marginBottom: 12, fontSize: '1.1rem' }}>Select Date & Time</h3>
                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label className="label">Date</label>
                        <input
                          type="date"
                          className="input"
                          value={selectedDate}
                          onChange={(event) => setSelectedDate(event.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div>
                        <label className="label">Time</label>
                        <input
                          type="time"
                          className="input"
                          value={selectedTime}
                          onChange={(event) => setSelectedTime(event.target.value)}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                    <div style={{ 
                      marginTop: '8px', 
                      padding: '10px', 
                      borderRadius: '6px',
                      backgroundColor: 'rgba(255, 193, 7, 0.1)',
                      border: '1px solid rgba(255, 193, 7, 0.3)',
                      fontSize: '0.85rem'
                    }}>
                      <p style={{ color: 'var(--text)', margin: 0 }}>
                        <strong>Note:</strong> Time availability may vary depending on crowd. 
                        Our manager will connect with you and confirm the final timing.
                      </p>
                    </div>
                  </div>

                  {/* Booking Options */}
                  <div>
                    <h3 style={{ marginBottom: 12, fontSize: '1.1rem' }}>Select Type</h3>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                      {bookingOptions.map((option) => (
                        <button
                          key={option.type}
                          className={`button ${selectedOption?.type === option.type ? '' : 'secondary'}`}
                          onClick={() => setSelectedOption(option)}
                          style={{ padding: '12px 8px' }}
                        >
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{option.type}</div>
                          <div style={{ fontSize: '0.75rem' }}>{option.caption}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add Guest */}
                  <div>
                    <h3 style={{ marginBottom: 12, fontSize: '1.1rem' }}>Add Guest</h3>
                    <div className="grid guest-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                      <input
                        className="input"
                        placeholder="Guest name"
                        value={guestName}
                        onChange={(event) => setGuestName(event.target.value)}
                      />
                      <input
                        className="input"
                        placeholder="Age"
                        type="number"
                        min="18"
                        max="99"
                        value={guestAge}
                        onChange={(event) => setGuestAge(event.target.value)}
                      />
                    </div>
                    {ageError && (
                      <div style={{ 
                        marginTop: '8px', 
                        padding: '8px', 
                        borderRadius: '6px',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        border: '1px solid rgba(220, 53, 69, 0.3)'
                      }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--error)', margin: 0 }}>
                          ⚠️ {ageError}
                        </p>
                      </div>
                    )}
                    <div style={{ 
                      marginTop: '8px', 
                      padding: '8px', 
                      borderRadius: '6px',
                      backgroundColor: 'rgba(25, 135, 84, 0.1)',
                      border: '1px solid rgba(25, 135, 84, 0.3)'
                    }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--success)', margin: 0 }}>
                        ℹ️ Only 18+ age allowed. Please enter valid age (18 or above).
                      </p>
                    </div>
                    <button 
                      className="button secondary" 
                      onClick={addGuest}
                      style={{ width: '100%', marginTop: '12px' }}
                    >
                      Add Guest
                    </button>
                  </div>

                  {/* Cart */}
                  <div>
                    <h3 style={{ marginBottom: 12, fontSize: '1.1rem' }}>Cart</h3>
                    {cartItems.length === 0 ? (
                      <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px' }}>
                        No guests added yet.
                      </p>
                    ) : (
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {cartItems.map((item) => (
                          <div key={item.id} className="cart-row" style={{ 
                            padding: '12px', 
                            marginBottom: '8px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--bg-light)'
                          }}>
                            <div style={{ flex: 1 }}>
                              <strong style={{ fontSize: '0.95rem' }}>{item.name}</strong>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                                  Age: {item.age} • {item.type}
                                </span>
                                <span style={{ fontWeight: '500' }}>₹{item.price}</span>
                              </div>
                            </div>
                            <button 
                              className="button ghost" 
                              onClick={() => removeItem(item.id)}
                              style={{ marginLeft: '12px', padding: '4px 8px', fontSize: '0.8rem' }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="cart-row" style={{ 
                    borderTop: '1px solid var(--border)', 
                    paddingTop: '16px',
                    paddingBottom: '16px'
                  }}>
                    <strong style={{ fontSize: '1.1rem' }}>Total</strong>
                    <strong style={{ fontSize: '1.3rem', color: 'var(--primary)' }}>₹{total}</strong>
                  </div>

                  {paymentStatus && !showThankYouMessage && (
                    <div className={`notice ${paymentStatus.includes('Thank') ? 'success' : 'error'}`}>
                      {paymentStatus}
                    </div>
                  )}

                  {/* Checkout Button */}
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button 
                      className="button" 
                      onClick={checkout} 
                      disabled={!cartItems.length}
                      style={{ flex: 1 }}
                    >
                      Checkout
                    </button>
                    {/* {paymentLink && (
                      <button 
                        className="button ghost" 
                        onClick={() => window.open(paymentLink, '_blank')}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        Payment Link
                      </button>
                    )} */}
                  </div>

                  {/* Payment Verification (for paid orders) */}
                  {total > 0 && (
                    <div style={{ display: 'grid', gap: 12 }}>
                      <div className="notice" style={{ fontSize: '0.9rem' }}>
                        Pay to UPI ID: <strong>{upiId}</strong>
                      </div>
                      
                      <div>
                        <label className="label">12-digit Payment Verification ID</label>
                        <input
                          className="input"
                          placeholder="Enter 12-digit ID after payment"
                          value={paymentVerificationId}
                          onChange={(event) => setPaymentVerificationId(event.target.value)}
                          maxLength={12}
                          style={{ width: '100%' }}
                        />
                      </div>
{/*                       
                      <button
                        className="button secondary"
                        onClick={handleVerifyPayment}
                        disabled={!paymentVerificationId || isChecking}
                        style={{ width: '100%' }}
                      >
                        {isChecking ? 'Verifying...' : 'Verify Payment'}
                      </button> */}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}