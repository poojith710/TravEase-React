import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { read, save, money, services, types, bookings, seatKey, registerAccount, authenticateAccount } from './store.js';
const icons = { train: '🚆', flight: '✈️', bus: '🚌', hotel: '🏨' };
const formValues = e => Object.fromEntries(new FormData(e.currentTarget));

function Brand() {
  return <Link className="brand" to="/"><span>✈</span> Trav<span>Ease</span></Link>;
}

function Header({ user, onLogout, admin = false, short = false }) {
  return <header className="topbar">
    <Brand />
    <nav>
      <Link to="/">
        {admin ? 'User Site' : 'Home'}
      </Link>
      <Link to="/bookings">
        {admin ? 'Bookings' : 'My Bookings'}
      </Link>
      {!admin && !short && <Link to="/admin">Admin</Link>}
    </nav>
    {admin ? <div className="admin-badge">ADMIN</div> : !short && <div className="nav-user">
      {user ? <>Hi, {user.name || 'Traveller'} · <button className="text-button" onClick={onLogout}>Logout</button></> : <Link to="/login">Login</Link>}
    </div>}
  </header>;
}

function Field({ label, children, wide = false }) {
  return <label className={'field' + (wide ? ' full-field' : '')}>
    <span className="field-label">
      {label}
    </span>
    {children}
  </label>;
}

function Steps({ current }) {
  return <div className="steps">
    {['Search', 'Seats', 'Passenger', 'Payment'].map((x, i) => <b key={x} className={current === i + 1 ? 'current' : ''}>{i + 1} {x}</b>)}
  </div>;
}

function Home() {
  const nav = useNavigate();
  const [type, setType] = useState(localStorage.getItem('searchType') || 'train');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = tomorrow.toISOString().slice(0, 10);
  function submit(e) {
    e.preventDefault();
    const values = formValues(e);
    localStorage.setItem('searchType', type);
    save('searchData', { ...values, from: from.trim(), to: type === 'hotel' ? '' : to.trim() });
    nav('/results');
  }
  return <>
    <main>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">SMART • SIMPLE • SEAMLESS</p>
          <h1>Travel made <span>easy.</span></h1>
          <p>Search and book trains, flights, buses and hotels from one place.</p>
        </div>
        <div className="search-card">
          <div className="travel-tabs">
            {Object.entries(types).map(([key, label]) => <button key={key} className={'tab ' + (type === key ? 'active' : '')} onClick={() => setType(key)}>{icons[key]} {label}</button>)}
          </div>
          <form id="searchForm" onSubmit={submit}>
            <Field label={type === 'hotel' ? 'CITY' : 'FROM'}>
              <input name="from" value={from} onChange={e => setFrom(e.target.value)} required placeholder={type === 'hotel' ? 'Enter city' : 'City or station'} />
            </Field>
            <button type="button" className="swap text-button" aria-label="Swap cities" onClick={() => {
              setFrom(to);
              setTo(from);
            }} style={{ visibility: type === 'hotel' ? 'hidden' : 'visible' }}>⇄</button>
            <div style={{ visibility: type === 'hotel' ? 'hidden' : 'visible' }}>
              <Field label="TO">
                <input name="to" value={to} onChange={e => setTo(e.target.value)} required={type !== 'hotel'} placeholder="City or station" />
              </Field>
            </div>
            <Field label={type === 'hotel' ? 'CHECK-IN' : 'DATE'}>
              <input name="date" type="date" defaultValue={date} required />
            </Field>
            <Field label="TRAVELLERS">
              <select name="travellers">
                {[1, 2, 3, 4, 5, 6].map(n => <option key={n}>
                  {n}
                </option>)}
              </select>
            </Field>
            <button className="primary search-btn">Search</button>
          </form>
        </div>
      </section>
      <section className="quick">
        {[['🛡️ Secure payments', 'Protected checkout'], ['⚡ Instant confirmation', 'Get tickets instantly'], ['💰 Easy booking', 'Simple fare comparison'], ['📱 One platform', 'All your trips together']].map(([a, b]) => <div key={a}>
          <b>
            {a}
          </b>
          <span>
            {b}
          </span>
        </div>)}
      </section>
      <section className="features">
        <div>
          <p className="eyebrow">EXPLORE</p>
          <h2>Everything you need to travel</h2>
          <div className="feature-grid">
            {[['train', 'Train Booking', 'Search routes, compare trains and choose your seats.'], ['flight', 'Flight Booking', 'Find convenient flights and book in a few clicks.'], ['bus', 'Bus Booking', 'Choose operators, boarding points and seats.'], ['hotel', 'Hotel Booking', 'Discover stays for every type of trip.']].map(([k, t, d]) => <div className="feature" key={k}>
              <span>
                {icons[k]}
              </span>
              <h3>
                {t}
              </h3>
              <p>
                {d}
              </p>
            </div>)}
          </div>
        </div>
      </section>
    </main>
    <footer>© 2026 TravEase · Travel made easy.</footer>
  </>;
}

