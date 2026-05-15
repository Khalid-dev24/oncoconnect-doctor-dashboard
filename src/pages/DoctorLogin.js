import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const COLORS = {
  navy: '#0A1628',
  card: '#0F1E35',
  teal: '#0B8F8F',
  mint: '#0DD6C8',
  text: '#FFFFFF',
  muted: '#7A9EAE',
  red: '#EF4444',
};

export default function DoctorLogin({ onLogin }) {
  const [mdcn, setMdcn] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verify MDCN and phone match
      const response = await api.post(`/api/doctors/login`, {
        mdcn_number: mdcn,
        phone_number: phone,
      });

      if (response.status === 200) {
        onLogin(response.data.doctor.id, response.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.error || 'Invalid credentials. Please check your MDCN and phone number.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        <div style={styles.logo}>❤️</div>
        <h1 style={styles.title}>OncoConnect</h1>
        <p style={styles.subtitle}>Clinical Management for Oncologists</p>
        
        <div style={styles.features}>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>💰</span>
            <span style={styles.featureText}>Earn ₦28,000 per consultation</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>👥</span>
            <span style={styles.featureText}>Manage your patient panel</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>📱</span>
            <span style={styles.featureText}>Digital prescriptions with QR codes</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>📊</span>
            <span style={styles.featureText}>Real-time earnings dashboard</span>
          </div>
        </div>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          <h2 style={styles.formTitle}>Doctor Login</h2>
          <p style={styles.formSubtitle}>Access your patient panel and earnings</p>

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>MDCN Number</label>
              <input
                type="text"
                placeholder="e.g., MDCN/12345/2020"
                value={mdcn}
                onChange={(e) => setMdcn(e.target.value)}
                disabled={loading}
                style={styles.input}
              />
              <p style={styles.hint}>Your Medical and Dental Council registration number</p>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="tel"
                placeholder="08012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                style={styles.input}
              />
              <p style={styles.hint}>Phone number you registered with</p>
            </div>

            {error && (
              <div style={styles.errorBox}>
                <span style={styles.errorIcon}>⚠️</span>
                <span style={styles.errorText}>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Logging in...' : 'Login to Dashboard'}
            </button>
          </form>

          <div style={styles.divider}>or</div>

          <div style={styles.registerBox}>
            <p style={styles.registerText}>Don't have an account yet?</p>
            <button
              onClick={handleRegisterClick}
              style={styles.registerButton}
            >
              Register as Doctor
            </button>
          </div>

          <div style={styles.infoBox}>
            <p style={styles.infoTitle}>🔒 Why We Need This</p>
            <p style={styles.infoText}>
              We verify your MDCN against the Medical & Dental Council registry to ensure only licensed oncologists can register.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: COLORS.navy,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  leftPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.card} 100%)`,
  },
  logo: {
    fontSize: '80px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: COLORS.text,
    margin: '0 0 10px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: COLORS.mint,
    margin: '0 0 60px 0',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxWidth: '400px',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  featureIcon: {
    fontSize: '28px',
  },
  featureText: {
    color: COLORS.text,
    fontSize: '14px',
    lineHeight: '1.5',
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
  },
  formContainer: {
    width: '100%',
    maxWidth: '400px',
  },
  formTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: COLORS.text,
    margin: '0 0 8px 0',
  },
  formSubtitle: {
    fontSize: '14px',
    color: COLORS.muted,
    margin: '0 0 32px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: COLORS.mint,
    marginBottom: '8px',
  },
  input: {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '8px',
    padding: '12px 14px',
    color: COLORS.text,
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  hint: {
    fontSize: '12px',
    color: COLORS.muted,
    margin: '6px 0 0 0',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: `1px solid ${COLORS.red}`,
    borderRadius: '8px',
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  errorIcon: {
    fontSize: '16px',
  },
  errorText: {
    color: COLORS.red,
    fontSize: '13px',
  },
  button: {
    backgroundColor: COLORS.mint,
    color: COLORS.navy,
    border: 'none',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '8px',
  },
  divider: {
    textAlign: 'center',
    color: COLORS.muted,
    fontSize: '13px',
    margin: '24px 0',
    position: 'relative',
  },
  registerBox: {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
  },
  registerText: {
    color: COLORS.muted,
    fontSize: '13px',
    margin: '0 0 12px 0',
  },
  registerButton: {
    width: '100%',
    backgroundColor: COLORS.teal,
    color: COLORS.navy,
    border: 'none',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  infoBox: {
    backgroundColor: `rgba(11, 143, 143, 0.1)`,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '8px',
    padding: '14px',
    marginTop: '24px',
  },
  infoTitle: {
    color: COLORS.mint,
    fontSize: '13px',
    fontWeight: '600',
    margin: '0 0 6px 0',
  },
  infoText: {
    color: COLORS.muted,
    fontSize: '12px',
    lineHeight: '1.5',
    margin: 0,
  },
};