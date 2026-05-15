import React, { useCallback, useEffect, useState } from 'react';
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
  green: '#22C55E',
  amber: '#F59E0B',
};

export default function PatientPanel({ doctorId, onLogout }) {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filterRisk, setFilterRisk] = useState('all'); // all, red, amber, green

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/api/doctors/${doctorId}/dashboard`
      );
      setPatients(response.data.patients || []);
    } catch (err) {
      console.error('Error loading patients:', err);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const filteredPatients = patients.filter((p) => {
    if (filterRisk === 'all') return true;
    return p.risk_badge.toLowerCase() === filterRisk.toLowerCase();
  });

  const handleLogout = () => {
    localStorage.removeItem('doctor_id');
    localStorage.removeItem('doctor_token');
    onLogout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingBox}>Loading patients...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Navigation Bar */}
      <div style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={styles.navBrand}>
            <span style={styles.logo}>❤️</span>
            <span style={styles.brandName}>OncoConnect</span>
          </div>

          <div style={styles.navLinks}>
            <a href="/dashboard" style={styles.navLink}>Dashboard</a>
            <a href="/patients" style={{ ...styles.navLink, color: COLORS.mint }}>
              Patients
            </a>
            <a href="/earnings" style={styles.navLink}>Earnings</a>
            <a href="/prescriptions" style={styles.navLink}>Prescriptions</a>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Patient Panel</h1>
            <p style={styles.subtitle}>
              {patients.length} patients linked to your profile
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div style={styles.filterContainer}>
          <button
            onClick={() => setFilterRisk('all')}
            style={{
              ...styles.filterButton,
              backgroundColor: filterRisk === 'all' ? COLORS.mint : COLORS.card,
              color: filterRisk === 'all' ? COLORS.navy : COLORS.text,
            }}
          >
            All Patients ({patients.length})
          </button>
          <button
            onClick={() => setFilterRisk('red')}
            style={{
              ...styles.filterButton,
              backgroundColor: filterRisk === 'red' ? COLORS.red : COLORS.card,
              color: COLORS.text,
            }}
          >
            🔴 High Risk ({patients.filter((p) => p.risk_badge === 'Red').length})
          </button>
          <button
            onClick={() => setFilterRisk('amber')}
            style={{
              ...styles.filterButton,
              backgroundColor: filterRisk === 'amber' ? COLORS.amber : COLORS.card,
              color: COLORS.text,
            }}
          >
            🟡 Medium ({patients.filter((p) => p.risk_badge === 'Amber').length})
          </button>
          <button
            onClick={() => setFilterRisk('green')}
            style={{
              ...styles.filterButton,
              backgroundColor: filterRisk === 'green' ? COLORS.green : COLORS.card,
              color: COLORS.text,
            }}
          >
            🟢 Low Risk ({patients.filter((p) => p.risk_badge === 'Green').length})
          </button>
        </div>

        {/* Patients Grid */}
        {filteredPatients.length > 0 ? (
          <div style={styles.grid}>
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                style={styles.patientCard}
              >
                <div style={styles.cardHeader}>
                  <div style={styles.patientBasic}>
                    <div style={styles.patientIcon}>👤</div>
                    <div>
                      <div style={styles.patientName}>{patient.auth_user?.full_name || `Patient ${patient.id.slice(0, 8)}`}</div>
                      <div style={styles.patientPhone}>Linked to you</div>
                    </div>
                  </div>
                  <div
                    style={{
                      ...styles.riskBadge,
                      backgroundColor:
                        patient.risk_badge === 'Red'
                          ? COLORS.red
                          : patient.risk_badge === 'Amber'
                          ? COLORS.amber
                          : COLORS.green,
                    }}
                  >
                    {patient.risk_badge}
                  </div>
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Cancer Type</span>
                    <span style={styles.infoValue}>{patient.cancer_type}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Status</span>
                    <span style={styles.infoValue}>{patient.treatment_status}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Risk Score</span>
                    <span style={styles.infoValue}>{patient.risk_score}/100</span>
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  <button style={styles.viewDetailButton}>View Details →</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>👥</div>
            <p style={styles.emptyText}>No patients found</p>
            <p style={styles.emptySubtext}>
              Share your invite code to get started
            </p>
          </div>
        )}

        {/* Patient Details Modal */}
        {selectedPatient && (
          <div style={styles.modalOverlay} onClick={() => setSelectedPatient(null)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Patient Details</h2>
                <button
                  style={styles.closeButton}
                  onClick={() => setSelectedPatient(null)}
                >
                  ×
                </button>
              </div>

              <div style={styles.modalBody}>
                <div style={styles.detailSection}>
                  <h3 style={styles.sectionTitle}>Medical Information</h3>
                  <div style={styles.detailItem}>
                    <span>Cancer Type:</span>
                    <span>{selectedPatient.cancer_type}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span>Treatment Status:</span>
                    <span>{selectedPatient.treatment_status}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span>Risk Score:</span>
                    <span>{selectedPatient.risk_score}/100</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span>Risk Level:</span>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor:
                          selectedPatient.risk_badge === 'Red'
                            ? COLORS.red
                            : selectedPatient.risk_badge === 'Amber'
                            ? COLORS.amber
                            : COLORS.green,
                      }}
                    >
                      {selectedPatient.risk_badge}
                    </span>
                  </div>
                </div>

                <div style={styles.detailSection}>
                  <h3 style={styles.sectionTitle}>Actions</h3>
                  <button style={styles.actionButton}>
                    📨 Send Message
                  </button>
                  <button style={styles.actionButton}>
                    📋 View Medical History
                  </button>
                  <button style={styles.actionButton}>
                    💊 Manage Medications
                  </button>
                  <button style={styles.actionButton}>
                    📊 View Symptom Logs
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
    marginBottom: '30px',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px',
  },
  patientCard: {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  cardHeader: {
    padding: '16px',
    borderBottom: `1px solid ${COLORS.navy}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientBasic: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  patientIcon: {
    fontSize: '32px',
  },
  patientName: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: '14px',
  },
  patientPhone: {
    color: COLORS.muted,
    fontSize: '11px',
    marginTop: '4px',
  },
  riskBadge: {
    color: COLORS.text,
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  cardBody: {
    padding: '16px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    fontSize: '13px',
  },
  infoLabel: {
    color: COLORS.muted,
  },
  infoValue: {
    color: COLORS.mint,
    fontWeight: '500',
  },
  cardFooter: {
    padding: '12px 16px',
    borderTop: `1px solid ${COLORS.navy}`,
  },
  viewDetailButton: {
    width: '100%',
    backgroundColor: COLORS.teal,
    color: COLORS.navy,
    border: 'none',
    borderRadius: '6px',
    padding: '8px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  emptyState: {
    backgroundColor: COLORS.card,
    borderRadius: '12px',
    padding: '60px 40px',
    textAlign: 'center',
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
    margin: 0,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  modal: {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '12px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
  },
  modalHeader: {
    padding: '20px',
    borderBottom: `1px solid ${COLORS.teal}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: '20px',
    fontWeight: 'bold',
    margin: 0,
  },
  closeButton: {
    backgroundColor: 'transparent',
    color: COLORS.muted,
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '20px',
  },
  detailSection: {
    marginBottom: '24px',
  },
  sectionTitle: {
    color: COLORS.mint,
    fontSize: '13px',
    fontWeight: '600',
    margin: '0 0 12px 0',
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: `1px solid ${COLORS.navy}`,
    fontSize: '13px',
  },
  actionButton: {
    width: '100%',
    backgroundColor: COLORS.teal,
    color: COLORS.navy,
    border: 'none',
    borderRadius: '6px',
    padding: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '8px',
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