function Results() {
  const nav = useNavigate();
  const type = localStorage.getItem('searchType') || 'train', d = read('searchData', {});
  let list = services().filter(s => s.type === type);
  for (const key of ['from', 'to']) {
    if (d[key] && (key !== 'to' || type !== 'hotel')) {
      const t = d[key].toLowerCase();
      const exact = list.filter(x => [x.from, x.to].some(v => v.toLowerCase().includes(t)));
      if (exact.length)
        list = exact;
    }
  }
  return <main className="page">
    <div className="result-head">
      <div>
        <p className="eyebrow">SEARCH RESULTS</p>
        <h1>{list.length} {types[type]} available</h1>
        <p>{d.from}{type !== 'hotel' ? ' → ' + (d.to || '') : ''} · {d.date} · {d.travellers || 1} traveller(s)</p>
      </div>
      <Link className="outline" to="/">← Modify Search</Link>
    </div>
    <div className="results">
      {list.length ? list.map(s => <div className="result-card" key={s.id}>
        <div>
          <span className="tag">
            {s.type.toUpperCase()}
          </span>
          <h3>
            {s.name}
          </h3>
          <p>
            {s.operator}
          </p>
        </div>
        <div>
          <b>
            {s.time}
          </b>
          <p>{s.from} → {s.to}</p>
          <p>
            {s.duration}
          </p>
        </div>
        <div>
          <p>Available</p>
          <b className="price">
            {money(s.price)}
          </b>
          <p>{s.seats} seats</p>
        </div>
        <button className="primary" onClick={() => {
          save('selectedService', s);
          save('selectedSeats', []);
          nav('/seats');
        }}>Select</button>
      </div>) : <div className="panel">
        <h2>No options found</h2>
        <p>Try another route or city.</p>
      </div>}
    </div>
  </main>;
}

function Trip({ s, seats, passenger }) {
  return <>
    <p>
      <b>
        {s.name}
      </b>
    </p>
    <p>{s.from} → {s.to}</p>
    {passenger && <p>Passenger: {passenger.name}</p>}
    {seats && <p>Seats: {seats.join(', ')}</p>}
  </>;
}

function Total({ amount, label = 'Total' }) {
  return <div className="total-row">
    <b>
      {label}
    </b>
    <b>
      {money(amount)}
    </b>
  </div>;
}

function Seats() {
  const nav = useNavigate(), s = read('selectedService');
  const [selected, setSelected] = useState([]);
  if (!s)
    return <Navigate to="/" replace />;
  const booked = read(seatKey(s), []), limit = Number(read('searchData', {}).travellers || 1);
  return <main className="page">
    <div>
      <p className="eyebrow">{s.type.toUpperCase()} BOOKING</p>
      <h1>
        {s.name}
      </h1>
      <p className="muted">{s.from} → {s.to} · {s.time}</p>
    </div>
    <div className="booking-layout">
      <section className="panel">
        <h2>Select your seats</h2>
        <div className="legend">
          <span>Available</span>
          <span>Selected</span>
          <span>Booked</span>
        </div>
        <div className="seat-grid">
          {Array.from({ length: Math.max(32, s.seats) }, (_, i) => i + 1).map(n => <button key={n} className={'seat ' + (booked.includes(n) ? 'booked' : selected.includes(n) ? 'selected' : '')} disabled={booked.includes(n)} onClick={() => setSelected(a => a.includes(n) ? a.filter(x => x !== n) : a.length < limit ? [...a, n] : a)}>
            {n}
          </button>)}
        </div>
      </section>
      <aside className="summary">
        <h2>Trip summary</h2>
        <Trip s={s} />
        <p>{money(s.price)} / traveller</p>
        <Total amount={s.price * selected.length} />
        <button className="primary full" onClick={() => {
          if (!selected.length)
            return alert('Please select at least one seat.');
          save('selectedSeats', selected);
          nav('/passenger');
        }}>Continue</button>
      </aside>
    </div>
  </main>;
}

