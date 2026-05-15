import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';
import api from '../services/api';

const COLORS = {
  navy: '#0A1628',
  card: '#0F1E35',
  teal: '#0B8F8F',
  mint: '#0DD6C8',
  text: '#FFFFFF',
  muted: '#7A9EAE',
  red: '#EF4444',
  green: '#22C55E',
};

export default function DoctorOnboarding({ onRegister }) {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  
  const [step, setStep] = useState(1); // 1: Info, 2: Bank, 3: Documents
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    phone_number: '',
    full_name: '',
    email: '',
    mdcn_number: '',
    hospital: '',
    specialty: 'Oncology',
    bank_name: '',
    bank_account_number: '',
    bank_account_name: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateStep1 = () => {
    if (!formData.phone_number || !formData.full_name || !formData.mdcn_number) {
      setError('Please fill in all required fields');
      return false;
    }
    if (formData.mdcn_number.length < 10) {
      setError('Invalid MDCN format');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!formData.bank_name || !formData.bank_account_number) {
      setError('Please fill in bank details');
      return false;
    }
    if (formData.bank_account_number.length < 10) {
      setError('Invalid bank account number');
      return false;
    }
    setError('');
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await api.post(`/api/doctors/register`, {
        phone_number: formData.phone_number,
        full_name: formData.full_name,
        email: formData.email,
        mdcn_number: formData.mdcn_number,
        hospital: formData.hospital,
        specialty: formData.specialty,
        bank_name: formData.bank_name,
        bank_account: formData.bank_account_number,
      });

      if (response.status === 201) {
        // For now, auto-login after registration
        onRegister(response.data.doctor.id, 'temp_token');
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{...styles.container, ...(isMobile && { padding: '20px 12px' })}}>
      <div style={{...styles.card, ...(isMobile && { padding: '20px' })}}>
        <div style={styles.header}>
          <button
            onClick={() => navigate('/login')}
            style={styles.backButton}
          >
            ← Back to Login
          </button>
          <h1 style={styles.title}>Register as Doctor</h1>
          <p style={styles.subtitle}>Complete your profile to start earning</p>
        </div>

        {/* Progress Indicator */}
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressStep, backgroundColor: COLORS.mint }}>
            <span style={styles.stepNumber}>1</span>
            <span style={styles.stepLabel}>Info</span>
          </div>
          <div style={styles.progressLine} />
          <div
            style={{
              ...styles.progressStep,
              backgroundColor: step >= 2 ? COLORS.mint : COLORS.card,
            }}
          >
            <span style={styles.stepNumber}>2</span>
            <span style={styles.stepLabel}>Bank</span>
          </div>
          <div style={styles.progressLine} />
          <div
            style={{
              ...styles.progressStep,
              backgroundColor: step >= 3 ? COLORS.mint : COLORS.card,
            }}
          >
            <span style={styles.stepNumber}>3</span>
            <span style={styles.stepLabel}>Review</span>
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div style={styles.formGroup}>
            <h2 style={styles.stepTitle}>Your Information</h2>

            <div style={{...styles.twoColumn, ...(isMobile && { gridTemplateColumns: '1fr', gap: '12px' })}} data-grid="form2col">
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  placeholder="Dr. Salami Ade"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Phone Number *</label>
                <input
                  type="tel"
                  name="phone_number"
                  placeholder="08012345678"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={{...styles.twoColumn, ...(isMobile && { gridTemplateColumns: '1fr', gap: '12px' })}} data-grid="form2col">
              <div style={styles.fieldGroup}>
                <label style={styles.label}>MDCN Number *</label>
                <input
                  type="text"
                  name="mdcn_number"
                  placeholder="MDCN/12345/2020"
                  value={formData.mdcn_number}
                  onChange={handleInputChange}
                  style={styles.input}
                />
                <p style={styles.hint}>We'll verify this with the Medical Council</p>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="dr.salami@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={{...styles.twoColumn, ...(isMobile && { gridTemplateColumns: '1fr', gap: '12px' })}} data-grid="form2col">
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Hospital/Clinic</label>
                <input
                  type="text"
                  name="hospital"
                  placeholder="LUTH, Lagos"
                  value={formData.hospital}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Specialty</label>
                <select
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  style={styles.input}
                >
                  <option>Oncology</option>
                  <option>Medical Oncology</option>
                  <option>Surgical Oncology</option>
                  <option>Radiation Oncology</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Bank Details */}
        {step === 2 && (
          <div style={styles.formGroup}>
            <h2 style={styles.stepTitle}>Bank Account Details</h2>
            <p style={styles.stepDescription}>
              Where should we send your earnings? Your payments arrive within 24 hours.
            </p>

            <div style={{...styles.twoColumn, ...(isMobile && { gridTemplateColumns: '1fr', gap: '12px' })}} data-grid="form2col">
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Bank Name *</label>
                <select
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleInputChange}
                  style={styles.input}
                >
                  <option value="">Select bank</option>
                  <option>Access Bank</option>
                  <option>GTBank</option>
                  <option>First Bank</option>
                  <option>UBA</option>
                  <option>Zenith Bank</option>
                  <option>Standard Chartered</option>
                  <option>Other</option>
                </select>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Account Number *</label>
                <input
                  type="text"
                  name="bank_account_number"
                  placeholder="1234567890"
                  value={formData.bank_account_number}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Account Holder Name</label>
              <input
                type="text"
                name="bank_account_name"
                placeholder="Your name as it appears on bank account"
                value={formData.bank_account_name}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>

            <div style={styles.infoBox}>
              <span style={styles.infoIcon}>🔒</span>
              <div>
                <p style={styles.infoTitle}>Your account is secure</p>
                <p style={styles.infoText}>
                  Bank details are encrypted and only used for payouts. We never share this information.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div style={styles.formGroup}>
            <h2 style={styles.stepTitle}>Review Your Information</h2>

            <div style={styles.reviewBox}>
              <div style={styles.reviewSection}>
                <h3 style={styles.reviewTitle}>Professional Details</h3>
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>Name:</span>
                  <span style={styles.reviewValue}>{formData.full_name}</span>
                </div>
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>MDCN:</span>
                  <span style={styles.reviewValue}>{formData.mdcn_number}</span>
                </div>
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>Hospital:</span>
                  <span style={styles.reviewValue}>{formData.hospital || 'Not provided'}</span>
                </div>
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>Phone:</span>
                  <span style={styles.reviewValue}>{formData.phone_number}</span>
                </div>
              </div>

              <div style={styles.reviewSection}>
                <h3 style={styles.reviewTitle}>Payment Account</h3>
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>Bank:</span>
                  <span style={styles.reviewValue}>{formData.bank_name}</span>
                </div>
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>Account:</span>
                  <span style={styles.reviewValue}>
                    ••••••••{formData.bank_account_number.slice(-4)}
                  </span>
                </div>
              </div>
            </div>

            <div style={styles.termsBox}>
              <input type="checkbox" style={styles.checkbox} required />
              <label style={styles.termsLabel}>
                I agree to the Terms of Service and understand I will earn 70% of each consultation fee
              </label>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>⚠️</span>
            <span style={styles.errorText}>{error}</span>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={styles.buttonGroup}>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              style={styles.secondaryButton}
              disabled={loading}
            >
              ← Back
            </button>
          )}
          
          {step < 3 ? (
            <button
              onClick={handleNextStep}
              style={styles.primaryButton}
              disabled={loading}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              style={styles.primaryButton}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Complete Registration'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: COLORS.navy,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
  },
  header: {
    marginBottom: '30px',
  },
  backButton: {
    backgroundColor: 'transparent',
    color: COLORS.mint,
    border: 'none',
    fontSize: '13px',
    cursor: 'pointer',
    marginBottom: '16px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: COLORS.text,
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: COLORS.muted,
    margin: 0,
  },
  progressBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '40px',
  },
  progressStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
  },
  stepNumber: {
    fontWeight: 'bold',
    fontSize: '16px',
    color: COLORS.navy,
  },
  stepLabel: {
    fontSize: '12px',
    color: COLORS.navy,
  },
  progressLine: {
    flex: 1,
    height: '2px',
    backgroundColor: COLORS.teal,
    margin: '0 8px',
  },
  formGroup: {
    marginBottom: '32px',
  },
  stepTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: COLORS.text,
    margin: '0 0 8px 0',
  },
  stepDescription: {
    color: COLORS.muted,
    fontSize: '13px',
    margin: '0 0 20px 0',
  },
  twoColumn: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: COLORS.mint,
    marginBottom: '6px',
  },
  input: {
    backgroundColor: COLORS.navy,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '6px',
    padding: '10px 12px',
    color: COLORS.text,
    fontSize: '13px',
    fontFamily: 'inherit',
    outline: 'none',
  },
  hint: {
    fontSize: '11px',
    color: COLORS.muted,
    margin: '4px 0 0 0',
  },
  infoBox: {
    backgroundColor: `rgba(11, 143, 143, 0.1)`,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '8px',
    padding: '14px',
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
  },
  infoIcon: {
    fontSize: '20px',
  },
  infoTitle: {
    color: COLORS.mint,
    fontSize: '13px',
    fontWeight: '600',
    margin: '0 0 4px 0',
  },
  infoText: {
    color: COLORS.muted,
    fontSize: '12px',
    lineHeight: '1.5',
    margin: 0,
  },
  reviewBox: {
    backgroundColor: COLORS.navy,
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  },
  reviewSection: {
    marginBottom: '20px',
  },
  reviewTitle: {
    color: COLORS.mint,
    fontSize: '13px',
    fontWeight: '600',
    margin: '0 0 12px 0',
  },
  reviewItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: `1px solid ${COLORS.card}`,
  },
  reviewLabel: {
    color: COLORS.muted,
    fontSize: '12px',
  },
  reviewValue: {
    color: COLORS.text,
    fontSize: '12px',
    fontWeight: '500',
  },
  termsBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px',
    backgroundColor: COLORS.navy,
    borderRadius: '6px',
  },
  checkbox: {
    marginTop: '4px',
    cursor: 'pointer',
  },
  termsLabel: {
    color: COLORS.muted,
    fontSize: '12px',
    lineHeight: '1.5',
    cursor: 'pointer',
  },
  errorBox: {
    backgroundColor: `rgba(239, 68, 68, 0.1)`,
    border: `1px solid ${COLORS.red}`,
    borderRadius: '8px',
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  errorIcon: {
    fontSize: '16px',
  },
  errorText: {
    color: COLORS.red,
    fontSize: '13px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  primaryButton: {
    backgroundColor: COLORS.mint,
    color: COLORS.navy,
    border: 'none',
    borderRadius: '6px',
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: COLORS.card,
    color: COLORS.mint,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '6px',
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};