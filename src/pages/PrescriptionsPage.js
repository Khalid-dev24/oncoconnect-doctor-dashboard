import React, { useCallback, useEffect, useState } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import Navbar from '../components/Navbar';
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
  amber: '#F59E0B',
};

export default function PrescriptionsPage({ doctorId, onLogout }) {
  const { isMobile } = useResponsive();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [sendingPrescriptionId, setSendingPrescriptionId] = useState(null);

  const [formData, setFormData] = useState({
    patientId: '',
    drugName: '',
    dosage: '',
    frequency: 'once_daily',
    duration: '',
    instructions: '',
  });

  const loadPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/api/doctors/${doctorId}/prescriptions`
      );
      setPrescriptions(response.data.prescriptions || []);
    } catch (err) {
      console.error('Error loading prescriptions:', err);
      // Fallback to mock data if endpoint doesn't exist yet
      const mockPrescriptions = [
        {
          id: '1',
          patientId: 'patient-001',
          drugName: 'Tamoxifen',
          dosage: '20mg',
          frequency: 'once_daily',
          duration: '14 days',
          isActive: true,
          createdAt: '2026-05-10',
          qrCode: 'QR-001-VERIFIED',
          verified: true,
        },
      ];
      setPrescriptions(mockPrescriptions);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  const loadPatients = useCallback(async () => {
    try {
      const response = await api.get(`/api/doctors/${doctorId}/dashboard`);
      setPatients(response.data.patients || []);
    } catch (err) {
      console.error('Error loading patients:', err);
    }
  }, [doctorId]);

  useEffect(() => {
    loadPrescriptions();
    loadPatients();
  }, [loadPrescriptions, loadPatients]);

  const downloadPrescriptionPDF = async (prescriptionId) => {
    try {
      const response = await api.post(`/api/prescriptions/${prescriptionId}/generate-pdf`, {}, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription-${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download prescription. Please try again.');
    }
  };

  const viewPrescriptionPDF = async (prescriptionId) => {
    try {
      const response = await api.post(`/api/prescriptions/${prescriptionId}/generate-pdf`, {}, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error viewing PDF:', err);
      alert('Failed to view prescription. Please try again.');
    }
  };

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.auth_user?.full_name || patient?.user_id || 'Unknown Patient';
  };

  const sendPrescriptionToPatient = async (prescription) => {
    try {
      setSendingPrescriptionId(prescription.id);
      const response = await api.post(`/api/prescriptions/${prescription.id}/send-to-patient`, {
        messageText: `Your prescription for ${prescription.drug_name || prescription.drugName || 'your treatment'} is attached here.`,
      });

      if (response.data?.success) {
        alert('Prescription sent to the patient chat successfully.');
      } else {
        alert('Prescription was created, but the chat message could not be sent.');
      }
    } catch (err) {
      console.error('Error sending prescription to patient:', err);
      const errorMsg = err.response?.data?.error || err.message;
      alert(`Failed to send prescription: ${errorMsg}`);
    } finally {
      setSendingPrescriptionId(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        patient_id: formData.patientId,
        drug_name: formData.drugName,
        dosage: formData.dosage,
        frequency: formData.frequency,
        duration: formData.duration,
        instructions: formData.instructions,
        oncologist_id: doctorId,
      };

      await api.post('/api/prescriptions', payload);

      // Reset form and reload prescriptions
      setFormData({
        patientId: '',
        drugName: '',
        dosage: '',
        frequency: 'once_daily',
        duration: '',
        instructions: '',
      });
      setShowForm(false);
      await loadPrescriptions();
      alert('Prescription created successfully!');
    } catch (err) {
      console.error('Error creating prescription:', err);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      alert(`Failed to create prescription: ${errorMsg}`);
    }
  };

  const filteredPrescriptions = prescriptions.filter((p) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return true;
    return false;
  });

  if (loading) {
    return (
      <div style={styles.container}>
        <Navbar currentPage="prescriptions" onLogout={onLogout} />
        <div style={styles.loadingBox}>Loading prescriptions...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Navigation Bar */}
      <Navbar currentPage="prescriptions" onLogout={onLogout} />

      {/* Main Content */}
      <div style={{...styles.mainContent, ...(isMobile && { padding: '20px 12px' })}} className="responsive-padding-lg">
        {/* Header */}
        <div style={{...styles.header, ...(isMobile && { marginBottom: '24px', flexDirection: 'column', alignItems: 'flex-start', gap: '16px' })}}>
          <div>
            <h1 style={{...styles.title, ...(isMobile && { fontSize: '24px' })}}>Digital Prescriptions</h1>
            <p style={styles.subtitle}>
              Create and manage digital prescriptions with QR code verification
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{...styles.createButton, ...(isMobile && { width: '100%' })}}
          >
            {showForm ? '✕ Cancel' : '+ Create Prescription'}
          </button>
        </div>

        {/* Create Prescription Form */}
        {showForm && (
          <div style={styles.formSection}>
            <h2 style={styles.formTitle}>New Digital Prescription</h2>
            <form onSubmit={handleSubmitPrescription} style={styles.form}>
              <div style={{...styles.formGrid, ...(isMobile && { gridTemplateColumns: '1fr', gap: '12px' })}} data-grid="form2col">
                <div style={styles.formGroup}>
                  <label style={styles.label}>Patient</label>
                  <select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  >
                    <option value="">Select a patient...</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.auth_user?.full_name || patient.user_id}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Drug Name</label>
                  <input
                    type="text"
                    name="drugName"
                    placeholder="e.g., Tamoxifen"
                    value={formData.drugName}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Dosage</label>
                  <input
                    type="text"
                    name="dosage"
                    placeholder="e.g., 20mg"
                    value={formData.dosage}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Frequency</label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    style={styles.input}
                  >
                    <option value="once_daily">Once Daily</option>
                    <option value="twice_daily">Twice Daily</option>
                    <option value="thrice_daily">Three Times Daily</option>
                    <option value="as_needed">As Needed</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Duration</label>
                  <input
                    type="text"
                    name="duration"
                    placeholder="e.g., 14 days"
                    value={formData.duration}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Special Instructions</label>
                  <input
                    type="text"
                    name="instructions"
                    placeholder="e.g., Take with food"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formButtons}>
                <button type="submit" style={styles.submitButton}>
                  Generate Prescription
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>

              <div style={styles.infoBox}>
                <span style={styles.infoIcon}>ℹ️</span>
                <div>
                  <p style={styles.infoTitle}>Automatic QR Code Generation</p>
                  <p style={styles.infoText}>
                    Each prescription automatically gets a unique QR code for pharmacy verification.
                  </p>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Filter Buttons */}
        <div style={styles.filterContainer}>
          <button
            onClick={() => setFilterStatus('all')}
            style={{
              ...styles.filterButton,
              backgroundColor: filterStatus === 'all' ? COLORS.mint : COLORS.card,
              color: filterStatus === 'all' ? COLORS.navy : COLORS.text,
            }}
          >
            All Prescriptions ({prescriptions.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            style={{
              ...styles.filterButton,
              backgroundColor: filterStatus === 'active' ? COLORS.green : COLORS.card,
              color: COLORS.text,
            }}
          >
            ✓ Active ({prescriptions.filter((p) => p.isActive).length})
          </button>
          <button
            onClick={() => setFilterStatus('inactive')}
            style={{
              ...styles.filterButton,
              backgroundColor: filterStatus === 'inactive' ? COLORS.amber : COLORS.card,
              color: COLORS.text,
            }}
          >
            Inactive ({prescriptions.filter((p) => !p.isActive).length})
          </button>
        </div>

        {/* Prescriptions List */}
        {filteredPrescriptions.length > 0 ? (
          <div style={styles.prescriptionGrid}>
            {filteredPrescriptions.map((rx) => (
              <div key={rx.id} style={styles.prescriptionCard}>
                <div style={styles.cardHeader}>
                  <div>
                    <p style={styles.patientId}>Patient: {getPatientName(rx.patient_id || rx.patientId)}</p>
                  </div>
                  <div
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: COLORS.green,
                    }}
                  >
                    ✓ Active
                  </div>
                </div>

                <div style={styles.prescriptionDetails}>
                  <div style={styles.infoRow}>
                    <span style={styles.label}>Drug:</span>
                    <span style={styles.value}>{rx.drug_name || rx.drugName}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.label}>Dosage:</span>
                    <span style={styles.value}>{rx.dosage}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.label}>Frequency:</span>
                    <span style={styles.value}>
                      {(rx.frequency || '').replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.label}>Duration:</span>
                    <span style={styles.value}>{rx.duration}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.label}>Created:</span>
                    <span style={styles.value}>{rx.created_at ? new Date(rx.created_at).toLocaleDateString() : rx.createdAt}</span>
                  </div>
                </div>

                <div style={styles.qrSection}>
                  <div style={styles.qrCode}>📱 {rx.qr_code || rx.qrCode || `ID: ${rx.id?.slice(0, 8)}...`}</div>
                  <p style={styles.qrDescription}>
                    {rx.qr_code || rx.qrCode ? 'Unique code for pharmacy verification' : 'QR code available when downloaded'}
                  </p>
                </div>

                <div style={styles.cardActions}>
                  <button 
                    onClick={() => viewPrescriptionPDF(rx.id)}
                    style={styles.actionButton}
                  >
                    👁️ View PDF
                  </button>
                  <button 
                    onClick={() => downloadPrescriptionPDF(rx.id)}
                    style={styles.actionButton}
                  >
                    📥 Download
                  </button>
                  <button
                    onClick={() => sendPrescriptionToPatient(rx)}
                    disabled={sendingPrescriptionId === rx.id}
                    style={{
                      ...styles.actionButton,
                      opacity: sendingPrescriptionId === rx.id ? 0.7 : 1,
                    }}
                  >
                    {sendingPrescriptionId === rx.id ? 'Sending...' : '📤 Send to Patient'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>💊</div>
            <p style={styles.emptyText}>No prescriptions found</p>
            <p style={styles.emptySubtext}>
              Create your first digital prescription to get started
            </p>
            <button
              onClick={() => setShowForm(true)}
              style={styles.emptyButton}
            >
              Create Prescription
            </button>
          </div>
        )}

        {/* Features Section */}
        <div style={styles.featuresSection}>
          <h2 style={styles.featureTitle}>Why Digital Prescriptions?</h2>
          <div style={styles.featuresGrid}>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>📱</div>
              <h3 style={styles.featureName}>QR Code Verification</h3>
              <p style={styles.featureDesc}>
                Each prescription has a unique QR code. Pharmacists scan it to verify authenticity instantly.
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>✅</div>
              <h3 style={styles.featureName}>Instant Delivery</h3>
              <p style={styles.featureDesc}>
                Patient receives prescription immediately in their app. No delays, no paper.
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>📋</div>
              <h3 style={styles.featureName}>Complete Records</h3>
              <p style={styles.featureDesc}>
                All prescriptions stored digitally. Easy to track what you prescribed and when.
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🔒</div>
              <h3 style={styles.featureName}>Secure & Compliant</h3>
              <p style={styles.featureDesc}>
                Encrypted, NDPA-compliant, and legally valid in Nigeria and across Africa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: COLORS.navy,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  navbar: {
    backgroundColor: COLORS.card,
    borderBottom: `1px solid ${COLORS.teal}`,
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  navContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '70px',
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logo: {
    fontSize: '24px',
  },
  brandName: {
    color: COLORS.mint,
    fontWeight: 'bold',
    fontSize: '18px',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
  },
  navLink: {
    color: COLORS.muted,
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  logoutButton: {
    backgroundColor: COLORS.red,
    color: COLORS.text,
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  mainContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '40px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: COLORS.text,
    margin: 0,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: '14px',
    margin: '8px 0 0 0',
  },
  createButton: {
    backgroundColor: COLORS.mint,
    color: COLORS.navy,
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  formSection: {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '40px',
  },
  formTitle: {
    color: COLORS.text,
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 24px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    color: COLORS.mint,
    fontSize: '12px',
    fontWeight: '600',
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
  formButtons: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  submitButton: {
    backgroundColor: COLORS.mint,
    color: COLORS.navy,
    border: 'none',
    borderRadius: '6px',
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    flex: 1,
  },
  cancelButton: {
    backgroundColor: COLORS.card,
    color: COLORS.mint,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '6px',
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  infoBox: {
    backgroundColor: `rgba(11, 143, 143, 0.1)`,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    gap: '12px',
  },
  infoIcon: {
    fontSize: '16px',
  },
  infoTitle: {
    color: COLORS.mint,
    fontSize: '12px',
    fontWeight: '600',
    margin: '0 0 4px 0',
  },
  infoText: {
    color: COLORS.muted,
    fontSize: '11px',
    lineHeight: '1.5',
    margin: 0,
  },
  filterContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  filterButton: {
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  prescriptionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px',
    marginBottom: '40px',
  },
  prescriptionCard: {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '12px',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '18px',
    borderBottom: `1px solid ${COLORS.navy}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  drugName: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: '16px',
    margin: 0,
  },
  patientId: {
    color: COLORS.muted,
    fontSize: '12px',
    margin: '4px 0 0 0',
  },
  statusBadge: {
    color: COLORS.text,
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: '600',
  },
  prescriptionDetails: {
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    gap: '12px',
  },
  // eslint-disable-next-line no-dupe-keys
  label: {
    color: COLORS.muted,
    fontSize: '11px',
    fontWeight: '500',
    minWidth: '70px',
  },
  value: {
    color: COLORS.mint,
    fontWeight: '600',
    fontSize: '13px',
  },
  qrSection: {
    padding: '18px',
    backgroundColor: COLORS.navy,
    borderTop: `1px solid ${COLORS.card}`,
    borderBottom: `1px solid ${COLORS.card}`,
    textAlign: 'center',
  },
  qrCode: {
    color: COLORS.mint,
    fontFamily: 'monospace',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '6px',
  },
  qrDescription: {
    color: COLORS.muted,
    fontSize: '11px',
    margin: 0,
  },
  cardActions: {
    padding: '18px',
    display: 'flex',
    gap: '10px',
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.teal,
    color: COLORS.navy,
    border: 'none',
    borderRadius: '6px',
    padding: '12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  emptyState: {
    backgroundColor: COLORS.card,
    borderRadius: '12px',
    padding: '60px 40px',
    textAlign: 'center',
    marginBottom: '40px',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  emptyText: {
    color: COLORS.text,
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  emptySubtext: {
    color: COLORS.muted,
    fontSize: '13px',
    margin: '0 0 20px 0',
  },
  emptyButton: {
    backgroundColor: COLORS.mint,
    color: COLORS.navy,
    border: 'none',
    borderRadius: '6px',
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  featuresSection: {
    marginTop: '60px',
  },
  featureTitle: {
    color: COLORS.text,
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 24px 0',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
  },
  featureCard: {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
  },
  featureIcon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  featureName: {
    color: COLORS.mint,
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  featureDesc: {
    color: COLORS.muted,
    fontSize: '12px',
    lineHeight: '1.6',
    margin: 0,
  },
  loadingBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    color: COLORS.mint,
    fontSize: '16px',
  },
};