function Passenger() {
  const nav = useNavigate(), s = read('selectedService'), seats = read('selectedSeats', []);
  if (!s || !seats.length)
    return <Navigate to="/" replace />;
  return <main className="page">
    <Steps current={3} />
    <div className="booking-layout">
      <section className="panel">
        <h1>Passenger details</h1>
        <p className="muted">Enter details exactly as they should appear on the ticket.</p>
        <form className="form-grid" onSubmit={e => {
          e.preventDefault();
          save('passenger', formValues(e));
          nav('/payment');
        }}>
          <Field label="FULL NAME">
            <input name="name" required />
          </Field>
          <Field label="AGE">
            <input name="age" type="number" min="1" max="120" required />
          </Field>
          <Field label="GENDER">
            <select name="gender" required>
              <option value="">Select</option>
              {['Male', 'Female', 'Other'].map(v => <option key={v}>
                {v}
              </option>)}
            </select>
          </Field>
          <Field label="MOBILE">
            <input name="mobile" pattern="[0-9]{10}" required placeholder="10 digit number" />
          </Field>
          <Field label="EMAIL" wide>
            <input name="email" type="email" required />
          </Field>
          <button className="primary full-field">Proceed to Payment</button>
        </form>
      </section>
      <aside className="summary">
        <h2>Booking summary</h2>
        <Trip s={s} seats={seats} />
        <Total amount={s.price * seats.length} />
      </aside>
    </div>
  </main>;
}

function Payment() {
  const nav = useNavigate(), s = read('selectedService'), seats = read('selectedSeats', []), p = read('passenger');
  const [method, setMethod] = useState('upi');
  if (!s || !p || !seats.length)
    return <Navigate to="/" replace />;
  const total = s.price * seats.length;
  function pay(e) {
    e.preventDefault();
    const old = read(seatKey(s), []);
    if (seats.some(n => old.includes(n))) {
      alert('A selected seat is already booked. Choose again.');
      nav('/seats');
      return;
    }
    const b = { id: 'TRV' + Date.now().toString().slice(-8), service: s, seats, passenger: p, total, status: 'Confirmed', date: new Date().toLocaleDateString('en-IN'), travelDate: read('searchData', {}).date };
    save('travease_bookings', [b, ...bookings()]);
    save(seatKey(s), [...old, ...seats]);
    save('lastBooking', b);
    nav('/confirmation');
  }
  return <main className="page">
    <Steps current={4} />
    <div className="booking-layout">
      <section className="panel">
        <h1>Payment</h1>
        <p className="muted">Demo payment only — do not enter real payment details.</p>
        <div className="pay-tabs">
          {[['upi', 'UPI'], ['card', 'Card'], ['net', 'Net Banking']].map(([k, l]) => <button key={k} className={'paytab ' + (method === k ? 'active' : '')} onClick={() => setMethod(k)}>
            {l}
          </button>)}
        </div>
        <form onSubmit={pay}>
          <div className="payment-box">
            {method === 'upi' ? <>
              <label>UPI ID</label>
              <input placeholder="name@upi" />
            </> : method === 'card' ? <div className="form-grid">
              <Field label="CARD NUMBER" wide>
                <input maxLength={19} placeholder="1234 5678 9012 3456" />
              </Field>
              <Field label="EXPIRY">
                <input placeholder="MM/YY" />
              </Field>
              <Field label="CVV">
                <input maxLength={3} type="password" />
              </Field>
            </div> : <>
              <label>BANK</label>
              <select>
                {['Select bank', 'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'].map(x => <option key={x}>
                  {x}
                </option>)}
              </select>
            </>}
          </div>
          <button className="primary full">Pay &amp; Confirm Booking</button>
        </form>
      </section>
      <aside className="summary">
        <h2>Fare summary</h2>
        <Trip s={s} seats={seats} passenger={p} />
        <Total amount={total} label="Payable" />
      </aside>
    </div>
  </main>;
}

