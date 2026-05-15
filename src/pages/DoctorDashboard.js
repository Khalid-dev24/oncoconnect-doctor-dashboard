import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function DoctorDashboard({ doctorId, onLogout }) {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/api/doctors/${doctorId}/dashboard`
      );
      setDashboardData(response.data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const copyInviteCode = () => {
    navigator.clipboard.writeText(dashboardData?.doctor?.invite_code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('doctor_id');
    localStorage.removeItem('doctor_token');
    onLogout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Navbar currentPage="dashboard" onLogout={onLogout} />
        <div style={styles.loadingBox}>Loading your dashboard...</div>
      </div>
    );
  }

  const totalEarnings = dashboardData?.earnings?.total || 0;
  const monthlyEarnings = dashboardData?.earnings?.this_month || 0;
  const patientCount = dashboardData?.total_patients || 0;

  return (
    <div style={styles.container}>
      {/* Navigation Bar */}
      <Navbar currentPage="dashboard" onLogout={onLogout} />

      {/* Main Content */}
      <div style={{...styles.mainContent, ...(isMobile && { padding: '20px 12px' })}} className="responsive-padding-lg">
        {/* Header Section */}
        <div style={{...styles.header, ...(isMobile && { marginBottom: '24px' })}}>
          <div>
            <h1 style={{...styles.title, ...(isMobile && { fontSize: '24px' })}}>Welcome back, {dashboardData?.doctor?.name || 'Doctor'}</h1>
            <p style={styles.subtitle}>Here's your patient panel and earnings at a glance</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{...styles.statsGrid, ...(isMobile && { gridTemplateColumns: '1fr', gap: '12px' })}} data-grid="4col">
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{patientCount}</div>
              <div style={styles.statLabel}>Total Patients</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>💰</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>₦{(monthlyEarnings / 1000).toFixed(1)}K</div>
              <div style={styles.statLabel}>This Month</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>📊</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>₦{(totalEarnings / 1000).toFixed(1)}K</div>
              <div style={styles.statLabel}>Total Earned</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>✅</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>Active</div>
              <div style={styles.statLabel}>Status</div>
            </div>
          </div>
        </div>

        {/* Invite Code Section */}
        <div style={{...styles.inviteSection, ...(isMobile && { padding: '16px', flexDirection: 'column' })}} className="responsive-invite-content">
          <div style={{...styles.inviteContent, ...(isMobile && { flexDirection: 'column', alignItems: 'stretch', gap: '16px' })}}>
            <div>
              <h2 style={{...styles.sectionTitle, ...(isMobile && { fontSize: '18px' })}}>Share Your Invite Code</h2>
              <p style={styles.sectionDescription}>
                Give this code to patients to automatically link them to your profile. They'll enter it during registration.
              </p>
            </div>
            <div style={{...styles.inviteBox, ...(isMobile && { flexDirection: 'column', gap: '8px', width: '100%' })}} className="invite-box">
              <input
                type="text"
                value={dashboardData?.doctor?.invite_code || ''}
                readOnly
                style={{...styles.inviteInput, ...(isMobile && { minHeight: '48px', width: '100%' })}}
              />
              <button onClick={copyInviteCode} style={{...styles.copyButton, ...(isMobile && { width: '100%', minHeight: '48px' })}}>
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Patient Panel */}
        <div style={styles.patientSection}>
          <h2 style={styles.sectionTitle}>Patient Panel</h2>
          <p style={styles.sectionDescription}>
            {patientCount} patients are linked to your profile
          </p>

          {dashboardData?.patients && dashboardData.patients.length > 0 ? (
            <div style={{...styles.patientGrid, ...(isMobile && { gridTemplateColumns: '1fr' })}} data-grid="autofill">
              {dashboardData.patients.map((patient) => (
                <div key={patient.id} style={styles.patientCard}>
                  <div style={styles.patientHeader}>
                    <div style={styles.patientName}>{patient.auth_user?.full_name || patient.user_id}</div>
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
                  <div style={styles.patientInfo}>
                    <p style={styles.infoRow}>
                      <span>Cancer:</span>
                      <span style={styles.infoValue}>{patient.cancer_type}</span>
                    </p>
                    <p style={styles.infoRow}>
                      <span>Status:</span>
                      <span style={styles.infoValue}>{patient.treatment_status}</span>
                    </p>
                    <p style={styles.infoRow}>
                      <span>Risk Score:</span>
                      <span style={styles.infoValue}>{patient.risk_score}/100</span>
                    </p>
                  </div>
                  <button style={styles.viewButton}>View Details</button>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>👥</div>
              <p style={styles.emptyText}>No patients yet</p>
              <p style={styles.emptySubtext}>
                Share your invite code with patients to get started
              </p>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div style={styles.transactionSection}>
          <h2 style={styles.sectionTitle}>Recent Transactions</h2>
          {dashboardData?.earnings?.recent_transactions &&
          dashboardData.earnings.recent_transactions.length > 0 ? (
            <div style={styles.transactionList}>
              {dashboardData.earnings.recent_transactions.map((tx, idx) => (
                <div key={idx} style={styles.transactionItem}>
                  <div style={styles.txInfo}>
                    <div style={styles.txTitle}>
                      {(tx.payment_type || tx.status || 'Payment').replace('_', ' ').toUpperCase()}
                    </div>
                    <div style={styles.txDate}>
                      {new Date(tx.paid_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={styles.txAmount}>
                    +₦{(tx.doctor_share || 0).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyTransaction}>
              <p>No transactions yet</p>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div style={styles.ctaSection}>
          <div style={styles.ctaContent}>
            <h3 style={styles.ctaTitle}>Ready to see your patients?</h3>
            <p style={styles.ctaText}>
              Go to the patient panel to see detailed information about each patient, their symptoms, and manage consultations.
            </p>
            <button
              onClick={() => navigate('/patients')}
              style={styles.ctaButton}
            >
              View Patient Panel →
            </button>
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
    transition: 'color 0.2s',
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '40px',
  },
  statCard: {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statIcon: {
    fontSize: '32px',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: COLORS.mint,
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: '12px',
    marginTop: '4px',
  },
  inviteSection: {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '40px',
  },
  inviteContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '32px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: COLORS.text,
    margin: '0 0 8px 0',
  },
  sectionDescription: {
    color: COLORS.muted,
    fontSize: '13px',
    margin: 0,
  },
  inviteBox: {
    display: 'flex',
    gap: '8px',
  },
  inviteInput: {
    backgroundColor: COLORS.navy,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '6px',
    padding: '10px 14px',
    color: COLORS.text,
    fontSize: '14px',
    fontWeight: 'bold',
    minWidth: '200px',
    textAlign: 'center',
  },
  copyButton: {
    backgroundColor: COLORS.mint,
    color: COLORS.navy,
    border: 'none',
    borderRadius: '6px',
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  patientSection: {
    marginBottom: '40px',
  },
  patientGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  patientCard: {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '12px',
    padding: '16px',
  },
  patientHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  patientName: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: '14px',
  },
  riskBadge: {
    color: COLORS.text,
    borderRadius: '4px',
    padding: '4px 12px',
    fontSize: '11px',
    fontWeight: '600',
  },
  patientInfo: {
    marginBottom: '12px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    margin: '6px 0',
  },
  infoValue: {
    color: COLORS.mint,
    fontWeight: '500',
  },
  viewButton: {
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
    padding: '40px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyText: {
    color: COLORS.text,
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  emptySubtext: {
    color: COLORS.muted,
    fontSize: '13px',
    margin: 0,
  },
  transactionSection: {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '40px',
  },
  transactionList: {
    marginTop: '16px',
  },
  transactionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: `1px solid ${COLORS.navy}`,
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    color: COLORS.text,
    fontSize: '13px',
    fontWeight: '600',
  },
  txDate: {
    color: COLORS.muted,
    fontSize: '11px',
    marginTop: '4px',
  },
  txAmount: {
    color: COLORS.green,
    fontWeight: 'bold',
    fontSize: '14px',
  },
  emptyTransaction: {
    textAlign: 'center',
    padding: '24px',
    color: COLORS.muted,
    fontSize: '13px',
  },
  ctaSection: {
    backgroundColor: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.mint})`,
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center',
  },
  ctaContent: {
    maxWidth: '500px',
    margin: '0 auto',
  },
  ctaTitle: {
    color: COLORS.navy,
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '0 0 12px 0',
  },
  ctaText: {
    color: COLORS.navy,
    fontSize: '13px',
    margin: '0 0 20px 0',
    lineHeight: '1.6',
  },
  ctaButton: {
    backgroundColor: COLORS.navy,
    color: COLORS.mint,
    border: 'none',
    borderRadius: '6px',
    padding: '12px 24px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
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