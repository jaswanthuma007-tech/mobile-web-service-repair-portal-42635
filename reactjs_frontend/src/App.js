import React, { useMemo, useState } from 'react';
import './App.css';
import { theme } from './theme';
import { adminLogin, listRepairs, submitRepairRequest } from './api';

// PUBLIC_INTERFACE
function App() {
  const [activeTab, setActiveTab] = useState('customer'); // 'customer' | 'admin'
  const [toast, setToast] = useState(null);

  // Customer form state
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    device_type: '',
    issue_description: '',
    preferred_contact_method: 'phone',
  });
  const [customerSubmitting, setCustomerSubmitting] = useState(false);

  // Admin state
  const [admin, setAdmin] = useState({ username: '', password: '' });
  const [adminToken, setAdminToken] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [repairs, setRepairs] = useState([]);

  const pageStyle = useMemo(
    () => ({
      background: theme.gradient,
      minHeight: '100vh',
      color: theme.colors.text,
    }),
    []
  );

  const showToast = (type, message) => {
    setToast({ type, message });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 3500);
  };

  const handleCustomerSubmit = async e => {
    e.preventDefault();
    setCustomerSubmitting(true);
    try {
      await submitRepairRequest({
        ...customer,
        email: customer.email?.trim() ? customer.email.trim() : null,
      });
      showToast('success', 'Request submitted. We will contact you shortly.');
      setCustomer({
        name: '',
        phone: '',
        email: '',
        device_type: '',
        issue_description: '',
        preferred_contact_method: 'phone',
      });
    } catch (err) {
      showToast('error', err.message || 'Submission failed.');
    } finally {
      setCustomerSubmitting(false);
    }
  };

  const handleAdminLogin = async e => {
    e.preventDefault();
    setAdminLoading(true);
    try {
      const res = await adminLogin(admin.username, admin.password);
      setAdminToken(res.token);
      showToast('success', 'Logged in.');
      // Load repairs after login
      const rows = await listRepairs(res.token);
      setRepairs(rows);
    } catch (err) {
      showToast('error', err.message || 'Login failed.');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleRefreshRepairs = async () => {
    if (!adminToken) return;
    setAdminLoading(true);
    try {
      const rows = await listRepairs(adminToken);
      setRepairs(rows);
    } catch (err) {
      showToast('error', err.message || 'Failed to refresh.');
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="Portal" style={pageStyle}>
      <nav className="TopNav" aria-label="Primary">
        <div className="Brand">
          <div className="BrandMark" aria-hidden="true" />
          <div className="BrandText">
            <div className="BrandTitle">Mobile Web Service Repair</div>
            <div className="BrandSub">Fast, professional device repair</div>
          </div>
        </div>

        <div className="NavTabs" role="tablist" aria-label="Sections">
          <button
            className={`Tab ${activeTab === 'customer' ? 'active' : ''}`}
            onClick={() => setActiveTab('customer')}
            role="tab"
            aria-selected={activeTab === 'customer'}
          >
            Repair Request
          </button>
          <button
            className={`Tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
            role="tab"
            aria-selected={activeTab === 'admin'}
          >
            Admin
          </button>
        </div>
      </nav>

      <main className="Main" role="main">
        {toast && (
          <div className={`Toast ${toast.type}`} role="status" aria-live="polite">
            {toast.message}
          </div>
        )}

        {activeTab === 'customer' ? (
          <section className="Card AnimatedCard" aria-label="Customer repair request form">
            <header className="CardHeader">
              <h1 className="H1">Submit a Repair Request</h1>
              <p className="Subtext">
                Tell us about your device and the issue. We’ll reply quickly with next steps.
              </p>
            </header>

            <form className="Form" onSubmit={handleCustomerSubmit}>
              <div className="Grid2">
                <label className="Field">
                  <span className="Label">Full name</span>
                  <input
                    className="Input"
                    value={customer.name}
                    onChange={e => setCustomer({ ...customer, name: e.target.value })}
                    required
                    placeholder="Jane Doe"
                  />
                </label>

                <label className="Field">
                  <span className="Label">Phone</span>
                  <input
                    className="Input"
                    value={customer.phone}
                    onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                    required
                    placeholder="(555) 123-4567"
                  />
                </label>
              </div>

              <div className="Grid2">
                <label className="Field">
                  <span className="Label">Email (optional)</span>
                  <input
                    className="Input"
                    value={customer.email}
                    onChange={e => setCustomer({ ...customer, email: e.target.value })}
                    type="email"
                    placeholder="jane@example.com"
                  />
                </label>

                <label className="Field">
                  <span className="Label">Preferred contact</span>
                  <select
                    className="Input"
                    value={customer.preferred_contact_method}
                    onChange={e =>
                      setCustomer({ ...customer, preferred_contact_method: e.target.value })
                    }
                  >
                    <option value="phone">Phone</option>
                    <option value="sms">SMS</option>
                    <option value="email">Email</option>
                  </select>
                </label>
              </div>

              <label className="Field">
                <span className="Label">Device type</span>
                <input
                  className="Input"
                  value={customer.device_type}
                  onChange={e => setCustomer({ ...customer, device_type: e.target.value })}
                  required
                  placeholder="iPhone 13, Samsung S22, MacBook Pro, etc."
                />
              </label>

              <label className="Field">
                <span className="Label">Issue description</span>
                <textarea
                  className="Input Textarea"
                  value={customer.issue_description}
                  onChange={e => setCustomer({ ...customer, issue_description: e.target.value })}
                  required
                  placeholder="Describe the problem, any error messages, and when it started."
                />
              </label>

              <div className="FormActions">
                <button className="Button Primary" type="submit" disabled={customerSubmitting}>
                  {customerSubmitting ? 'Submitting…' : 'Submit Request'}
                </button>
                <div className="Hint">
                  By submitting, you agree to be contacted about your repair request.
                </div>
              </div>
            </form>
          </section>
        ) : (
          <section className="Card" aria-label="Admin area">
            <header className="CardHeader">
              <h1 className="H1">Admin</h1>
              <p className="Subtext">Login to view submitted repair requests.</p>
            </header>

            {!adminToken ? (
              <form className="Form" onSubmit={handleAdminLogin}>
                <div className="Grid2">
                  <label className="Field">
                    <span className="Label">Username</span>
                    <input
                      className="Input"
                      value={admin.username}
                      onChange={e => setAdmin({ ...admin, username: e.target.value })}
                      required
                      placeholder="admin"
                      autoComplete="username"
                    />
                  </label>

                  <label className="Field">
                    <span className="Label">Password</span>
                    <input
                      className="Input"
                      value={admin.password}
                      onChange={e => setAdmin({ ...admin, password: e.target.value })}
                      required
                      type="password"
                      autoComplete="current-password"
                    />
                  </label>
                </div>

                <div className="FormActions">
                  <button className="Button Primary" type="submit" disabled={adminLoading}>
                    {adminLoading ? 'Signing in…' : 'Login'}
                  </button>
                </div>

                <div className="Hint">
                  Backend validates credentials using <code>ADMIN_USERNAME</code> and{' '}
                  <code>ADMIN_PASSWORD</code>.
                </div>
              </form>
            ) : (
              <div className="AdminPanel">
                <div className="AdminActions">
                  <button className="Button" onClick={handleRefreshRepairs} disabled={adminLoading}>
                    {adminLoading ? 'Refreshing…' : 'Refresh'}
                  </button>
                  <button
                    className="Button Ghost"
                    onClick={() => {
                      setAdminToken('');
                      setRepairs([]);
                      showToast('success', 'Logged out.');
                    }}
                  >
                    Logout
                  </button>
                </div>

                <div className="TableWrap" role="region" aria-label="Repair requests table">
                  <table className="Table">
                    <thead>
                      <tr>
                        <th>Created</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Device</th>
                        <th>Issue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {repairs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="EmptyCell">
                            No repair requests yet.
                          </td>
                        </tr>
                      ) : (
                        repairs.map((r, idx) => (
                          <tr key={r.id || idx}>
                            <td className="Mono">{r.created_at || '—'}</td>
                            <td>{r.name}</td>
                            <td className="Mono">{r.phone}</td>
                            <td>{r.device_type}</td>
                            <td className="Clamp">{r.issue_description}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="Footer">
        <span className="FooterText">
          © {new Date().getFullYear()} Mobile Web Service Repair Center
        </span>
      </footer>
    </div>
  );
}

export default App;