function Confirmation() {
  const b = read('lastBooking');
  if (!b)
    return <Navigate to="/bookings" replace />;
  return <main className="page center">
    <div className="ticket-card">
      <div className="success">✓</div>
      <p className="eyebrow">BOOKING CONFIRMED</p>
      <h1>Your trip is booked!</h1>
      <p className="muted">Booking ID: <b>
        {b.id}
      </b></p>
      <div className="ticket-info">
        {[['Journey', b.service.from + ' → ' + b.service.to], ['Service', b.service.name], ['Passenger', b.passenger.name], ['Seats', b.seats.join(', ')], ['Travel date', b.travelDate || '—'], ['Amount paid', money(b.total)]].map(([k, v]) => <div key={k}>
          <span>
            {k}
          </span>
          <b>
            {v}
          </b>
        </div>)}
      </div>
      <Link className="primary" to="/bookings">View My Bookings</Link>
      {' '}
      <button className="outline" onClick={() => window.print()}>Print Ticket</button>
    </div>
  </main>;
}

function Bookings() {
  const [list, setList] = useState(bookings);
  function cancel(b) {
    if (!confirm('Cancel this booking?'))
      return;
    const next = list.filter(x => x.id !== b.id);
    save('travease_bookings', next);
    save(seatKey(b.service), read(seatKey(b.service), []).filter(x => !b.seats.includes(x)));
    setList(next);
  }
  return <main className="page">
    <p className="eyebrow">YOUR TRIPS</p>
    <h1>My Bookings</h1>
    <div className="booking-list">
      {list.length ? list.map(b => <div className="booking-item" key={b.id}>
        <div className="row">
          <div>
            <span className="tag">
              {b.service.type.toUpperCase()}
            </span>
            <h2>
              {b.service.name}
            </h2>
            <p className="muted">{b.service.from} → {b.service.to} · {b.travelDate}</p>
          </div>
          <span className="status">
            {b.status}
          </span>
        </div>
        <div className="row">
          <p>Booking ID: <b>
            {b.id}
          </b> · Seats: <b>
              {b.seats.join(', ')}
            </b></p>
          <b>
            {money(b.total)}
          </b>
        </div>
        <div className="booking-actions">
          <button className="danger" onClick={() => cancel(b)}>Cancel booking</button>
        </div>
      </div>) : <div className="panel">
        <h2>No bookings yet</h2>
        <p className="muted">Your confirmed trips will appear here.</p>
        <Link className="primary" to="/">Book a trip</Link>
      </div>}
    </div>
  </main>;
}

function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  async function submit(e) {
    e.preventDefault();
    if (busy)
      return;
    const values = formValues(e);
    setBusy(true);
    try {
      const user = mode === 'signup' ? await registerAccount(values) : await authenticateAccount(values.id, values.pass);
      onLogin(user);
      if (mode === 'login')
        alert('Login successful! Welcome back, ' + user.name + '!');
      nav(user.role === 'admin' ? '/admin' : '/');
    }
    catch (error) {
      alert(error.message || 'Unable to continue. Please try again.');
    }
    finally {
      setBusy(false);
    }
  }
  return <div className="auth">
    <div className="auth-brand">
      <Brand />
      <h1>
        {mode === 'signup' ? 'Create your account' : 'Welcome back'}
      </h1>
      <p>Login to manage your journeys.</p>
    </div>
    <div className="auth-card">
      <div className="auth-tabs">
        {['login', 'signup'].map(x => <button key={x} disabled={busy} className={mode === x ? 'active' : ''} onClick={() => setMode(x)}>
          {x === 'login' ? 'Login' : 'Sign Up'}
        </button>)}
      </div>
      <form onSubmit={submit}>
        {mode === 'signup' && <Field label="NAME">
          <input name="name" required />
        </Field>}
        <Field label="MOBILE OR EMAIL">
          <input name="id" required />
        </Field>
        <Field label="PASSWORD">
          <input name="pass" type="password" required />
        </Field>
        <button className="primary full" disabled={busy}>
          {busy ? 'Please wait…' : 'Continue'}
        </button>
        <p className="hint">
          {mode === 'login' ? 'Demo user: user@travease.com / 1234' : 'Create a local demo account. Use a test password.'}
        </p>
        <p className="hint">Admin: admin / admin123</p>
      </form>
    </div>
  </div>;
}

function Admin({ user, onLogout }) {
  const [type, setType] = useState('train'), [all, setAll] = useState(services), [modal, setModal] = useState(false);
  if (user?.role !== 'admin')
    return <Navigate to="/login" replace />;
  const bs = bookings();
  function update(next) {
    save('travease_services', next);
    setAll(next);
  }
  function add(e) {
    e.preventDefault();
    const v = formValues(e);
    update([...all, { id: type[0].toUpperCase() + Date.now(), type, name: v.name, from: v.route, to: v.route, time: v.time, duration: '—', price: Number(v.price), seats: Number(v.seats), operator: 'TravEase Admin' }]);
    setModal(false);
  }
  return <>
    <main className="page">
      <div className="result-head">
        <div>
          <p className="eyebrow">ADMIN MODULE</p>
          <h1>Dashboard</h1>
          <p>Manage travel inventory and bookings.</p>
        </div>
        <button className="outline" onClick={onLogout}>Logout</button>
      </div>
      <div className="stats">
        {[['Services', all.length], ['Bookings', bs.length], ['Users', 'Local'], ['Revenue', money(bs.reduce((a, b) => a + b.total, 0))]].map(([k, v]) => <div className="stat" key={k}>
          <b>
            {v}
          </b>
          <span>
            {k}
          </span>
        </div>)}
      </div>
      <div className="admin-grid">
        <section className="panel">
          <div className="section-head">
            <h2>Manage services</h2>
            <button className="primary small-btn" onClick={() => setModal(true)}>+ Add</button>
          </div>
          <div className="admin-tabs">
            {Object.entries(types).map(([k, l]) => <button key={k} className={type === k ? 'active' : ''} onClick={() => setType(k)}>
              {l}
            </button>)}
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {['NAME', 'ROUTE', 'PRICE', 'SEATS', 'ACTION'].map(x => <th key={x}>
                    {x}
                  </th>)}
                </tr>
              </thead>
              <tbody>
                {all.filter(s => s.type === type).map(s => <tr key={s.id}>
                  <td>
                    <b>
                      {s.name}
                    </b>
                    <br />
                    <small>
                      {s.operator}
                    </small>
                  </td>
                  <td>{s.from} → {s.to}</td>
                  <td>
                    {money(s.price)}
                  </td>
                  <td>
                    {s.seats}
                  </td>
                  <td>
                    <button className="danger" onClick={() => update(all.filter(x => x.id !== s.id))}>Delete</button>
                  </td>
                </tr>)}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel">
          <h2>Recent bookings</h2>
          {bs.length ? bs.slice(0, 8).map(b => <div key={b.id} style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}><b>
            {b.id}
          </b> · {b.service.name}<br /><small>{b.passenger.name} · {money(b.total)}</small></div>) : <p className="muted">No bookings yet.</p>}
        </section>
      </div>
    </main>
    {modal && <div className="modal">
      <div className="modal-card">
        <button className="close" onClick={() => setModal(false)}>×</button>
        <h2>Add service</h2>
        <form className="form-grid" onSubmit={add}>
          <Field label="NAME">
            <input name="name" required />
          </Field>
          <Field label="ROUTE / LOCATION">
            <input name="route" required />
          </Field>
          <Field label="TIME">
            <input name="time" required placeholder="06:00 AM" />
          </Field>
          <Field label="PRICE">
            <input name="price" type="number" min="0" required />
          </Field>
          <Field label="SEATS">
            <input name="seats" type="number" min="1" defaultValue="30" required />
          </Field>
          <button className="primary full-field">Add Service</button>
        </form>
      </div>
    </div>}
  </>;
}

export default function App() {
  const [user, setUser] = useState(() => read('travease_user'));
  const nav = useNavigate(), { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  function login(u) {
    save('travease_user', u);
    setUser(u);
  }
  function logout() {
    localStorage.removeItem('travease_user');
    setUser(null);
    nav('/');
  }
  return <>
    {pathname !== '/login' && <Header user={user} onLogout={logout} admin={pathname === '/admin'} short={['/passenger', '/payment', '/confirmation'].includes(pathname)} />}
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/results" element={<Results />} />
      <Route path="/seats" element={<Seats />} />
      <Route path="/passenger" element={<Passenger />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/confirmation" element={<Confirmation />} />
      <Route path="/bookings" element={<Bookings />} />
      <Route path="/login" element={<Login onLogin={login} />} />
      <Route path="/admin" element={<Admin user={user} onLogout={logout} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>;
}
